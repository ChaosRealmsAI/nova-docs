/**
 * Handle Display Types
 *
 * 句柄展示功能的类型定义
 */

import type { Node as PMNode } from '@tiptap/pm/model'

/**
 * 句柄可见性模式
 */
export type HandleVisibilityMode = 'default-hidden' | 'default-visible'

/**
 * 句柄样式配置
 */
export interface HandleStyleConfig {
  /** 初始透明度 */
  initialOpacity: string
  /** 初始 pointer-events */
  initialPointerEvents: 'none' | 'auto'
  /** 隐藏时透明度 */
  hiddenOpacity: string
  /** 隐藏时 pointer-events */
  hiddenPointerEvents: 'none' | 'auto'
  /** 可见时透明度 */
  visibleOpacity: string
  /** 可见时 pointer-events */
  visiblePointerEvents: 'none' | 'auto'
}

/**
 * 句柄展示选项
 */
export interface HandleDisplayOptions {
  /** 是否启用 hover 检测 */
  enableHover?: boolean
  /** 可见性模式 */
  visibilityMode?: HandleVisibilityMode
  /** 句柄距离节点左侧的偏移量（像素） */
  offset?: number
  /** 节点类型白名单（如果不提供则使用默认） */
  draggableNodeTypes?: string[]
  /** 结构化路径白名单，例如 doc > callout > paragraph */
  draggableNodePaths?: string[]
}

/**
 * 句柄状态
 */
export interface HandleState {
  /** 节点唯一标识 */
  nodeId: string
  /** 节点在文档中的位置 */
  pos: number
  /** ProseMirror 节点 */
  node: PMNode
  /** 是否可见 */
  visible: boolean
  /** 句柄 DOM 元素 */
  handleElement?: HTMLElement
}

/**
 * Hover 检测结果
 */
export interface HoverResult {
  /** 节点唯一标识 */
  nodeId: string
  /** 节点在文档中的位置 */
  pos: number
  /** 是否可拖拽 */
  isDraggable: boolean
  /** ProseMirror 节点 */
  node: PMNode
}
