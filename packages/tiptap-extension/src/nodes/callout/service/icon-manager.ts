/**
 * Icon Manager Service
 *
 * 管理 Callout 图标的搜索和选择
 */

import type { MessageKey } from '@/lib/i18n/messages'

export interface IconItem {
  /** Emoji 字符 */
  emoji: string
  /** 图标名称的 i18n 键 */
  nameKey: MessageKey
}

/**
 * 16 个常用图标（包含 8 个主题默认图标 + 8 个其他常用图标）
 */
const COMMON_ICONS: IconItem[] = [
  // 8 个主题默认图标
  { emoji: '💡', nameKey: 'iconLightbulb' },
  { emoji: '✅', nameKey: 'iconCheck' },
  { emoji: '⚠️', nameKey: 'iconWarning' },
  { emoji: '🚨', nameKey: 'iconAlarm' },
  { emoji: '🌟', nameKey: 'iconStar' },
  { emoji: '📝', nameKey: 'iconMemo' },
  { emoji: '🔥', nameKey: 'iconFire' },
  { emoji: '🎯', nameKey: 'iconTarget' },

  // 8 个其他常用图标
  { emoji: '📌', nameKey: 'iconPin' },
  { emoji: '💬', nameKey: 'iconSpeech' },
  { emoji: '📚', nameKey: 'iconBooks' },
  { emoji: '🎨', nameKey: 'iconPalette' },
  { emoji: '🔔', nameKey: 'iconBell' },
  { emoji: '🎉', nameKey: 'iconParty' },
  { emoji: '💭', nameKey: 'iconThought' },
  { emoji: '❤️', nameKey: 'iconHeart' },
]

/**
 * 获取 16 个常用图标
 */
export function getCommonIcons(): IconItem[] {
  return COMMON_ICONS
}
