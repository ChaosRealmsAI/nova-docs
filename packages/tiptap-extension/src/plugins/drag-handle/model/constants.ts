/**
 * Handle Display Constants
 *
 * 句柄展示功能的常量配置
 */

import type { HandleStyleConfig, HandleVisibilityMode } from './types'

/**
 * 句柄可见性预设配置
 */
export const HANDLE_VISIBILITY_PRESETS: Record<HandleVisibilityMode, HandleStyleConfig> = {
  'default-hidden': {
    initialOpacity: '0',
    initialPointerEvents: 'auto',  // ✅ 改为 auto，保持鼠标事件响应
    hiddenOpacity: '0',
    hiddenPointerEvents: 'auto',   // ✅ 改为 auto，保持鼠标事件响应
    visibleOpacity: '1',
    visiblePointerEvents: 'auto'
  },
  'default-visible': {
    initialOpacity: '0.3',
    initialPointerEvents: 'auto',
    hiddenOpacity: '0.3',
    hiddenPointerEvents: 'auto',
    visibleOpacity: '1',
    visiblePointerEvents: 'auto'
  }
}

/**
 * 可拖拽节点类型白名单
 *
 * 这些节点类型会显示拖拽句柄
 */
export const DRAGGABLE_NODE_TYPES = [
  'paragraph',
  'heading',
  'callout',
  'codeBlock',
  'mermaid',
  'blockquote',
  'bulletList',
  'orderedList',
  'taskList',
  'taskItem'
]

/**
 * 结构化白名单：按照 doc 层级（doc > parent > child）定义
 */
export const DRAGGABLE_NODE_PATHS = [
  // ========== 文档直接子节点 ==========
  'doc > paragraph',
  'doc > heading',
  'doc > blockquote',
  'doc > codeBlock',
  'doc > mermaid',
  'doc > horizontalRule',
  'doc > image',
  'doc > table',
  'doc > callout',
  // 整体列表可拖拽
  'doc > bulletList',
  'doc > orderedList',

  // ========== Callout 容器内部元素 ==========
  // callout 本身可拖拽（上面已定义）
  // callout 内的特定元素
  'doc > callout > paragraph',
  'doc > callout > heading',
  'doc > callout > blockquote',
  'doc > callout > codeBlock',
  'doc > callout > mermaid',
  'doc > callout > image',
  'doc > callout > table',
  // callout 内的整体列表可拖拽
  'doc > callout > bulletList',
  'doc > callout > orderedList',
  'doc > callout > taskList',

  // ========== Columns 布局 ==========
  // 整个 columns 容器 - 禁止拖拽
  // 'doc > columns',

  // 单个列不允许拖拽
  // 'doc > columns > column',

  // columns 内的特定元素
  'doc > columns > column > paragraph',
  'doc > columns > column > heading',
  'doc > columns > column > blockquote',
  'doc > columns > column > codeBlock',
  'doc > columns > column > mermaid',
  'doc > columns > column > image',
  'doc > columns > column > table',
  'doc > columns > column > callout',
  // columns 内的整体列表可拖拽
  'doc > columns > column > bulletList',
  'doc > columns > column > orderedList',
  // columns 内 callout 的内部元素
  'doc > columns > column > callout > paragraph',
  'doc > columns > column > callout > heading',
  'doc > columns > column > callout > blockquote',
  'doc > columns > column > callout > codeBlock',
  'doc > columns > column > callout > mermaid',
  'doc > columns > column > callout > image',
  'doc > columns > column > callout > table',
  'doc > columns > column > callout > bulletList',
  'doc > columns > column > callout > orderedList',

  // ========== Flex Columns 布局（columnsFlex）==========
  // columnsFlex 容器和单个列本身不允许拖拽
  // 'doc > columnsFlex',
  // 'doc > columnsFlex > column',

  // columnsFlex 内的特定元素
  'doc > columnsFlex > column > paragraph',
  'doc > columnsFlex > column > heading',
  'doc > columnsFlex > column > blockquote',
  'doc > columnsFlex > column > codeBlock',
  'doc > columnsFlex > column > mermaid',
  'doc > columnsFlex > column > image',
  'doc > columnsFlex > column > table',
  'doc > columnsFlex > column > callout',
  // columnsFlex 内的整体列表可拖拽
  'doc > columnsFlex > column > bulletList',
  'doc > columnsFlex > column > orderedList',
  // columnsFlex 内 callout 的内部元素
  'doc > columnsFlex > column > callout > paragraph',
  'doc > columnsFlex > column > callout > heading',
  'doc > columnsFlex > column > callout > blockquote',
  'doc > columnsFlex > column > callout > codeBlock',
  'doc > columnsFlex > column > callout > mermaid',
  'doc > columnsFlex > column > callout > image',
  'doc > columnsFlex > column > callout > table',
  'doc > columnsFlex > column > callout > bulletList',
  'doc > columnsFlex > column > callout > orderedList',

  // ========== Section 容器 ==========
  // section 本身
  'doc > section',

  // section 直接子节点
  'doc > section > paragraph',
  'doc > section > heading',
  'doc > section > blockquote',
  'doc > section > codeBlock',
  'doc > section > mermaid',
  'doc > section > image',
  'doc > section > table',
  // section 内 columns 容器禁止拖拽
  // 'doc > section > columns',
  'doc > section > callout',
  // section 内的整体列表可拖拽
  'doc > section > bulletList',
  'doc > section > orderedList',
  // section 内 callout 的内部元素
  'doc > section > callout > paragraph',
  'doc > section > callout > heading',
  'doc > section > callout > blockquote',
  'doc > section > callout > codeBlock',
  'doc > section > callout > mermaid',
  'doc > section > callout > image',
  'doc > section > callout > table',
  'doc > section > callout > bulletList',
  'doc > section > callout > orderedList',

  // section 内的 columns
  'doc > section > columns > column > paragraph',
  'doc > section > columns > column > heading',
  'doc > section > columns > column > blockquote',
  'doc > section > columns > column > codeBlock',
  'doc > section > columns > column > mermaid',
  'doc > section > columns > column > image',
  'doc > section > columns > column > table',
  'doc > section > columns > column > callout',
  // section > columns 内的整体列表可拖拽
  'doc > section > columns > column > bulletList',
  'doc > section > columns > column > orderedList',
  // section > columns 内 callout 的内部元素
  'doc > section > columns > column > callout > paragraph',
  'doc > section > columns > column > callout > heading',
  'doc > section > columns > column > callout > blockquote',
  'doc > section > columns > column > callout > codeBlock',
  'doc > section > columns > column > callout > mermaid',
  'doc > section > columns > column > callout > image',
  'doc > section > columns > column > callout > table',
  'doc > section > columns > column > callout > bulletList',
  'doc > section > columns > column > callout > orderedList',

  // section 内的 columnsFlex
  // 'doc > section > columnsFlex',
  // 'doc > section > columnsFlex > column',
  'doc > section > columnsFlex > column > paragraph',
  'doc > section > columnsFlex > column > heading',
  'doc > section > columnsFlex > column > blockquote',
  'doc > section > columnsFlex > column > codeBlock',
  'doc > section > columnsFlex > column > mermaid',
  'doc > section > columnsFlex > column > image',
  'doc > section > columnsFlex > column > table',
  'doc > section > columnsFlex > column > callout',
  // section > columnsFlex 内的整体列表可拖拽
  'doc > section > columnsFlex > column > bulletList',
  'doc > section > columnsFlex > column > orderedList',
  // section > columnsFlex 内 callout 的内部元素
  'doc > section > columnsFlex > column > callout > paragraph',
  'doc > section > columnsFlex > column > callout > heading',
  'doc > section > columnsFlex > column > callout > blockquote',
  'doc > section > columnsFlex > column > callout > codeBlock',
  'doc > section > columnsFlex > column > callout > mermaid',
  'doc > section > columnsFlex > column > callout > image',
  'doc > section > columnsFlex > column > callout > table',
  'doc > section > columnsFlex > column > callout > bulletList',
  'doc > section > columnsFlex > column > callout > orderedList',

  // ========== 深层嵌套场景 ==========
  'doc > columns > column > blockquote',
  'doc > section > columns > column > blockquote',

  // ========== 特殊场景 ==========
  'doc > section > section',
  'doc > section > section > paragraph',

  // ========== 表格相关 ==========
  'doc > table',
  'doc > section > table',
  'doc > columns > column > table',

  // ========== 任务列表 ==========
  // 任务列表整体可拖拽
  'doc > taskList',
  'doc > section > taskList',
  'doc > columns > column > taskList',
  'doc > columnsFlex > column > taskList',
  'doc > section > columns > column > taskList',
  'doc > section > columnsFlex > column > taskList',
  'doc > callout > taskList',
  'doc > columns > column > callout > taskList',
  'doc > columnsFlex > column > callout > taskList',
  'doc > section > columns > column > callout > taskList',
  'doc > section > columnsFlex > column > callout > taskList'
]

/**
 * 默认句柄偏移量（像素）
 * 句柄距离节点左侧的距离
 */
export const DEFAULT_HANDLE_OFFSET = 50

/**
 * Hover 检测节流时间（毫秒）
 * 16ms ≈ 60fps，确保响应及时
 */
export const HOVER_THROTTLE_MS = 16
