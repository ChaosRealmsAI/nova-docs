/**
 * useSlashMenu Hook
 *
 * 管理斜杠菜单的状态和操作
 * 直接监听编辑器的键盘事件，避免扩展配置的循环依赖
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/core'

export interface SlashMenuState {
  /** 菜单是否打开 */
  open: boolean
  /** 菜单位置 */
  position: { x: number; y: number }
}

export interface SlashMenuActions {
  /** 关闭菜单 */
  close: () => void
  /** 选择块类型 */
  selectBlockType: (type: string) => void
  /** 鼠标进入菜单 */
  onMouseEnter: () => void
  /** 鼠标离开菜单 */
  onMouseLeave: () => void
}

interface UseSlashMenuOptions {
  editor: Editor | null
}

export function useSlashMenu({ editor }: UseSlashMenuOptions): SlashMenuState & SlashMenuActions {
  const [state, setState] = useState<SlashMenuState>({
    open: false,
    position: { x: 0, y: 0 },
  })

  // 跟踪鼠标是否在菜单内
  const isMouseInMenuRef = useRef(false)
  // 记录触发时的光标位置
  const triggerPosRef = useRef<number | null>(null)

  const close = useCallback(() => {
    // 如果鼠标在菜单内，不关闭
    if (isMouseInMenuRef.current) return

    setState(prev => ({
      ...prev,
      open: false,
    }))
    triggerPosRef.current = null
  }, [])

  const forceClose = useCallback(() => {
    setState(prev => ({
      ...prev,
      open: false,
    }))
    triggerPosRef.current = null
    isMouseInMenuRef.current = false
  }, [])

  const onMouseEnter = useCallback(() => {
    isMouseInMenuRef.current = true
  }, [])

  const onMouseLeave = useCallback(() => {
    isMouseInMenuRef.current = false
  }, [])

  // 生成唯一 ID
  const generateId = useCallback(() => {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // 选择块类型后的处理 - 将当前空节点转换为选中的节点类型
  const selectBlockType = useCallback((type: string) => {
    if (!editor) return

    const { state: editorState } = editor.view
    const { $from } = editorState.selection

    // 获取当前节点的范围
    const nodeStart = $from.before()
    const nodeEnd = $from.after()

    // 使用事务替换当前节点
    const { tr } = editorState
    const schema = editorState.schema

    // 根据类型创建新节点并替换
    switch (type) {
      case 'heading1':
        if (schema.nodes.heading) {
          const newNode = schema.nodes.heading.create({ level: 1, id: generateId() })
          editor.view.dispatch(tr.replaceWith(nodeStart, nodeEnd, newNode))
          editor.commands.focus()
        }
        break
      case 'heading2':
        if (schema.nodes.heading) {
          const newNode = schema.nodes.heading.create({ level: 2, id: generateId() })
          editor.view.dispatch(tr.replaceWith(nodeStart, nodeEnd, newNode))
          editor.commands.focus()
        }
        break
      case 'heading3':
        if (schema.nodes.heading) {
          const newNode = schema.nodes.heading.create({ level: 3, id: generateId() })
          editor.view.dispatch(tr.replaceWith(nodeStart, nodeEnd, newNode))
          editor.commands.focus()
        }
        break
      case 'numberedList':
        if (schema.nodes.orderedList && schema.nodes.listItem && schema.nodes.paragraph) {
          const paragraph = schema.nodes.paragraph.create({ id: generateId() })
          const listItem = schema.nodes.listItem.create(null, paragraph)
          const newNode = schema.nodes.orderedList.create({ id: generateId() }, listItem)
          editor.view.dispatch(tr.replaceWith(nodeStart, nodeEnd, newNode))
          editor.commands.focus()
        }
        break
      case 'bulletList':
        if (schema.nodes.bulletList && schema.nodes.listItem && schema.nodes.paragraph) {
          const paragraph = schema.nodes.paragraph.create({ id: generateId() })
          const listItem = schema.nodes.listItem.create(null, paragraph)
          const newNode = schema.nodes.bulletList.create({ id: generateId() }, listItem)
          editor.view.dispatch(tr.replaceWith(nodeStart, nodeEnd, newNode))
          editor.commands.focus()
        }
        break
      case 'todoList':
        if (schema.nodes.taskList && schema.nodes.taskItem && schema.nodes.paragraph) {
          const paragraph = schema.nodes.paragraph.create({ id: generateId() })
          const taskItem = schema.nodes.taskItem.create({ checked: false }, paragraph)
          const newNode = schema.nodes.taskList.create({ id: generateId() }, taskItem)
          editor.view.dispatch(tr.replaceWith(nodeStart, nodeEnd, newNode))
          editor.commands.focus()
        }
        break
      case 'code':
        if (schema.nodes.codeBlock) {
          const newNode = schema.nodes.codeBlock.create({ id: generateId(), language: 'javascript' })
          editor.view.dispatch(tr.replaceWith(nodeStart, nodeEnd, newNode))
          editor.commands.focus()
        }
        break
      case 'quote':
        if (schema.nodes.blockquote && schema.nodes.paragraph) {
          const paragraph = schema.nodes.paragraph.create({ id: generateId() })
          const newNode = schema.nodes.blockquote.create({ id: generateId() }, paragraph)
          editor.view.dispatch(tr.replaceWith(nodeStart, nodeEnd, newNode))
          editor.commands.focus()
        }
        break
      case 'table':
        // 表格使用 insertTable 命令，但先删除当前节点
        editor.chain()
          .focus()
          .command(({ tr, dispatch }) => {
            if (dispatch) {
              tr.delete(nodeStart, nodeEnd)
            }
            return true
          })
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run()
        break
      case 'columns':
        if (schema.nodes.columns && schema.nodes.column && schema.nodes.paragraph) {
          const para1 = schema.nodes.paragraph.create({ id: generateId() })
          const para2 = schema.nodes.paragraph.create({ id: generateId() })
          const col1 = schema.nodes.column.create({ id: generateId() }, para1)
          const col2 = schema.nodes.column.create({ id: generateId() }, para2)
          const newNode = schema.nodes.columns.create({ columns: 2, columnWidths: [50, 50], id: generateId() }, [col1, col2])
          editor.view.dispatch(tr.replaceWith(nodeStart, nodeEnd, newNode))
          editor.commands.focus()
        }
        break
      case 'callout':
        if (schema.nodes.callout && schema.nodes.paragraph) {
          const paragraph = schema.nodes.paragraph.create({ id: generateId() })
          const newNode = schema.nodes.callout.create({ theme: 'blue', emoji: '💡', id: generateId() }, paragraph)
          editor.view.dispatch(tr.replaceWith(nodeStart, nodeEnd, newNode))
          editor.commands.focus()
        }
        break
      default:
        break
    }

    // 关闭菜单
    forceClose()
  }, [editor, forceClose, generateId])

  // 监听编辑器键盘事件
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC 键关闭菜单
      if (event.key === 'Escape' && state.open) {
        forceClose()
        return
      }

      // 检测是否输入 "/"
      if (event.key === '/') {
        const { state: editorState } = editor.view
        const { selection } = editorState
        const { $from } = selection

        // 只在空行或行首触发
        const isAtLineStart = $from.parentOffset === 0
        const isEmptyLine = $from.parent.textContent === ''

        if (isAtLineStart || isEmptyLine) {
          // 记录触发位置
          triggerPosRef.current = $from.pos

          // 延迟触发，让 "/" 先插入到文档中
          setTimeout(() => {
            // 获取当前节点的 DOM 元素
            const resolvedPos = editor.state.selection.$from
            const node = resolvedPos.parent
            const nodeStart = resolvedPos.before()

            // 尝试获取节点的 DOM 元素
            let domNode = editor.view.nodeDOM(nodeStart)
            if (!domNode) {
              // 如果获取不到，使用光标位置
              const coords = editor.view.coordsAtPos($from.pos)
              setState({
                open: true,
                position: {
                  x: coords.left,
                  y: coords.bottom + 4,
                },
              })
              return
            }

            // 获取 DOM 元素的边界
            const element = domNode instanceof HTMLElement ? domNode : (domNode as Text).parentElement
            if (element) {
              const rect = element.getBoundingClientRect()
              setState({
                open: true,
                position: {
                  x: rect.left,
                  y: rect.bottom + 4, // 在节点下方显示
                },
              })
            } else {
              // 降级方案：使用光标坐标
              const coords = editor.view.coordsAtPos($from.pos)
              setState({
                open: true,
                position: {
                  x: coords.left,
                  y: coords.bottom + 4,
                },
              })
            }
          }, 0)
        }
      }
    }

    // 使用 DOM 事件监听，而不是 Tiptap 的事件系统
    const editorElement = editor.view.dom
    editorElement.addEventListener('keydown', handleKeyDown)

    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor, state.open, forceClose])

  // 监听编辑器文档变化，如果用户继续输入其他字符则关闭菜单
  useEffect(() => {
    if (!editor || !state.open) return

    const handleUpdate = () => {
      // 检查光标位置前是否还有 "/"
      const { state: editorState } = editor.view
      const { from } = editorState.selection
      const textBefore = editorState.doc.textBetween(Math.max(0, from - 1), from)

      // 如果 "/" 被删除或用户输入了其他字符，关闭菜单
      if (textBefore !== '/') {
        // 延迟检查，避免选择时的瞬间状态
        setTimeout(() => {
          if (!isMouseInMenuRef.current) {
            forceClose()
          }
        }, 50)
      }
    }

    editor.on('update', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, state.open, forceClose])

  // 监听编辑器失焦
  useEffect(() => {
    if (!editor || !state.open) return

    const handleBlur = () => {
      // 延迟关闭，避免点击菜单时立即关闭
      setTimeout(() => {
        if (!isMouseInMenuRef.current) {
          forceClose()
        }
      }, 200)
    }

    editor.on('blur', handleBlur)

    return () => {
      editor.off('blur', handleBlur)
    }
  }, [editor, state.open, forceClose])

  return {
    ...state,
    close,
    selectBlockType,
    onMouseEnter,
    onMouseLeave,
  }
}
