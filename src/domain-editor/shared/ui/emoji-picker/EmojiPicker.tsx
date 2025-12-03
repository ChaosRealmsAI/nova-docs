/**
 * EmojiPicker 表情选择器组件
 *
 * 基于 emoji-picker-element 库
 * 功能：
 * - 深色主题定制
 * - 表情选择事件
 * - 固定尺寸 400×450px
 */

import React, { useEffect, useRef } from 'react'
import { cn } from '@nova/shared'
import { loggers } from '@nova/infrastructure/logger'
import './emoji-picker.css'

export interface EmojiPickerProps {
  /** 表情选择回调 */
  onEmojiSelect?: (emoji: string) => void

  /** 自定义类名 */
  className?: string
}

// 类型声明：emoji-picker-element
interface EmojiClickEvent extends Event {
  detail: {
    unicode: string
    emoji: {
      annotation: string
      emoticon?: string
      group: number
      order: number
      shortcodes: string[]
      tags: string[]
      unicode: string
      version: number
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'emoji-picker': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
    }
  }
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  className
}) => {
  const pickerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // 动态加载 emoji-picker-element (使用 CDN)
    const loadEmojiPicker = () => {
      // 检查是否已经加载
      if (customElements.get('emoji-picker')) {
        return
      }

      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js'
      script.onerror = (event) => {
        loggers.uiButton.error('EmojiPicker: 加载 emoji-picker-element 失败', {
          src: script.src,
          event,
        })
      }
      document.head.appendChild(script)
    }

    loadEmojiPicker()
  }, [])

  useEffect(() => {
    const picker = pickerRef.current
    if (!picker) return

    const handleEmojiClick = (event: Event) => {
      const emojiEvent = event as EmojiClickEvent
      if (emojiEvent.detail?.unicode) {
        onEmojiSelect?.(emojiEvent.detail.unicode)
      }
    }

    picker.addEventListener('emoji-click', handleEmojiClick)

    return () => {
      picker.removeEventListener('emoji-click', handleEmojiClick)
    }
  }, [onEmojiSelect])

  return (
    <div className={cn('emoji-picker-wrapper', className)}>
      <emoji-picker ref={pickerRef as any} />
    </div>
  )
}

EmojiPicker.displayName = 'EmojiPicker'
