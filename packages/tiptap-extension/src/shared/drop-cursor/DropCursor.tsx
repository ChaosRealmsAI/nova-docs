/**
 * 拖放引导线 UI 组件
 *
 * 职责：纯视觉反馈
 * - 显示横线（Block间插入）
 * - 显示竖线（Columns边缘）
 * - 使用CSS变量主题集成
 */

import React from 'react'
import './drop-cursor.css'

export interface DropCursorProps {
  /** 引导线方向 */
  orientation: 'horizontal' | 'vertical'

  /** 位置信息（由外部计算） */
  position: {
    top?: number | string
    left?: number | string
    width?: number | string
    height?: number | string
  }

  /** 是否允许放置 */
  isAllowed?: boolean

  /** 放置边（竖线专用） */
  side?: 'left' | 'right'

  /** 是否为列边缘 */
  isColumnEdge?: boolean

  /** 是否可见 */
  visible?: boolean

  /** 自定义类名 */
  className?: string
}

/**
 * 引导线组件（一比一复刻参考代码样式）
 */
export const DropCursor: React.FC<DropCursorProps> = (props) => {
  const {
    orientation,
    position,
    isAllowed = true,
    side,
    isColumnEdge = false,
    visible = true,
    className
  } = props

  if (!visible) return null

  const classNames = [
    'syllo-dropcursor',
    `syllo-dropcursor--${orientation}`,
    isColumnEdge && orientation === 'vertical' ? 'column-edge' : '',
    !isAllowed ? 'not-allowed' : '',
    className || ''
  ].filter(Boolean).join(' ')

  const style: React.CSSProperties = {
    position: 'absolute',
    ...position,
    pointerEvents: 'none',
    zIndex: 9999
  }

  return (
    <div
      className={classNames}
      style={style}
      data-orientation={orientation}
      data-side={side}
      data-allowed={isAllowed}
    />
  )
}

DropCursor.displayName = 'DropCursor'
