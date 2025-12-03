/**
 * Selection Toolbar 组件（文字选中工具栏）
 *
 * 类似 Notion / 飞书的气泡菜单
 * 功能：加粗、斜体、下划线、删除线、行内代码、文字颜色、背景高亮
 */

import React, { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@nova/shared'
import { useI18n } from '@nova/shared/i18n'
import './selection-toolbar.css'

export interface SelectionToolbarProps {
  /** 是否显示工具栏 */
  open?: boolean

  /** 工具栏位置 */
  position?: { x: number; y: number }

  /** 关闭工具栏回调 */
  onClose?: () => void

  /** 格式化操作回调 */
  onFormat?: (type: FormatType) => void

  /** 颜色变更回调 */
  onColorChange?: (color: string, isBackground: boolean) => void

  /** 当前激活的格式 */
  activeFormats?: FormatType[]
}

export type FormatType = 'bold' | 'italic' | 'underline' | 'strike' | 'code'

const TEXT_COLORS = [
  { name: 'default', color: '#37352f' },
  { name: 'gray', color: '#9b9a97' },
  { name: 'brown', color: '#64473a' },
  { name: 'orange', color: '#d9730d' },
  { name: 'yellow', color: '#cb912f' },
  { name: 'green', color: '#448361' },
  { name: 'blue', color: '#337ea9' },
  { name: 'purple', color: '#9065b0' },
  { name: 'pink', color: '#c14c8a' },
  { name: 'red', color: '#d44c47' }
]

const BG_COLORS = [
  { name: 'default', color: 'transparent' },
  { name: 'gray', color: '#ebeced' },
  { name: 'brown', color: '#e9e5e3' },
  { name: 'orange', color: '#faebdd' },
  { name: 'yellow', color: '#fbf3db' },
  { name: 'green', color: '#ddedea' },
  { name: 'blue', color: '#ddebf1' },
  { name: 'purple', color: '#eae4f2' },
  { name: 'pink', color: '#f4dfeb' },
  { name: 'red', color: '#fbe4e4' }
]

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  open = false,
  position = { x: 0, y: 0 },
  onClose,
  onFormat,
  onColorChange,
  activeFormats = []
}) => {
  const { t } = useI18n()
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [currentTextColor, setCurrentTextColor] = useState('#37352f')

  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const colorPickerRef = React.useRef<HTMLDivElement>(null)

  // 关闭颜色选择器
  const closeColorPicker = useCallback(() => {
    setShowColorPicker(false)
  }, [])

  // 点击外部关闭
  React.useEffect(() => {
    if (!open) {
      setShowColorPicker(false)
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideToolbar = toolbarRef.current?.contains(target)
      const isInsideColorPicker = colorPickerRef.current?.contains(target)

      if (!isInsideToolbar && !isInsideColorPicker) {
        onClose?.()
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onClose])

  const handleFormatClick = useCallback((type: FormatType) => {
    onFormat?.(type)
  }, [onFormat])

  const handleColorClick = useCallback(() => {
    setShowColorPicker(prev => !prev)
  }, [])

  const handleTextColorSelect = useCallback((color: string) => {
    setCurrentTextColor(color)
    onColorChange?.(color, false)
    closeColorPicker()
  }, [onColorChange, closeColorPicker])

  const handleBgColorSelect = useCallback((color: string) => {
    onColorChange?.(color, true)
    closeColorPicker()
  }, [onColorChange, closeColorPicker])

  if (!open) return null

  const isActive = (type: FormatType) => activeFormats.includes(type)

  return createPortal(
    <>
      {/* 主工具栏 */}
      <div
        ref={toolbarRef}
        className="selection-toolbar"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <div className="selection-toolbar-content">
          {/* 格式化按钮组 */}
          <div className="selection-toolbar-group">
            {/* 加粗 */}
            <button
              className={cn('selection-toolbar-btn', isActive('bold') && 'active')}
              onClick={() => handleFormatClick('bold')}
              title={`${t('formatBold')} ⌘B`}
            >
              <BoldIcon />
            </button>

            {/* 斜体 */}
            <button
              className={cn('selection-toolbar-btn', isActive('italic') && 'active')}
              onClick={() => handleFormatClick('italic')}
              title={`${t('formatItalic')} ⌘I`}
            >
              <ItalicIcon />
            </button>

            {/* 下划线 */}
            <button
              className={cn('selection-toolbar-btn', isActive('underline') && 'active')}
              onClick={() => handleFormatClick('underline')}
              title={`${t('formatUnderline')} ⌘U`}
            >
              <UnderlineIcon />
            </button>

            {/* 删除线 */}
            <button
              className={cn('selection-toolbar-btn', isActive('strike') && 'active')}
              onClick={() => handleFormatClick('strike')}
              title={`${t('formatStrikethrough')} ⌘⇧S`}
            >
              <StrikeIcon />
            </button>

            {/* 行内代码 */}
            <button
              className={cn('selection-toolbar-btn', isActive('code') && 'active')}
              onClick={() => handleFormatClick('code')}
              title={`${t('formatCode')} ⌘E`}
            >
              <CodeIcon />
            </button>
          </div>

          <div className="selection-toolbar-divider" />

          {/* 颜色按钮 */}
          <div className="selection-toolbar-group">
            <button
              className={cn('selection-toolbar-btn', showColorPicker && 'active')}
              onClick={handleColorClick}
              title={t('formatColor')}
            >
              <div className="color-indicator">
                <ColorIcon />
                <div
                  className="color-indicator-bar"
                  style={{ background: currentTextColor }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* 箭头指示器 */}
        <div className="selection-toolbar-arrow" />
      </div>

      {/* 颜色选择器 */}
      {showColorPicker && (
        <div
          ref={colorPickerRef}
          className="selection-color-picker"
          style={{
            left: `${position.x}px`,
            top: `${position.y + 50}px`
          }}
        >
          {/* 文字颜色 */}
          <div className="color-section">
            <div className="color-section-title">{t('colorTextColor')}</div>
            <div className="color-grid">
              {TEXT_COLORS.map((item) => (
                <button
                  key={item.name}
                  className={cn(
                    'color-option',
                    `text-color-${item.name}`,
                    currentTextColor === item.color && 'selected'
                  )}
                  onClick={() => handleTextColorSelect(item.color)}
                  title={t(`color${item.name.charAt(0).toUpperCase() + item.name.slice(1)}` as any)}
                />
              ))}
            </div>
          </div>

          {/* 背景颜色 */}
          <div className="color-section">
            <div className="color-section-title">{t('colorBackground')}</div>
            <div className="color-grid">
              {BG_COLORS.map((item) => (
                <button
                  key={item.name}
                  className={cn('color-option', `bg-color-${item.name}`)}
                  onClick={() => handleBgColorSelect(item.color)}
                  title={t(`color${item.name.charAt(0).toUpperCase() + item.name.slice(1)}Bg` as any)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  )
}

// Icons
function BoldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5h6a4 4 0 0 1 0 8H7z"/>
      <path d="M7 13h7a4 4 0 0 1 0 8H7z"/>
      <line x1="7" y1="5" x2="7" y2="21"/>
    </svg>
  )
}

function ItalicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="19" y1="4" x2="10" y2="4"/>
      <line x1="14" y1="20" x2="5" y2="20"/>
      <line x1="15" y1="4" x2="9" y2="20"/>
    </svg>
  )
}

function UnderlineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 4v6a6 6 0 0 0 12 0V4"/>
      <line x1="4" y1="20" x2="20" y2="20"/>
    </svg>
  )
}

function StrikeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  )
}

function ColorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4L5 20h2.5l1.5-4h6l1.5 4H19L12 4zm-1.5 10l1.5-4 1.5 4h-3z"/>
    </svg>
  )
}

SelectionToolbar.displayName = 'SelectionToolbar'
