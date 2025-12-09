/**
 * Hover Toolbar Component
 *
 * Callout 悬浮工具栏 - 提供图标、颜色、删除功能
 */

import { useState } from 'react'
import { ColorPicker } from './color-picker'
import { IconPicker } from './icon-picker'
import { useI18n } from '@/lib/i18n'
import type { CalloutTheme } from '../model/types'

/** 表情图标 */
const EmojiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
)

/** 调色板图标 */
const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" stroke="none" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.375 17.5 2 12 2Z" />
  </svg>
)

/** 删除图标 */
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

export interface HoverToolbarProps {
  /** 当前主题 */
  currentTheme: CalloutTheme
  /** 当前 emoji */
  currentEmoji: string
  /** 当前自定义颜色（如果有） */
  currentCustomColor?: string
  /** 是否显示工具栏 */
  visible: boolean
  /** 更改图标回调 */
  onEmojiChange: (emoji: string) => void
  /** 更改颜色回调 */
  onColorChange: (theme: CalloutTheme, customColor?: string) => void
  /** 删除节点回调 */
  onDelete: () => void
}

/**
 * Hover Toolbar 组件
 */
export function HoverToolbar({
  currentTheme,
  currentEmoji,
  currentCustomColor,
  visible,
  onEmojiChange,
  onColorChange,
  onDelete,
}: HoverToolbarProps) {
  const { t } = useI18n()
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  if (!visible) {
    return null
  }

  // 关闭所有弹窗
  const closeAll = () => {
    setShowIconPicker(false)
    setShowColorPicker(false)
  }

  return (
    <div className="callout-hover-toolbar" contentEditable={false}>
      <div className="callout-hover-toolbar-content">
        {/* 图标选择器按钮 */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="callout-hover-toolbar-button"
            onClick={() => {
              setShowColorPicker(false)
              setShowIconPicker(!showIconPicker)
            }}
            title={t('changeIcon')}
            aria-label={t('changeIcon')}
          >
            <EmojiIcon />
          </button>

          {showIconPicker && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px' }}>
              <IconPicker
                currentEmoji={currentEmoji}
                onSelect={(emoji) => {
                  onEmojiChange(emoji)
                  closeAll()
                }}
                onClose={() => setShowIconPicker(false)}
              />
            </div>
          )}
        </div>

        {/* 颜色选择器按钮 */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="callout-hover-toolbar-button"
            onClick={() => {
              setShowIconPicker(false)
              setShowColorPicker(!showColorPicker)
            }}
            title={t('changeColor')}
            aria-label={t('changeColor')}
          >
            <PaletteIcon />
          </button>

          {showColorPicker && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px' }}>
              <ColorPicker
                currentTheme={currentTheme}
                currentCustomColor={currentCustomColor}
                onSelect={onColorChange}
                onClose={() => setShowColorPicker(false)}
              />
            </div>
          )}
        </div>

        {/* 删除按钮 */}
        <button
          type="button"
          className="callout-hover-toolbar-button callout-hover-toolbar-delete"
          onClick={onDelete}
          title={t('delete')}
          aria-label={t('delete')}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}
