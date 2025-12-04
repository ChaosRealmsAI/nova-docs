/**
 * Table Add Controls Plugin
 *
 * 在表格行/列边界 hover 时显示加号按钮，点击可插入行或列
 * 类似 Notion 的表格交互
 */

import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { addRowAfter, addRowBefore, addColumnAfter, addColumnBefore } from '@tiptap/pm/tables'
import { TextSelection } from '@tiptap/pm/state'

export const tableAddControlsPluginKey = new PluginKey('table-add-controls')

interface ControlState {
  type: 'row' | 'column' | 'none'
  index: number
  position: { x: number; y: number }
  tableElement: HTMLElement | null
}

const HOVER_THRESHOLD = 8 // 距离边界多少像素内触发

export function createTableAddControlsPlugin() {
  let controlsContainer: HTMLDivElement | null = null
  let currentState: ControlState = { type: 'none', index: -1, position: { x: 0, y: 0 }, tableElement: null }

  // 创建加号按钮容器
  function createControlsContainer(): HTMLDivElement {
    const container = document.createElement('div')
    container.className = 'table-add-controls-container'
    container.innerHTML = `
      <div class="table-add-control table-add-row" style="display: none;">
        <div class="table-add-line"></div>
        <button class="table-add-button" data-action="add-row">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="table-add-control table-add-column" style="display: none;">
        <div class="table-add-line"></div>
        <button class="table-add-button" data-action="add-column">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `
    document.body.appendChild(container)
    return container
  }

  // 隐藏所有控件
  function hideControls() {
    if (!controlsContainer) return
    const rowControl = controlsContainer.querySelector('.table-add-row') as HTMLElement
    const columnControl = controlsContainer.querySelector('.table-add-column') as HTMLElement
    if (rowControl) rowControl.style.display = 'none'
    if (columnControl) columnControl.style.display = 'none'
    currentState = { type: 'none', index: -1, position: { x: 0, y: 0 }, tableElement: null }
  }

  // 显示行添加控件
  function showRowControl(x: number, y: number, width: number) {
    if (!controlsContainer) return
    const rowControl = controlsContainer.querySelector('.table-add-row') as HTMLElement
    const columnControl = controlsContainer.querySelector('.table-add-column') as HTMLElement
    if (columnControl) columnControl.style.display = 'none'
    if (rowControl) {
      rowControl.style.display = 'flex'
      rowControl.style.left = `${x}px`
      rowControl.style.top = `${y}px`
      rowControl.style.width = `${width}px`
    }
  }

  // 显示列添加控件
  function showColumnControl(x: number, y: number, height: number) {
    if (!controlsContainer) return
    const rowControl = controlsContainer.querySelector('.table-add-row') as HTMLElement
    const columnControl = controlsContainer.querySelector('.table-add-column') as HTMLElement
    if (rowControl) rowControl.style.display = 'none'
    if (columnControl) {
      columnControl.style.display = 'flex'
      columnControl.style.left = `${x}px`
      columnControl.style.top = `${y}px`
      columnControl.style.height = `${height}px`
    }
  }

  // 检测鼠标位置，判断是否在边界附近
  function detectBoundary(
    event: MouseEvent,
    view: EditorView
  ): ControlState {
    const target = event.target as HTMLElement
    const table = target.closest('table')
    if (!table) {
      return { type: 'none', index: -1, position: { x: 0, y: 0 }, tableElement: null }
    }

    const tableRect = table.getBoundingClientRect()
    const mouseX = event.clientX
    const mouseY = event.clientY

    // 检测行边界（在单元格之间的水平边界）
    const rows = table.querySelectorAll('tr')
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as HTMLElement
      const rowRect = row.getBoundingClientRect()

      // 检测行底部边界
      if (Math.abs(mouseY - rowRect.bottom) < HOVER_THRESHOLD) {
        return {
          type: 'row',
          index: i + 1, // 在此行后插入
          position: { x: tableRect.left, y: rowRect.bottom },
          tableElement: table
        }
      }

      // 检测行顶部边界（第一行上方）
      if (i === 0 && Math.abs(mouseY - rowRect.top) < HOVER_THRESHOLD) {
        return {
          type: 'row',
          index: 0, // 在第一行前插入
          position: { x: tableRect.left, y: rowRect.top },
          tableElement: table
        }
      }
    }

    // 检测列边界（在单元格之间的垂直边界）
    const firstRow = rows[0]
    if (firstRow) {
      const cells = firstRow.querySelectorAll('td, th')
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i] as HTMLElement
        const cellRect = cell.getBoundingClientRect()

        // 检测单元格右边界
        if (Math.abs(mouseX - cellRect.right) < HOVER_THRESHOLD) {
          return {
            type: 'column',
            index: i + 1, // 在此列后插入
            position: { x: cellRect.right, y: tableRect.top },
            tableElement: table
          }
        }

        // 检测第一个单元格左边界
        if (i === 0 && Math.abs(mouseX - cellRect.left) < HOVER_THRESHOLD) {
          return {
            type: 'column',
            index: 0, // 在第一列前插入
            position: { x: cellRect.left, y: tableRect.top },
            tableElement: table
          }
        }
      }
    }

    return { type: 'none', index: -1, position: { x: 0, y: 0 }, tableElement: null }
  }

  // 选中表格中的某个单元格
  function selectCellAt(view: EditorView, table: HTMLElement, rowIndex: number, colIndex: number): boolean {
    const rows = table.querySelectorAll('tr')
    if (rowIndex < 0 || rowIndex >= rows.length) return false

    const row = rows[rowIndex]
    const cells = row.querySelectorAll('td, th')
    if (colIndex < 0 || colIndex >= cells.length) return false

    const cell = cells[colIndex] as HTMLElement

    try {
      // 获取单元格内第一个文本位置
      const cellPos = view.posAtDOM(cell, 0)

      if (cellPos !== null && cellPos >= 0) {
        const { state, dispatch } = view
        // 确保位置在文档范围内
        const resolvedPos = state.doc.resolve(Math.min(cellPos, state.doc.content.size))
        const tr = state.tr.setSelection(TextSelection.near(resolvedPos))
        dispatch(tr)
        view.focus()
        return true
      }
    } catch (e) {
      console.error('selectCellAt error:', e)
    }
    return false
  }

  // 插入行
  function insertRow(view: EditorView, tableElement: HTMLElement, index: number) {
    const rows = tableElement.querySelectorAll('tr')
    const rowCount = rows.length

    // 确定要选中的行和使用的命令
    let targetRow: number
    let useAddBefore: boolean

    if (index === 0) {
      targetRow = 0
      useAddBefore = true
    } else if (index >= rowCount) {
      targetRow = rowCount - 1
      useAddBefore = false
    } else {
      targetRow = index
      useAddBefore = true
    }

    // 先选中目标行的第一个单元格
    if (selectCellAt(view, tableElement, targetRow, 0)) {
      // 延迟执行命令，确保选区已更新
      setTimeout(() => {
        const { state, dispatch } = view
        if (useAddBefore) {
          addRowBefore(state, dispatch)
        } else {
          addRowAfter(state, dispatch)
        }
      }, 0)
    }
  }

  // 插入列
  function insertColumn(view: EditorView, tableElement: HTMLElement, index: number) {
    const firstRow = tableElement.querySelector('tr')
    if (!firstRow) return

    const cells = firstRow.querySelectorAll('td, th')
    const colCount = cells.length

    let targetCol: number
    let useAddBefore: boolean

    if (index === 0) {
      targetCol = 0
      useAddBefore = true
    } else if (index >= colCount) {
      targetCol = colCount - 1
      useAddBefore = false
    } else {
      targetCol = index
      useAddBefore = true
    }

    if (selectCellAt(view, tableElement, 0, targetCol)) {
      setTimeout(() => {
        const { state, dispatch } = view
        if (useAddBefore) {
          addColumnBefore(state, dispatch)
        } else {
          addColumnAfter(state, dispatch)
        }
      }, 0)
    }
  }

  return new Plugin({
    key: tableAddControlsPluginKey,

    view(editorView) {
      controlsContainer = createControlsContainer()

      // 点击事件处理
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        const button = target.closest('.table-add-button') as HTMLElement
        if (!button) return

        event.preventDefault()
        event.stopPropagation()

        const action = button.dataset.action
        if (action === 'add-row' && currentState.type === 'row' && currentState.tableElement) {
          insertRow(editorView, currentState.tableElement, currentState.index)
        } else if (action === 'add-column' && currentState.type === 'column' && currentState.tableElement) {
          insertColumn(editorView, currentState.tableElement, currentState.index)
        }

        hideControls()
      }

      controlsContainer.addEventListener('click', handleClick)

      // 鼠标移动事件
      const handleMouseMove = (event: MouseEvent) => {
        const newState = detectBoundary(event, editorView)

        if (newState.type === 'none') {
          // 检查鼠标是否在控件上
          const isOnControls = controlsContainer?.contains(event.target as Node)
          if (!isOnControls) {
            hideControls()
          }
          return
        }

        currentState = newState

        if (newState.tableElement) {
          const tableRect = newState.tableElement.getBoundingClientRect()

          if (newState.type === 'row') {
            showRowControl(
              tableRect.left + window.scrollX,
              newState.position.y + window.scrollY,
              tableRect.width
            )
          } else if (newState.type === 'column') {
            showColumnControl(
              newState.position.x + window.scrollX,
              tableRect.top + window.scrollY,
              tableRect.height
            )
          }
        }
      }

      // 鼠标离开编辑器
      const handleMouseLeave = (event: MouseEvent) => {
        // 延迟隐藏，允许鼠标移动到控件上
        setTimeout(() => {
          const isOnControls = controlsContainer?.contains(document.activeElement)
          if (!isOnControls) {
            // hideControls()
          }
        }, 100)
      }

      document.addEventListener('mousemove', handleMouseMove)
      editorView.dom.addEventListener('mouseleave', handleMouseLeave)

      return {
        destroy() {
          document.removeEventListener('mousemove', handleMouseMove)
          editorView.dom.removeEventListener('mouseleave', handleMouseLeave)
          if (controlsContainer) {
            controlsContainer.removeEventListener('click', handleClick)
            controlsContainer.remove()
            controlsContainer = null
          }
        }
      }
    }
  })
}
