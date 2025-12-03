/**
 * 拖拽句柄 UI 组件（一比一复刻飞书风格）
 *
 * 职责：纯UI渲染
 * - 显示6点拖拽图标
 * - 显示节点类型图标（H1/H2等）
 * - 显示折叠按钮（可选）
 * - 提供拖拽事件回调
 */

import React from 'react'
import { cn } from '@nova/shared'
import { useI18n } from '@nova/shared/i18n'
import { getNodeTypeIcon, DragHandleIcon, FoldIcon, PlusIcon } from './icons'
import './drag-handle.css'

export interface DragHandleProps {
  /** 节点类型 */
  nodeType: string

  /** 节点属性（用于获取标题level等） */
  nodeAttrs?: Record<string, any>

  /** 是否可见 */
  visible?: boolean

  /** 是否显示折叠按钮 */
  showFoldButton?: boolean

  /** 是否已折叠 */
  isFolded?: boolean

  /** 是否为空节点 */
  isEmpty?: boolean

  /** 拖拽开始回调 */
  onDragStart?: (e: React.DragEvent) => void

  /** 拖拽结束回调 */
  onDragEnd?: () => void

  /** 折叠按钮点击回调 */
  onFoldClick?: (e: React.MouseEvent) => void

  /** 菜单按钮点击回调 */
  onMenuClick?: (e: React.MouseEvent) => void

  /** 自定义样式 */
  style?: React.CSSProperties

  /** 自定义类名 */
  className?: string
}

export const DragHandle: React.FC<DragHandleProps> = ({
  nodeType,
  nodeAttrs = {},
  visible = false,
  showFoldButton = false,
  isFolded = false,
  isEmpty = false,
  onDragStart,
  onDragEnd,
  onFoldClick,
  onMenuClick,
  style,
  className
}) => {
  const { t } = useI18n()
  // 计算宽度（标题和有折叠按钮的节点需要更宽）
  const isHeading = nodeType === 'heading' || nodeType === 'numberedHeading'
  const hasNestedContent = ['bulletList', 'orderedList', 'taskList'].includes(nodeType)
  const wrapperWidth = (isHeading || showFoldButton || hasNestedContent) ? 48 : 36

  // 获取节点类型图标
  const typeIcon = getNodeTypeIcon(nodeType, nodeAttrs)

  // 渲染折叠按钮
  const renderFoldButton = () => {
    if (!showFoldButton && !isHeading) return null

    return (
      <div
        className="feishu-fold-btn"
        onClick={(e) => {
          e.stopPropagation()
          onFoldClick?.(e)
        }}
        title={isFolded ? t('handleExpand') : t('handleCollapse')}
      >
        <FoldIcon className={cn('w-3 h-3 transition-transform', isFolded && '-rotate-90')} />
      </div>
    )
  }

  // 空节点特殊渲染
  if (isEmpty) {
    return (
      <div
        className={`feishu-menu-trigger ${className || ''}`}
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          ...style
        }}
        onClick={onMenuClick}
      >
        <div className="feishu-menu-wrapper empty-node-wrapper">
          <div className="feishu-type-icon" dangerouslySetInnerHTML={{ __html: PlusIcon }} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`feishu-menu-trigger ${className || ''}`}
      data-node-type={nodeType}
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        ...style
      }}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div
        className={`feishu-menu-wrapper ${
          isHeading ? 'heading-with-fold' : hasNestedContent ? 'list-with-fold' : ''
        }`}
        style={{
          width: wrapperWidth
        }}
      >
        {/* 折叠按钮（在左侧） */}
        {renderFoldButton()}

        {/* 节点类型图标 */}
        <div className="feishu-type-icon">
          <span dangerouslySetInnerHTML={{ __html: typeIcon }} />
        </div>

        {/* 拖拽手柄图标 */}
        <div className="feishu-drag-handle">
          <span dangerouslySetInnerHTML={{ __html: DragHandleIcon }} />
        </div>
      </div>
    </div>
  )
}

DragHandle.displayName = 'DragHandle'
