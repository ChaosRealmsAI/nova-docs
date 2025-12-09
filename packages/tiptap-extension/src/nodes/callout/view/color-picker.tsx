/**
 * Color Picker Component
 *
 * 颜色选择器 - 简洁的颜色方块选择
 */

import { useRef, useEffect } from 'react'
import { getPresetColors } from '../service/color-manager'
import { useI18n } from '@/lib/i18n'
import type { CalloutTheme } from '../model/types'

/** 选中勾选图标 */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export interface ColorPickerProps {
  /** 当前主题 */
  currentTheme: CalloutTheme
  /** 当前自定义颜色（如果有） */
  currentCustomColor?: string
  /** 选择回调 */
  onSelect: (theme: CalloutTheme, customColor?: string) => void
  /** 关闭回调 */
  onClose: () => void
}

/**
 * 颜色选择器组件
 */
export function ColorPicker({
  currentTheme,
  currentCustomColor,
  onSelect,
  onClose,
}: ColorPickerProps) {
  const { t } = useI18n()
  const presetColors = getPresetColors()
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

  // 选择颜色
  const handleSelect = (theme: CalloutTheme) => {
    onSelect(theme)
    onClose()
  }

  return (
    <div
      ref={containerRef}
      className="color-picker-container"
      role="listbox"
      aria-label={t('changeColor')}
    >
      <div className="color-picker-grid">
        {presetColors.map((preset) => {
          const isSelected = preset.theme === currentTheme && !currentCustomColor
          const colorName = t(preset.nameKey)
          return (
            <button
              key={preset.theme}
              type="button"
              className={`color-picker-item ${isSelected ? 'color-picker-item-selected' : ''}`}
              onClick={() => handleSelect(preset.theme)}
              title={colorName}
              aria-label={colorName}
              aria-selected={isSelected}
              role="option"
            >
              <span
                className="color-picker-swatch"
                style={{ backgroundColor: preset.borderColor }}
              />
              {isSelected && (
                <span className="color-picker-check">
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
