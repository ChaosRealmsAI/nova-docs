/**
 * 多列容器节点 - 常量定义
 */

/**
 * 最小列数
 * 少于此数量会触发自动解除容器
 */
export const MIN_COLUMNS = 2

/**
 * 最大列数
 * 达到此数量后禁止继续添加列
 */
export const MAX_COLUMNS = 7

/**
 * 最小列宽百分比
 * 拖拽时列宽不能小于此值
 */
export const MIN_COLUMN_WIDTH = 5

/**
 * 列间距（px）
 * CSS grid gap 值
 */
export const COLUMN_GAP = 12

/**
 * 默认列数
 * 创建列容器时的默认列数
 */
export const DEFAULT_COLUMNS = 2

/**
 * 列容器节点类型名称
 */
export const COLUMNS_NODE_NAME = 'columns'

/**
 * 单列节点类型名称
 */
export const COLUMN_NODE_NAME = 'column'

/**
 * 跳过清理的 Transaction Meta 键名
 * 用于标记某些操作不触发自动清理
 */
export const CLEANUP_SKIP_META = 'columnCleanupSkip'
