/**
 * Callout 高亮块组件
 *
 * 基于 callout-demo.html 复刻
 * 功能：
 * - 支持多种类型（info, warning, success, danger, note）
 * - 可编辑内容
 * - 可选择 Emoji 图标
 * - 支持暗黑模式
 */

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import './callout.css'

export type CalloutType = 'info' | 'warning' | 'success' | 'danger' | 'note' | 'purple' | 'orange' | 'cyan'

export interface CalloutProps {
  /** Callout 类型 */
  type?: CalloutType

  /** Emoji 图标 */
  emoji?: string

  /** 内容 */
  content?: string

  /** 是否可编辑 */
  editable?: boolean

  /** 内容变化回调 */
  onContentChange?: (content: string) => void

  /** Emoji 变化回调 */
  onEmojiChange?: (emoji: string) => void

  /** 自定义类名 */
  className?: string
}

const DEFAULT_EMOJIS: Record<CalloutType, string> = {
  info: '💡',
  warning: '⚠️',
  success: '✅',
  danger: '❌',
  note: '📝',
  purple: '🌟',
  orange: '🔥',
  cyan: '🎯'
}

const EMOJI_OPTIONS = [
  '📚', '💡', '⚠️', '📌', '🎯', '✨', '🔥', '🚀',
  '📝', '❓', '✅', '❌', '💭', '🌟', '🎨', '📖'
]

export const Callout: React.FC<CalloutProps> = ({
  type = 'info',
  emoji: propEmoji,
  content = '',
  editable = true,
  onContentChange,
  onEmojiChange,
  className
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [localContent, setLocalContent] = useState(content)
  const contentRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const currentEmoji = propEmoji || DEFAULT_EMOJIS[type]

  // 点击外部关闭 Emoji 选择器
  useEffect(() => {
    if (!showEmojiPicker) return

    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmojiPicker])

  const handleContentInput = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerHTML
      setLocalContent(newContent)
      onContentChange?.(newContent)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    onEmojiChange?.(emoji)
    setShowEmojiPicker(false)
  }

  return (
    <div className={cn('callout-wrapper', className)}>
      <div className={cn('callout-container', `callout-${type}`)}>
        {/* Emoji 按钮 */}
        <div className="callout-emoji-container">
          <button
            className="callout-emoji-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            type="button"
          >
            {currentEmoji}
          </button>

          {/* Emoji 选择器 */}
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="emoji-picker">
              {EMOJI_OPTIONS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji)}
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <div
          ref={contentRef}
          className="callout-content"
          contentEditable={editable}
          suppressContentEditableWarning
          onInput={handleContentInput}
          dangerouslySetInnerHTML={{ __html: localContent }}
        />
      </div>
    </div>
  )
}

Callout.displayName = 'Callout'
