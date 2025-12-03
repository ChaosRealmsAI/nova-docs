/**
 * 多列容器组件（一比一复刻HTML实现）
 *
 * 职责：提供可调节宽度的多列布局
 * - 支持2-7列布局
 * - 列宽可拖拽调整
 * - 支持添加/删除列
 * - 显示列宽百分比
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@nova/shared'
import './multi-column.css'
import { MULTI_COLUMN_STACK_BREAKPOINT } from './constants'

const CONSTANTS = {
  MAX_COLUMNS: 7,
  MIN_COLUMN_WIDTH: 5,
  COLUMN_GAP: 12,
  HANDLE_WIDTH: 24
}

export interface MultiColumnContainerProps {
  /** 初始列数 */
  initialColumns?: number
  /** 初始列宽（百分比数组） */
  initialWidths?: number[]
  /** 是否显示样式（边框等） */
  showStyles?: boolean
  /** 列内容 */
  children?: React.ReactNode[]
  /** 列宽变化回调 */
  onWidthsChange?: (widths: number[]) => void
  /** 列数变化回调 */
  onColumnsChange?: (count: number) => void
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 自定义类名 */
  className?: string
  /** 强制使用纵向堆叠模式（禁用横向网格） */
  forceStacked?: boolean
}

/**
 * 多列容器组件
 */
export const MultiColumnContainer: React.FC<MultiColumnContainerProps> = ({
  initialColumns = 3,
  initialWidths,
  showStyles = false,
  children = [],
  onWidthsChange,
  onColumnsChange,
  style,
  className,
  forceStacked,
}) => {
  // 初始化列宽
  const initWidths = useCallback(() => {
    if (initialWidths && initialWidths.length === initialColumns) {
      return initialWidths
    }
    const widthPerColumn = 100 / initialColumns
    return Array(initialColumns).fill(widthPerColumn)
  }, [initialColumns, initialWidths])

  const [columnWidths, setColumnWidths] = useState<number[]>(initWidths)
  const [isDragging, setIsDragging] = useState(false)
  const [activeHandleIndex, setActiveHandleIndex] = useState(-1)
  const [isHovered, setIsHovered] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  const [handlePositions, setHandlePositions] = useState<{ index: number; position: number }[]>([])
  const [autoStacked, setAutoStacked] = useState(false)
  const stacked = forceStacked ?? autoStacked

  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const startWidths = useRef<number[]>([])
  const columnRefs = useRef<(HTMLDivElement | null)[]>([])

  // 计算拖拽手柄位置
  const calculateHandlePositions = useCallback(() => {
    if (!containerRef.current || stacked) return []

    const columns = columnRefs.current.filter(Boolean) as HTMLDivElement[]
    const containerRect = containerRef.current.getBoundingClientRect()
    const positions: { index: number; position: number }[] = []

    columns.forEach((col, index) => {
      if (index < columns.length - 1) {
        const rect = col.getBoundingClientRect()
        const nextRect = columns[index + 1].getBoundingClientRect()
        // 拖拽线在两列中间：当前列右边缘和下一列左边缘的中间
        const position = (rect.right + nextRect.left) / 2 - containerRect.left
        positions.push({ index, position })
      }
    })

    return positions
  }, [stacked])

  // 计算百分比标签位置
  const calculateLabelPosition = useCallback((index: number) => {
    if (!containerRef.current || !columnRefs.current[index]) {
      return { left: '0px', width: '0px' }
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const colRect = columnRefs.current[index]!.getBoundingClientRect()

    return {
      left: `${colRect.left - containerRect.left}px`,
      width: `${colRect.width}px`
    }
  }, [])

  // 更新手柄位置
  const updateHandlePositions = useCallback(() => {
    if (stacked) {
      setHandlePositions([])
      return
    }
    const positions = calculateHandlePositions()
    setHandlePositions(positions)
  }, [calculateHandlePositions, stacked])

  // 拖拽开始
  const handleDragStart = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setActiveHandleIndex(index)
    dragStartX.current = e.clientX
    startWidths.current = [...columnWidths]
  }, [columnWidths])

  // 拖拽移动
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const deltaX = e.clientX - dragStartX.current
    const containerWidth = containerRef.current.offsetWidth
    const deltaPercent = (deltaX / containerWidth) * 100

    const newWidths = [...startWidths.current]
    const leftIndex = activeHandleIndex
    const rightIndex = activeHandleIndex + 1

    let newLeftWidth = startWidths.current[leftIndex] + deltaPercent
    let newRightWidth = startWidths.current[rightIndex] - deltaPercent

    if (newLeftWidth < CONSTANTS.MIN_COLUMN_WIDTH) {
      newLeftWidth = CONSTANTS.MIN_COLUMN_WIDTH
      newRightWidth = startWidths.current[leftIndex] + startWidths.current[rightIndex] - newLeftWidth
    }
    if (newRightWidth < CONSTANTS.MIN_COLUMN_WIDTH) {
      newRightWidth = CONSTANTS.MIN_COLUMN_WIDTH
      newLeftWidth = startWidths.current[leftIndex] + startWidths.current[rightIndex] - newRightWidth
    }

    newWidths[leftIndex] = newLeftWidth
    newWidths[rightIndex] = newRightWidth

    setColumnWidths(newWidths)
    onWidthsChange?.(newWidths)
  }, [isDragging, activeHandleIndex, onWidthsChange])

  // 拖拽结束
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setActiveHandleIndex(-1)
  }, [])

  // 添加列
  const addColumnAt = useCallback((afterIndex: number) => {
    if (columnWidths.length >= CONSTANTS.MAX_COLUMNS) {
      return
    }

    const newColumnWidth = 15
    const newWidths = [...columnWidths]
    const totalReduction = newColumnWidth
    const reductionPerColumn = totalReduction / newWidths.length

    for (let i = 0; i < newWidths.length; i++) {
      newWidths[i] = Math.max(CONSTANTS.MIN_COLUMN_WIDTH, newWidths[i] - reductionPerColumn)
    }

    newWidths.splice(afterIndex + 1, 0, newColumnWidth)

    const sum = newWidths.reduce((a, b) => a + b, 0)
    const normalizedWidths = newWidths.map(w => (w / sum) * 100)

    setColumnWidths(normalizedWidths)
    onWidthsChange?.(normalizedWidths)
    onColumnsChange?.(normalizedWidths.length)
  }, [columnWidths, onWidthsChange, onColumnsChange])

  // 设置列数（保留以备将来使用）
  /*
  const setColumns = useCallback((count: number) => {
    if (count < 2 || count > CONSTANTS.MAX_COLUMNS) {
      return
    }

    const widthPerColumn = 100 / count
    const newWidths = Array(count).fill(widthPerColumn)
    setColumnWidths(newWidths)
    onWidthsChange?.(newWidths)
    onColumnsChange?.(count)
  }, [onWidthsChange, onColumnsChange])
  */

  // 更新视图状态
  const shouldShowStyles = isHovered || hasFocus || isDragging

  // 根据容器宽度决定是否降级为纵向布局
  useEffect(() => {
    if (forceStacked !== undefined) {
      return
    }

    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
      return
    }

    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setAutoStacked(entry.contentRect.width <= MULTI_COLUMN_STACK_BREAKPOINT)
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [columnWidths.length, forceStacked])

  // 监听拖拽事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
      return () => {
        document.removeEventListener('mousemove', handleDragMove)
        document.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  // 监听窗口大小变化
  useEffect(() => {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
      return
    }

    const container = containerRef.current
    if (!container || stacked) {
      updateHandlePositions()
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      updateHandlePositions()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [updateHandlePositions, stacked])

  // 初始化手柄位置
  useEffect(() => {
    if (stacked) {
      setHandlePositions([])
      return
    }
    const timer = setTimeout(() => {
      updateHandlePositions()
    }, 0)
    return () => clearTimeout(timer)
  }, [columnWidths, updateHandlePositions, stacked])

  // Grid template
  const gridTemplate = stacked ? '1fr' : columnWidths.map(w => `${w}fr`).join(' ')

  return (
    <div
      className={cn('columns-view-grid', className)}
      data-show-styles={shouldShowStyles || showStyles}
      data-dragging={isDragging}
      data-stacked={stacked ? 'true' : undefined}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={containerRef}
        className="columns-container-grid"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        <div
          className="columns-content-grid"
        >
          {columnWidths.map((_width, index) => {
            const content = children[index] || (
              <p>第 {index + 1} 列</p>
            )

            return (
              <div
                key={index}
                ref={el => columnRefs.current[index] = el}
                data-type="column"
              >
                <div
                  className="column-content"
                  contentEditable
                  suppressContentEditableWarning
                  onFocus={() => setHasFocus(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      if (!containerRef.current?.querySelector('.column-content:focus')) {
                        setHasFocus(false)
                      }
                    }, 0)
                  }}
                >
                  {content}
                </div>
              </div>
            )
          })}
        </div>

        {/* 百分比标签 */}
        {!stacked && columnWidths.map((width, index) => {
          const pos = calculateLabelPosition(index)
          return (
            <div
              key={`label-${index}`}
              className="percent-label-wrapper"
              style={{ left: pos.left, width: pos.width }}
            >
              <span>{Math.round(width)}%</span>
            </div>
          )
        })}

        {/* 拖拽手柄 */}
        {!stacked && handlePositions.map(({ index, position }) => (
          <div
            key={`handle-${index}`}
            className={cn('multi-column-resize-handle', {
              active: index === activeHandleIndex && isDragging
            })}
            style={{ left: `${position}px` }}
            onMouseDown={(e) => handleDragStart(index, e)}
          >
            {columnWidths.length < CONSTANTS.MAX_COLUMNS && (
              <div className="add-column-area">
                <div className="column-dot-indicator" />
                <button
                  className="add-column-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    addColumnAt(index)
                  }}
                  title="添加列"
                >
                  <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.153 20.721A10.999 10.999 0 0022 11c0-6.075-4.925-11-11-11S0 4.925 0 11c0 4.213 2.369 7.873 5.847 9.721L11 24l5.153-3.279z"
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
    </div>
  )
}

MultiColumnContainer.displayName = 'MultiColumnContainer'

// 导出常量供外部使用
export { CONSTANTS as MULTI_COLUMN_CONSTANTS }
