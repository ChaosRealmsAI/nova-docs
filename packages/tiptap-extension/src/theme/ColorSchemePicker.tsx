import React, { useState, useRef, useEffect } from 'react'
import type { ColorScheme } from './types'
import { useTheme } from './provider'
import './ColorSchemePicker.css'

/**
 * 颜色方案配置 - 用于显示颜色圆点
 */
const COLOR_SCHEME_COLORS: Record<ColorScheme, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  violet: '#8b5cf6',
  orange: '#f97316',
  teal: '#14b8a6',
  rose: '#f43f5e',
  indigo: '#6366f1',
  amber: '#f59e0b',
}

/**
 * 颜色方案名称显示
 */
const COLOR_SCHEME_LABELS: Record<ColorScheme, string> = {
  blue: 'Blue',
  green: 'Green',
  violet: 'Violet',
  orange: 'Orange',
  teal: 'Teal',
  rose: 'Rose',
  indigo: 'Indigo',
  amber: 'Amber',
}

interface ColorSchemePickerProps {
  className?: string
}

/**
 * 颜色方案选择器组件 - 可放在右上角
 */
export function ColorSchemePicker({ className }: ColorSchemePickerProps) {
  const { config, setColorScheme, toggleMode, availableColorSchemes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSchemeSelect = (scheme: ColorScheme) => {
    setColorScheme(scheme)
    setIsOpen(false)
  }

  return (
    <div className={`nova-color-scheme-picker ${className || ''}`} ref={containerRef}>
      {/* 亮暗模式切换按钮 */}
      <button
        className="nova-theme-mode-btn"
        onClick={toggleMode}
        title={config.mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {config.mode === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* 颜色方案选择器 */}
      <div className="nova-color-scheme-dropdown-container">
        <button
          className="nova-color-scheme-btn"
          onClick={() => setIsOpen(!isOpen)}
          title="Change Color Scheme"
        >
          <span
            className="nova-color-dot"
            style={{ backgroundColor: COLOR_SCHEME_COLORS[config.colorScheme] }}
          />
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {isOpen && (
          <div className="nova-color-scheme-dropdown">
            {availableColorSchemes.map((scheme) => (
              <button
                key={scheme}
                className={`nova-color-scheme-option ${
                  config.colorScheme === scheme ? 'active' : ''
                }`}
                onClick={() => handleSchemeSelect(scheme)}
              >
                <span
                  className="nova-color-dot"
                  style={{ backgroundColor: COLOR_SCHEME_COLORS[scheme] }}
                />
                <span className="nova-color-scheme-label">{COLOR_SCHEME_LABELS[scheme]}</span>
                {config.colorScheme === scheme && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
