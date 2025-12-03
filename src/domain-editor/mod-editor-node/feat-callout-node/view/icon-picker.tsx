/**
 * Icon Picker Component
 *
 * 图标选择器 - 简洁的图标网格
 */

import { useRef, useEffect } from 'react'
import { getCommonIcons } from '../service/icon-manager'
import { useI18n } from '@nova/shared/i18n'

/** 选中勾选图标 */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export interface IconPickerProps {
  /** 当前选中的 emoji */
  currentEmoji: string
  /** 选择回调 */
  onSelect: (emoji: string) => void
  /** 关闭回调 */
  onClose: () => void
}

/**
 * 图标选择器组件
 */
export function IconPicker({ currentEmoji, onSelect, onClose }: IconPickerProps) {
  const { t } = useI18n()
  const icons = getCommonIcons()
  const containerRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // 处理选择
  const handleSelect = (emoji: string) => {
    onSelect(emoji)
    onClose()
  }

  return (
    <div
      ref={containerRef}
      className="icon-picker-container"
      role="listbox"
      aria-label={t('changeIcon')}
    >
      <div className="icon-picker-grid">
        {icons.map((icon) => {
          const isSelected = icon.emoji === currentEmoji
          const iconName = t(icon.nameKey)
          return (
            <button
              key={icon.emoji}
              type="button"
              className={`icon-picker-item ${isSelected ? 'icon-picker-item-selected' : ''}`}
              onClick={() => handleSelect(icon.emoji)}
              title={iconName}
              aria-label={iconName}
              aria-selected={isSelected}
              role="option"
            >
              <span className="icon-picker-emoji">{icon.emoji}</span>
              {isSelected && (
                <span className="icon-picker-check">
                  <CheckIcon />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
