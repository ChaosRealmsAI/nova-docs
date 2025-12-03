/**
 * Callout Node 类型定义
 */

/**
 * Callout 颜色主题类型
 */
export type CalloutTheme = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange' | 'cyan'

/**
 * Callout 节点属性
 */
export interface CalloutAttrs {
  /** 颜色主题 */
  theme: CalloutTheme

  /** Emoji 图标 */
  emoji: string

  /** 自定义颜色（可选，覆盖主题颜色） */
  customColor?: string
}

/**
 * Callout 默认属性
 */
export const DEFAULT_CALLOUT_ATTRS: CalloutAttrs = {
  theme: 'blue',
  emoji: '💡',
}
