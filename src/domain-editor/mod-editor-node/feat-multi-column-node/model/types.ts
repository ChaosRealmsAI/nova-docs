/**
 * 多列容器节点 - 数据模型定义
 */

/**
 * 列宽数组类型
 * 每个元素表示一列的宽度百分比（0-100）
 */
export type ColumnWidths = number[]

/**
 * Columns 节点属性
 */
export interface ColumnsAttributes {
  /** 列数 */
  count: number
  /** 列宽数组 */
  columnWidths: ColumnWidths
  /** 展示模式：纵向堆叠 / 网格 */
  layout?: 'stacked' | 'grid'
}

/**
 * Column 节点属性
 */
export interface ColumnAttributes {
  /** 列宽百分比 */
  width: number
}

/**
 * 拖拽手柄位置信息
 */
export interface HandlePosition {
  /** 手柄索引（第几个分隔线） */
  index: number
  /** 手柄的 left 位置（px） */
  position: number
}

/**
 * 列宽计算参数
 */
export interface WidthCalculationParams {
  /** 拖拽的 X 轴偏移量（px） */
  deltaX: number
  /** 容器总宽度（px） */
  containerWidth: number
  /** 当前列宽数组 */
  currentWidths: ColumnWidths
  /** 左侧列索引 */
  leftIndex: number
  /** 右侧列索引 */
  rightIndex: number
}

/**
 * 列宽计算结果
 */
export interface WidthCalculationResult {
  /** 是否发生变化 */
  changed: boolean
  /** 新的列宽数组 */
  newWidths: ColumnWidths
}

/**
 * 清理动作类型
 */
export type CleanupAction =
  | { type: 'remove-empty-column'; columnsPos: number; columnIndex: number }
  | { type: 'unwrap-single-column'; columnsPos: number }
  | { type: 'none' }

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息（如果无效） */
  error?: string
}
