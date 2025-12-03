/**
 * Color Manager Service
 *
 * 管理 Callout 颜色的预设和自定义颜色
 */

import type { CalloutTheme } from '../model/types'
import type { MessageKey } from '@nova/shared/i18n/messages'

export interface ColorPreset {
  /** 主题名称 */
  theme: CalloutTheme
  /** 显示名称的 i18n 键 */
  nameKey: MessageKey
  /** 背景颜色（用于预览） */
  bgColor: string
  /** 边框颜色（用于预览） */
  borderColor: string
}

/**
 * 8 个预设颜色配置
 */
const PRESET_COLORS: ColorPreset[] = [
  {
    theme: 'blue',
    nameKey: 'colorBlue',
    bgColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  {
    theme: 'green',
    nameKey: 'colorGreen',
    bgColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  {
    theme: 'yellow',
    nameKey: 'colorYellow',
    bgColor: '#fefce8',
    borderColor: '#eab308',
  },
  {
    theme: 'red',
    nameKey: 'colorRed',
    bgColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  {
    theme: 'purple',
    nameKey: 'colorPurple',
    bgColor: '#faf5ff',
    borderColor: '#a855f7',
  },
  {
    theme: 'gray',
    nameKey: 'colorGray',
    bgColor: '#f9fafb',
    borderColor: '#6b7280',
  },
  {
    theme: 'orange',
    nameKey: 'colorOrange',
    bgColor: '#fff7ed',
    borderColor: '#f97316',
  },
  {
    theme: 'cyan',
    nameKey: 'colorCyan',
    bgColor: '#ecfeff',
    borderColor: '#06b6d4',
  },
]

/**
 * 获取 8 个预设颜色
 */
export function getPresetColors(): ColorPreset[] {
  return PRESET_COLORS
}

/**
 * 验证十六进制颜色格式
 * @param color - 颜色字符串
 * @returns 是否是有效的十六进制颜色
 */
export function isValidHexColor(color: unknown): boolean {
  if (typeof color !== 'string') {
    return false
  }

  // 匹配 #xxx 或 #xxxxxx 格式
  const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
  return hexColorRegex.test(color)
}

/**
 * 根据主题获取颜色配置
 * @param theme - 主题名称
 * @returns 颜色预设配置
 */
export function getColorPresetByTheme(theme: CalloutTheme): ColorPreset | undefined {
  return PRESET_COLORS.find((preset) => preset.theme === theme)
}
