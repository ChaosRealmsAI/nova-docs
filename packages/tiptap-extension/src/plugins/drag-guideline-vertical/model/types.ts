import type { EditorView } from '@tiptap/pm/view'

/**
 * 竖线引导线模式
 *
 * - none: 不显示
 * - columns-edge: 列容器左/右边缘或列间 gap
 * - editor-border: 编辑器整体左/右边缘（编辑器外拖拽）
 */
export type VerticalGuidelineMode = 'none' | 'columns-edge' | 'editor-border'

export type VerticalGuidelineSide = 'left' | 'right'

/** 列热区类型：只有 gap（列间间隙），左右边缘由编辑器边缘拖拽处理 */
export type ColumnHotzoneType = 'gap'

/**
 * 功能配置
 */
export interface VerticalGuidelineOptions {
  /** 列容器选择器 */
  columnContainerSelector?: string
  /** 列元素选择器 */
  columnSelector?: string
  /** 列热区水平阈值（px） */
  columnHotzoneThreshold?: number
  /** 是否启用列容器内的竖线引导线 */
  enableColumnGuideline?: boolean
  /** 是否启用编辑器边缘竖线引导线 */
  enableEditorBorderGuideline?: boolean
  /** 编辑器边缘热区水平范围（px），从编辑器左/右边缘向外扩展 */
  editorBorderHorizontalThreshold?: number
  /** 编辑器边缘热区垂直容差（px），允许鼠标略微超出顶部/底部 */
  editorBorderVerticalTolerance?: number
  /** 是否输出调试日志 */
  debug?: boolean
}

/**
 * 插件状态
 */
export interface VerticalGuidelineState {
  /** 当前模式 */
  mode: VerticalGuidelineMode
  /** 是否显示竖线 */
  isVisible: boolean
  /** 竖线的 X 坐标（viewport 坐标） */
  edgeX: number | null
  /** 竖线顶部 Y 坐标（viewport 坐标） */
  top: number | null
  /** 竖线底部 Y 坐标（viewport 坐标） */
  bottom: number | null
  /** 左侧还是右侧 */
  side: VerticalGuidelineSide | null
  /** 列热区类型（仅在 columns-edge 模式下有效） */
  hotzoneType: ColumnHotzoneType | null
  /** 命中的列索引（0-based，可选） */
  targetColumnIndex: number | null
  /** 目标块在文档中的位置（用于 drop 执行） */
  targetNodePos: number | null
  /** 是否在多列容器内部 */
  isInsideColumns: boolean
}

/**
 * 插件 storage
 */
export interface VerticalGuidelineStorage {
  view: EditorView | null
}
