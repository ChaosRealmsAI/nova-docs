/**
 * TipTap 专用多列容器
 *
 * 职责：
 * - 复用 MultiColumnContainer 的样式
 * - 使用 TipTap NodeViewContent 渲染可编辑内容
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from '@tiptap/react'
import '@nova/domain-editor/shared/ui/multi-column/multi-column.css'
import { COLUMN_GAP, MAX_COLUMNS, type ColumnWidths, type HandlePosition } from '../../model'
import { WidthCalculator, ColumnOperations } from '../../service'
import { loggers } from '@nova/infrastructure/logger'

export const TipTapColumnsContainer: React.FC<ReactNodeViewProps> = ({
  node,
  editor,
  getPos,
  updateAttributes,
}) => {
  // 状态管理
  const [isDragging, setIsDragging] = useState(false)
  const [activeHandleIndex, setActiveHandleIndex] = useState(-1)
  const [isHovered, setIsHovered] = useState(false)
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(() =>
    WidthCalculator.initializeWidths(node.content.childCount)
  )
  const [handlePositions, setHandlePositions] = useState<HandlePosition[]>([])
  const layoutMode: 'stacked' | 'grid' = node.attrs.layout || 'grid'
  const stacked = layoutMode === 'stacked'

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const startWidths = useRef<ColumnWidths>([])
  const currentWidthsRef = useRef<ColumnWidths>(columnWidths) // 用于在拖拽结束时获取最新值
  const isDraggingRef = useRef(false) // 用于在 effect 中检查拖拽状态

  // 同步节点属性 → 状态（拖拽期间跳过，避免覆盖本地状态）
  useEffect(() => {
    if (isDraggingRef.current) return // 拖拽期间不同步
    if (WidthCalculator.shouldSyncWidths(node.attrs.columnWidths, columnWidths)) {
      setColumnWidths(node.attrs.columnWidths)
    }
  }, [node.attrs.columnWidths, node.content.childCount, columnWidths])

  // 保持 ref 与状态同步，用于拖拽结束时获取最新值
  useEffect(() => {
    currentWidthsRef.current = columnWidths
  }, [columnWidths])

  // 调试：检查渲染后的DOM结构
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        loggers.multiColumn.debug( '🏗️ DOM结构检查')
        loggers.multiColumn.debug( '📦 Container className', { className: containerRef.current.className })
        loggers.multiColumn.debug( '📦 Container computedStyle', {
          display: window.getComputedStyle(containerRef.current).display,
          gridTemplateColumns: window.getComputedStyle(containerRef.current).gridTemplateColumns,
        })

        const contentGrid = containerRef.current.querySelector('.columns-content-grid')
        if (contentGrid) {
          loggers.multiColumn.debug( '📋 Content Grid computedStyle', {
            display: window.getComputedStyle(contentGrid).display,
            gridTemplateColumns: window.getComputedStyle(contentGrid).gridTemplateColumns,
          })
        }

        const columns = containerRef.current.querySelectorAll('[data-type="column"]')
        loggers.multiColumn.debug( '📐 Columns', Array.from(columns).map((col, i) => ({
          index: i,
          className: col.className,
          display: window.getComputedStyle(col).display,
          width: col.getBoundingClientRect().width,
        })))
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [node.content.childCount])

  // 计算手柄位置（基于实际DOM位置）
  useEffect(() => {
    const container = containerRef.current
    if (!container || stacked) {
      setHandlePositions([])
      return
    }

    const calculatePositions = () => {
      loggers.multiColumn.debug( '开始计算手柄位置')
      loggers.multiColumn.debug( 'Container 元素', { container })
      loggers.multiColumn.debug( 'Container HTML', { html: container.outerHTML.substring(0, 500) })

      // 获取实际渲染的 column 元素
      // 增加 .multi-column-item 选择器作为后备，以防 data-type 属性丢失
      const columns = container.querySelectorAll('[data-type="column"], .multi-column-item')
      loggers.multiColumn.debug( '找到 column 元素数量', { count: columns.length })

      if (columns.length === 0) {
        loggers.multiColumn.warn( '没有找到 column 元素')
        loggers.multiColumn.debug( 'Container 的所有子元素', Array.from(container.children).map(c => ({
          tagName: c.tagName,
          className: c.className,
          dataType: c.getAttribute('data-type'),
        })))
        setHandlePositions([])
        return
      }

      const containerRect = container.getBoundingClientRect()
      const positions: HandlePosition[] = []

      // 基于实际DOM位置计算手柄位置
      columns.forEach((col, index) => {
        const rect = col.getBoundingClientRect()
        loggers.multiColumn.debug( `Column ${index}`, {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          computedStyle: window.getComputedStyle(col).display,
        })

        if (index < columns.length - 1) {
          const nextCol = columns[index + 1]
          const nextRect = nextCol.getBoundingClientRect()
          // 拖拽线在两列中间
          const position = (rect.right + nextRect.left) / 2 - containerRect.left
          loggers.multiColumn.debug( `Handle ${index} position`, { position })
          positions.push({
            index,
            position,
          })
        }
      })

      loggers.multiColumn.debug( '最终手柄位置', { positions })
      setHandlePositions(positions)
    }

    // 延迟计算，确保DOM已渲染
    const timer = setTimeout(calculatePositions, 0)

    if (typeof ResizeObserver === 'undefined') {
      return () => clearTimeout(timer)
    }

    const resizeObserver = new ResizeObserver(calculatePositions)
    resizeObserver.observe(container)

    // 监听 DOM 变化（例如列内容异步渲染）
    const mutationObserver = new MutationObserver(calculatePositions)
    mutationObserver.observe(container, {
      childList: true,
      subtree: true, // NodeViewContent 可能包含包装层，所以需要监听子树
    })

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [columnWidths, node.content.childCount, stacked])

  // 添加列
  const handleAddColumn = useCallback(
    (afterIndex: number) => {
      if (typeof getPos !== 'function') return

      const pos = getPos() as number
      const success = ColumnOperations.addColumn({
        editor,
        node,
        nodePos: pos,
        afterIndex,
        currentWidths: columnWidths,
      })

      if (success) {
        const newWidths = WidthCalculator.widthsAfterAddColumn(columnWidths.length + 1)
        setColumnWidths(newWidths)
      }
    },
    [columnWidths, editor, getPos, node]
  )

  // 拖拽处理
  const handleDragStart = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      isDraggingRef.current = true // 同步更新 ref
      setActiveHandleIndex(index)
      dragStartX.current = e.clientX
      startWidths.current = [...columnWidths]

      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return

        const deltaX = e.clientX - dragStartX.current
        const containerWidth = containerRef.current.offsetWidth

        const result = WidthCalculator.calculateResizedWidths({
          deltaX,
          containerWidth,
          currentWidths: startWidths.current,
          leftIndex: index,
          rightIndex: index + 1,
        })

        if (result.changed) {
          // 拖拽过程中只更新本地状态，不触发 ProseMirror 文档更新
          setColumnWidths(result.newWidths)
        }
      }

      const handleMouseUp = () => {
        // 拖拽结束时才持久化到文档，使用 ref 获取最新值
        updateAttributes({ columnWidths: currentWidthsRef.current })
        setIsDragging(false)
        isDraggingRef.current = false // 同步更新 ref
        setActiveHandleIndex(-1)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [columnWidths, updateAttributes]
  )

  // 计算标签位置（基于实际DOM位置）
  const calculateLabelPosition = useCallback(
    (index: number) => {
      if (!containerRef.current) {
        return { left: '0px', width: '0px' }
      }

      // 获取实际渲染的 column 元素
      const columns = containerRef.current.querySelectorAll('[data-type="column"], .multi-column-item')
      const column = columns[index]
      if (!column) {
        return { left: '0px', width: '0px' }
      }

      const containerRect = containerRef.current.getBoundingClientRect()
      const colRect = column.getBoundingClientRect()

      return {
        left: `${colRect.left - containerRect.left}px`,
        width: `${colRect.width}px`,
      }
    },
    []
  )

  // 样式和渲染
  const gridTemplate = stacked ? '1fr' : columnWidths.map((w) => `${w}fr`).join(' ')
  const shouldShowStyles = isHovered || isDragging
  const canAddColumn = columnWidths.length < MAX_COLUMNS

  // 构建 Grid 样式（匹配老项目的实现方式）
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: gridTemplate,
    gap: `${COLUMN_GAP}px`,
    minHeight: '100px',
  }

  loggers.multiColumn.debug( '🎨 渲染信息:', {
    columnCount: node.content.childCount,
    columnWidths,
    gridTemplate,
    stacked,
    gridStyle,
  })

  return (
    <NodeViewWrapper
      className="columns-view-grid"
      data-show-styles={shouldShowStyles}
      data-dragging={isDragging}
      data-stacked={stacked ? 'true' : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={containerRef} className="columns-container-grid" style={gridStyle}>
        {/* 使用 NodeViewContent 渲染所有列 */}
        <NodeViewContent className="columns-content-grid" as="div" />

        {/* 百分比标签 - 仅拖拽时显示 */}
        {!stacked && isDragging &&
          columnWidths.map((width, index) => {
            const { left, width: widthStyle } = calculateLabelPosition(index)
            return (
              <div
                key={`label-${index}`}
                className="percent-label-wrapper"
                style={{ left, width: widthStyle }}
              >
                <span>{Math.round(width)}%</span>
              </div>
            )
          })}

        {/* 拖拽手柄 - 需要时显示 */}
        {!stacked && shouldShowStyles &&
          handlePositions.map(({ index, position }) => (
            <div
              key={`handle-${index}`}
              className={`multi-column-resize-handle ${index === activeHandleIndex && isDragging ? 'active' : ''}`}
              style={{ left: `${position}px` }}
              onMouseDown={(e) => handleDragStart(index, e)}
            >
              {canAddColumn && (
                <div className="add-column-area">
                  <div className="column-dot-indicator" />
                  <button
                    className="add-column-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddColumn(index)
                    }}
                    title="添加列"
                  >
                    <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16.153 20.721A10.999 10.999 0 0022 11c0-6.075-4.925-11-11-11S0 4.925 0 11c0 4.213 2.369 7.873 5.847 9.721L11 24l5.153-3.279z"
                        fill="var(--primary, #3370ff)"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.45 6a.2.2 0 00-.2.2v4.05H6.2a.2.2 0 00-.2.2v1.1c0 .11.09.2.2.2h4.05v4.05c0 .11.09.2.2.2h1.1a.2.2 0 00.2-.2v-4.05h4.05a.2.2 0 00.2-.2v-1.1a.2.2 0 00-.2-.2h-4.05V6.2a.2.2 0 00-.2-.2h-1.1z"
                        fill="#fff"
                      />
                    </svg>
                  </button>
                </div>
              )}
              <div className="resize-handle-dragger" />
            </div>
          ))}
      </div>
    </NodeViewWrapper>
  )
}
