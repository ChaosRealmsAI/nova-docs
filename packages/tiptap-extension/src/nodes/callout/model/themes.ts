/**
 * Callout 主题配置
 *
 * 定义 8 种颜色主题的配置
 */

import type { CalloutTheme } from './types'

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string

  /** 默认 Emoji */
  defaultEmoji: string

  /** 背景色（CSS 类名） */
  bgClass: string

  /** 边框色（CSS 类名） */
  borderClass: string

  /** 描述/用途 */
  description: string
}

/**
 * 8 种颜色主题配置
 */
export const THEME_CONFIGS: Record<CalloutTheme, ThemeConfig> = {
  blue: {
    name: '蓝色',
    defaultEmoji: '💡',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-500',
    description: '信息、提示',
  },
  green: {
    name: '绿色',
    defaultEmoji: '✅',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-500',
    description: '成功、完成',
  },
  yellow: {
    name: '黄色',
    defaultEmoji: '⚠️',
    bgClass: 'bg-yellow-50',
    borderClass: 'border-yellow-500',
    description: '警告、注意',
  },
  red: {
    name: '红色',
    defaultEmoji: '🚨',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-500',
    description: '错误、危险',
  },
  purple: {
    name: '紫色',
    defaultEmoji: '🌟',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-500',
    description: '重要、强调',
  },
  gray: {
    name: '灰色',
    defaultEmoji: '📝',
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-400',
    description: '笔记、备注',
  },
  orange: {
    name: '橙色',
    defaultEmoji: '🔥',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-500',
    description: '热门、紧急',
  },
  cyan: {
    name: '青色',
    defaultEmoji: '🎯',
    bgClass: 'bg-cyan-50',
    borderClass: 'border-cyan-500',
    description: '目标、计划',
  },
}

/**
 * 获取主题配置
 */
export function getThemeConfig(theme: CalloutTheme): ThemeConfig {
  return THEME_CONFIGS[theme]
}

/**
 * 获取主题的默认 Emoji
 */
export function getDefaultEmoji(theme: CalloutTheme): string {
  return THEME_CONFIGS[theme].defaultEmoji
}

/**
 * 所有主题列表
 */
export const ALL_THEMES: CalloutTheme[] = [
  'blue',
  'green',
  'yellow',
  'red',
  'purple',
  'gray',
  'orange',
  'cyan',
]
