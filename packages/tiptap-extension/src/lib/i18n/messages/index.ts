/**
 * 消息汇总
 */

import type { Locale } from '../config'
import { editorMessages } from './editor'

const MESSAGES = {
  ...editorMessages,
} as const

export type MessageKey = keyof typeof MESSAGES

export const messages = MESSAGES as Record<MessageKey, Record<Locale, string>>
