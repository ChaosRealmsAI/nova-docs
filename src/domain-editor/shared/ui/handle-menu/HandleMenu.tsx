/**
 * Handle Menu 组件（句柄右键菜单）
 *
 * 基于 handle-menu-complete.html 复刻
 * 功能：
 * - Turn into 子菜单（转换为其他块类型）
 * - Color 子菜单（文字颜色和背景色）
 * - Duplicate（复制）
 * - Delete（删除）
 */

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@nova/shared'
import { useI18n } from '@nova/shared/i18n'
import type { MessageKey } from '@nova/shared/i18n/messages'
import './handle-menu.css'

export interface HandleMenuProps {
  /** 是否显示菜单 */
  open?: boolean

  /** 菜单位置 */
  position?: { x: number; y: number }

  /** 关闭菜单回调 */
  onClose?: () => void

  /** Turn into 选项点击 */
  onTurnInto?: (type: string) => void

  /** Color 选项点击 */
  onColorChange?: (color: string, isBackground: boolean) => void

  /** Duplicate 点击 */
  onDuplicate?: () => void

  /** Delete 点击 */
  onDelete?: () => void

  /** 鼠标进入菜单区域 */
  onMouseEnter?: () => void

  /** 鼠标离开菜单区域 */
  onMouseLeave?: () => void

  /** 子菜单激活时调用（保持父菜单打开）*/
  onSubmenuKeepAlive?: () => void

  /** 子菜单关闭时调用 */
  onSubmenuClose?: () => void
}

const TURN_INTO_OPTIONS: { type: string; labelKey: MessageKey; icon: React.FC }[] = [
  { type: 'text', labelKey: 'turnIntoText', icon: TurnIntoTextIcon },
  { type: 'heading1', labelKey: 'turnIntoHeading1', icon: Heading1Icon },
  { type: 'heading2', labelKey: 'turnIntoHeading2', icon: Heading2Icon },
  { type: 'heading3', labelKey: 'turnIntoHeading3', icon: Heading3Icon },
  { type: 'bulletList', labelKey: 'turnIntoBulletList', icon: BulletListIcon },
  { type: 'numberedList', labelKey: 'turnIntoNumberedList', icon: NumberedListIcon },
  { type: 'todoList', labelKey: 'turnIntoTodoList', icon: TodoListIcon },
  { type: 'code', labelKey: 'turnIntoCode', icon: CodeIcon },
  { type: 'quote', labelKey: 'turnIntoQuote', icon: QuoteIcon }
]

const TEXT_COLORS: { name: string; labelKey: MessageKey }[] = [
  { name: 'default', labelKey: 'colorDefault' },
  { name: 'gray', labelKey: 'colorGray' },
  { name: 'brown', labelKey: 'colorBrown' },
  { name: 'orange', labelKey: 'colorOrange' },
  { name: 'yellow', labelKey: 'colorYellow' },
  { name: 'green', labelKey: 'colorGreen' },
  { name: 'blue', labelKey: 'colorBlue' },
  { name: 'purple', labelKey: 'colorPurple' },
  { name: 'pink', labelKey: 'colorPink' },
  { name: 'red', labelKey: 'colorRed' }
]

const BG_COLORS: { name: string; labelKey: MessageKey }[] = [
  { name: 'default', labelKey: 'colorDefault' },
  { name: 'gray', labelKey: 'colorGrayBg' },
  { name: 'brown', labelKey: 'colorBrownBg' },
  { name: 'orange', labelKey: 'colorOrangeBg' },
  { name: 'yellow', labelKey: 'colorYellowBg' },
  { name: 'green', labelKey: 'colorGreenBg' },
  { name: 'blue', labelKey: 'colorBlueBg' },
  { name: 'purple', labelKey: 'colorPurpleBg' },
  { name: 'pink', labelKey: 'colorPinkBg' },
  { name: 'red', labelKey: 'colorRedBg' }
]

export const HandleMenu: React.FC<HandleMenuProps> = ({
  open = false,
  position = { x: 0, y: 0 },
  onClose,
  onTurnInto,
  onColorChange,
  onDuplicate,
  onDelete,
  onMouseEnter,
  onMouseLeave,
  onSubmenuKeepAlive,
  onSubmenuClose
}) => {
  const { t } = useI18n()
  const [showTurnIntoSubmenu, setShowTurnIntoSubmenu] = useState(false)
  const [showColorSubmenu, setShowColorSubmenu] = useState(false)
  const [turnIntoSubmenuPos, setTurnIntoSubmenuPos] = useState({ x: 0, y: 0 })
  const [colorSubmenuPos, setColorSubmenuPos] = useState({ x: 0, y: 0 })
  const [turnIntoSide, setTurnIntoSide] = useState<'left' | 'right'>('left')
  const [colorSide, setColorSide] = useState<'left' | 'right'>('left')

  const turnIntoRef = React.useRef<HTMLDivElement>(null)
  const colorRef = React.useRef<HTMLDivElement>(null)

  // 主菜单 DOM ref，用于检测外部点击
  const menuRef = React.useRef<HTMLDivElement>(null)
  const turnIntoSubmenuRef = React.useRef<HTMLDivElement>(null)
  const colorSubmenuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) {
      setShowTurnIntoSubmenu(false)
      setShowColorSubmenu(false)
    }
  }, [open])

  // 监听外部点击关闭菜单（替代 overlay）
  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      // 检查点击是否在菜单或子菜单内部
      const isInsideMenu = menuRef.current?.contains(target)
      const isInsideTurnIntoSubmenu = turnIntoSubmenuRef.current?.contains(target)
      const isInsideColorSubmenu = colorSubmenuRef.current?.contains(target)

      if (!isInsideMenu && !isInsideTurnIntoSubmenu && !isInsideColorSubmenu) {
        console.log('[HandleMenu] Click outside detected, closing menu')
        onClose?.()
      }
    }

    // 延迟添加监听器，避免打开菜单的点击触发关闭
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onClose])

  // Turn Into 菜单项 hover（简化版：无延迟）
  const handleTurnIntoMouseEnter = () => {
    if (turnIntoRef.current) {
      const rect = turnIntoRef.current.getBoundingClientRect()
      const submenuWidth = 220
      const gap = 0  // 无间隙，子菜单紧贴主菜单

      const rightSpace = window.innerWidth - rect.right
      const showOnRight = rightSpace > submenuWidth + gap

      const x = showOnRight
        ? rect.right + gap
        : rect.left - submenuWidth - gap

      setTurnIntoSubmenuPos({ x, y: rect.top })
      setTurnIntoSide(showOnRight ? 'right' : 'left')
      setShowTurnIntoSubmenu(true)
      setShowColorSubmenu(false)
    }
  }

  const handleTurnIntoMouseLeave = (e: React.MouseEvent) => {
    // 检查鼠标是否移动到子菜单上
    const relatedTarget = e.relatedTarget as HTMLElement | null
    const isMovingToSubmenu = relatedTarget?.closest('.handle-submenu')

    if (!isMovingToSubmenu) {
      setShowTurnIntoSubmenu(false)
    }
  }

  const handleTurnIntoSubmenuMouseEnter = () => {
    onMouseEnter?.()
    onSubmenuKeepAlive?.()  // 通知父层：子菜单激活
  }

  const handleTurnIntoSubmenuMouseLeave = () => {
    setShowTurnIntoSubmenu(false)
    onSubmenuClose?.()  // 通知父层：子菜单关闭
  }

  // Color 菜单项 hover（简化版：无延迟）
  const handleColorMouseEnter = () => {
    if (colorRef.current) {
      const rect = colorRef.current.getBoundingClientRect()
      const submenuWidth = 200
      const gap = 0  // 无间隙，子菜单紧贴主菜单

      const rightSpace = window.innerWidth - rect.right
      const showOnRight = rightSpace > submenuWidth + gap

      const x = showOnRight
        ? rect.right + gap
        : rect.left - submenuWidth - gap

      setColorSubmenuPos({ x, y: rect.top })
      setColorSide(showOnRight ? 'right' : 'left')
      setShowColorSubmenu(true)
      setShowTurnIntoSubmenu(false)
    }
  }

  const handleColorMouseLeave = (e: React.MouseEvent) => {
    // 检查鼠标是否移动到子菜单上
    const relatedTarget = e.relatedTarget as HTMLElement | null
    const isMovingToSubmenu = relatedTarget?.closest('.handle-submenu')

    if (!isMovingToSubmenu) {
      setShowColorSubmenu(false)
    }
  }

  const handleColorSubmenuMouseEnter = () => {
    onMouseEnter?.()
    onSubmenuKeepAlive?.()  // 通知父层：子菜单激活
  }

  const handleColorSubmenuMouseLeave = () => {
    setShowColorSubmenu(false)
    onSubmenuClose?.()  // 通知父层：子菜单关闭
  }

  // 主菜单的 hover 事件
  const handleMainMenuMouseEnter = () => {
    onMouseEnter?.()
  }

  const handleMainMenuMouseLeave = (e: React.MouseEvent) => {
    // 检查鼠标是否移动到子菜单上
    const relatedTarget = e.relatedTarget as HTMLElement | null
    const isMovingToSubmenu = relatedTarget?.closest('.handle-submenu')

    if (!isMovingToSubmenu) {
      // 只有在不是移动到子菜单时才关闭
      setShowTurnIntoSubmenu(false)
      setShowColorSubmenu(false)
      onMouseLeave?.()
    }
  }

  if (!open) return null

  return (
    <>
      {/* 主菜单 */}
      <div
        ref={menuRef}
        className="handle-menu-dialog"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        onMouseEnter={handleMainMenuMouseEnter}
        onMouseLeave={handleMainMenuMouseLeave}
      >
        <div className="handle-menu-content">
          {/* Turn into Option */}
          <div
            ref={turnIntoRef}
            className="handle-menu-item notion-menu-item"
            onMouseEnter={handleTurnIntoMouseEnter}
            onMouseLeave={handleTurnIntoMouseLeave}
          >
            <div className="handle-menu-item-icon notion-text-secondary">
              <TurnIntoIcon />
            </div>
            <div className="handle-menu-item-label notion-text-primary">{t('handleMenuTurnInto')}</div>
            <div className="handle-menu-item-arrow notion-text-secondary">
              <ChevronRightIcon />
            </div>
          </div>

          {/* Color Option */}
          <div
            ref={colorRef}
            className="handle-menu-item notion-menu-item"
            onMouseEnter={handleColorMouseEnter}
            onMouseLeave={handleColorMouseLeave}
          >
            <div className="handle-menu-item-icon notion-text-secondary">
              <ColorIcon />
            </div>
            <div className="handle-menu-item-label notion-text-primary">{t('handleMenuColor')}</div>
            <div className="handle-menu-item-arrow notion-text-secondary">
              <ChevronRightIcon />
            </div>
          </div>

          {/* Separator */}
          <div className="handle-menu-separator notion-separator" />

          {/* Duplicate */}
          <div
            className="handle-menu-item notion-menu-item"
            onClick={() => {
              onDuplicate?.()
              onClose?.()
            }}
          >
            <div className="handle-menu-item-icon notion-text-secondary">
              <DuplicateIcon />
            </div>
            <div className="handle-menu-item-label notion-text-primary">{t('handleMenuDuplicate')}</div>
            <div className="handle-menu-item-shortcut notion-text-quaternary">⌘D</div>
          </div>

          {/* Delete */}
          <div
            className="handle-menu-item notion-menu-item"
            onClick={() => {
              onDelete?.()
              onClose?.()
            }}
          >
            <div className="handle-menu-item-icon" style={{ color: '#eb5757' }}>
              <DeleteIcon />
            </div>
            <div className="handle-menu-item-label notion-text-primary">{t('handleMenuDelete')}</div>
            <div className="handle-menu-item-shortcut notion-text-quaternary">Del</div>
          </div>
        </div>
      </div>

      {/* Turn Into Submenu */}
      {showTurnIntoSubmenu && createPortal(
        <div
          ref={turnIntoSubmenuRef}
          className={cn("handle-submenu", turnIntoSide === 'right' ? 'handle-submenu-right' : 'handle-submenu-left')}
          style={{
            left: `${turnIntoSubmenuPos.x}px`,
            top: `${turnIntoSubmenuPos.y}px`
          }}
          onMouseEnter={handleTurnIntoSubmenuMouseEnter}
          onMouseLeave={handleTurnIntoSubmenuMouseLeave}
        >
          <div className="handle-submenu-content">
            {TURN_INTO_OPTIONS.map((option) => (
              <div
                key={option.type}
                className="handle-menu-item notion-menu-item"
                onClick={() => {
                  onTurnInto?.(option.type)
                  onClose?.()
                }}
              >
                <div className="handle-menu-item-icon notion-text-secondary">
                  <option.icon />
                </div>
                <div className="handle-menu-item-label notion-text-primary">
                  {t(option.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Color Submenu */}
      {showColorSubmenu && createPortal(
        <div
          ref={colorSubmenuRef}
          className={cn("handle-submenu", colorSide === 'right' ? 'handle-submenu-right' : 'handle-submenu-left')}
          style={{
            left: `${colorSubmenuPos.x}px`,
            top: `${colorSubmenuPos.y}px`,
            width: '200px'
          }}
          onMouseEnter={handleColorSubmenuMouseEnter}
          onMouseLeave={handleColorSubmenuMouseLeave}
        >
          <div className="color-picker-content">
            {/* Text Color */}
            <div className="color-section">
              <div className="color-section-label notion-text-tertiary">{t('colorTextColor')}</div>
              <div className="color-grid">
                {TEXT_COLORS.map((color) => (
                  <div
                    key={color.name}
                    className={cn('color-option', `color-${color.name}`)}
                    title={t(color.labelKey)}
                    onClick={() => {
                      onColorChange?.(color.name, false)
                      onClose?.()
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="color-section">
              <div className="color-section-label notion-text-tertiary">{t('colorBackground')}</div>
              <div className="color-grid">
                {BG_COLORS.map((color) => (
                  <div
                    key={color.name}
                    className={cn('color-option', `bg-${color.name}`)}
                    title={t(color.labelKey)}
                    onClick={() => {
                      onColorChange?.(color.name, true)
                      onClose?.()
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// Icons
function TurnIntoIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M6.475 3.125a.625.625 0 1 0 0 1.25h7.975c.65 0 1.175.526 1.175 1.175v6.057l-1.408-1.408a.625.625 0 1 0-.884.884l2.475 2.475a.625.625 0 0 0 .884 0l2.475-2.475a.625.625 0 0 0-.884-.884l-1.408 1.408V5.55a2.425 2.425 0 0 0-2.425-2.425zM3.308 6.442a.625.625 0 0 1 .884 0l2.475 2.475a.625.625 0 1 1-.884.884L4.375 8.393v6.057c0 .649.526 1.175 1.175 1.175h7.975a.625.625 0 0 1 0 1.25H5.55a2.425 2.425 0 0 1-2.425-2.425V8.393L1.717 9.801a.625.625 0 1 1-.884-.884z" fill="currentColor"/>
    </svg>
  )
}

function ColorIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M5.606 2.669a1.55 1.55 0 0 0-1.55 1.55v.379l-.069-.004h-.693a.55.55 0 0 0 0 1.1h.693l.069-.004v.379c0 .856.694 1.55 1.55 1.55h8.787a1.55 1.55 0 0 0 1.55-1.55v-.375h.3c.208 0 .376.168.376.375v2.023a.375.375 0 0 1-.375.375h-5.32c-.814 0-1.474.66-1.474 1.475v.592a1.55 1.55 0 0 0-1.463 1.547v3.7c0 .856.694 1.55 1.55 1.55h.925a1.55 1.55 0 0 0 1.55-1.55v-3.7a1.55 1.55 0 0 0-1.462-1.547v-.592c0-.207.168-.375.375-.375h5.319c.814 0 1.475-.66 1.475-1.475V6.069c0-.815-.66-1.475-1.475-1.475h-.3v-.375a1.55 1.55 0 0 0-1.55-1.55zm-.3 1.55a.3.3 0 0 1 .3-.3h8.787a.3.3 0 0 1 .3.3v1.85a.3.3 0 0 1-.3.3H5.606a.3.3 0 0 1-.3-.3zm3.931 7.862a.3.3 0 0 1 .3-.3h.925a.3.3 0 0 1 .3.3v3.7a.3.3 0 0 1-.3.3h-.925a.3.3 0 0 1-.3-.3z" fill="currentColor"/>
    </svg>
  )
}

function DuplicateIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M4.5 2.375A2.125 2.125 0 0 0 2.375 4.5V12c0 1.174.951 2.125 2.125 2.125h1.625v1.625c0 1.174.951 2.125 2.125 2.125h7.5a2.125 2.125 0 0 0 2.125-2.125v-7.5a2.125 2.125 0 0 0-2.125-2.125h-1.625V4.5A2.125 2.125 0 0 0 12 2.375zm8.375 3.75H8.25A2.125 2.125 0 0 0 6.125 8.25v4.625H4.5A.875.875 0 0 1 3.625 12V4.5c0-.483.392-.875.875-.875H12c.483 0 .875.392.875.875zm-5.5 2.125c0-.483.392-.875.875-.875h7.5c.483 0 .875.392.875.875v7.5a.875.875 0 0 1-.875.875h-7.5a.875.875 0 0 1-.875-.875z" fill="currentColor"/>
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M8.806 8.505a.55.55 0 0 0-1.1 0v5.979a.55.55 0 1 0 1.1 0zm3.488 0a.55.55 0 0 0-1.1 0v5.979a.55.55 0 1 0 1.1 0z" fill="currentColor"/>
      <path d="M6.386 3.925v1.464H3.523a.625.625 0 1 0 0 1.25h.897l.393 8.646A2.425 2.425 0 0 0 7.236 17.6h5.528a2.425 2.425 0 0 0 2.422-2.315l.393-8.646h.898a.625.625 0 1 0 0-1.25h-2.863V3.925c0-.842-.683-1.525-1.525-1.525H7.91c-.842 0-1.524.683-1.524 1.525M7.91 3.65h4.18c.15 0 .274.123.274.275v1.464H7.636V3.925c0-.152.123-.275.274-.275m-.9 2.99h7.318l-.39 8.588a1.175 1.175 0 0 1-1.174 1.122H7.236a1.175 1.175 0 0 1-1.174-1.122l-.39-8.589z" fill="currentColor"/>
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4">
      <path d="M6.722 3.238a.625.625 0 1 0-.884.884L9.716 8l-3.878 3.878a.625.625 0 0 0 .884.884l4.32-4.32a.625.625 0 0 0 0-.884z" fill="currentColor"/>
    </svg>
  )
}

// Turn Into Icons
function TurnIntoTextIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M4.875 4.825c0-.345.28-.625.625-.625h9c.345 0 .625.28.625.625v1.8a.625.625 0 1 1-1.25 0V5.45h-3.25v9.1h.725a.625.625 0 1 1 0 1.25h-2.7a.625.625 0 1 1 0-1.25h.725v-9.1h-3.25v1.175a.625.625 0 1 1-1.25 0z" fill="currentColor"/>
    </svg>
  )
}

function Heading1Icon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M4.1 4.825a.625.625 0 1 0-1.25 0v10.35a.625.625 0 0 0 1.25 0V10.4h6.4v4.775a.625.625 0 0 0 1.25 0V4.825a.625.625 0 1 0-1.25 0V9.15H4.1zM17.074 8.45a.6.6 0 0 1 .073.362q.003.03.003.063v6.3a.625.625 0 1 1-1.25 0V9.802l-1.55.846a.625.625 0 1 1-.6-1.098l2.476-1.35a.625.625 0 0 1 .848.25" fill="currentColor"/>
    </svg>
  )
}

function Heading2Icon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M3.65 4.825a.625.625 0 1 0-1.25 0v10.35a.625.625 0 0 0 1.25 0V10.4h6.4v4.775a.625.625 0 0 0 1.25 0V4.825a.625.625 0 1 0-1.25 0V9.15h-6.4zm10.104 5.164c.19-.457.722-.84 1.394-.84.89 0 1.48.627 1.48 1.238 0 .271-.104.53-.302.746l-3.837 3.585a.625.625 0 0 0 .427 1.082h4.5a.625.625 0 1 0 0-1.25H14.5l2.695-2.518.027-.028c.406-.43.657-.994.657-1.617 0-1.44-1.299-2.488-2.731-2.488-1.128 0-2.145.643-2.548 1.608a.625.625 0 0 0 1.154.482" fill="currentColor"/>
    </svg>
  )
}

function Heading3Icon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M2.877 4.2c.346 0 .625.28.625.625V9.15h6.4V4.825a.625.625 0 0 1 1.25 0v10.35a.625.625 0 0 1-1.25 0V10.4h-6.4v4.775a.625.625 0 0 1-1.25 0V4.825c0-.345.28-.625.625-.625M14.93 9.37c-.692 0-1.183.34-1.341.671a.625.625 0 1 1-1.128-.539c.416-.87 1.422-1.382 2.47-1.382.686 0 1.33.212 1.818.584.487.373.843.932.843 1.598 0 .629-.316 1.162-.76 1.533l.024.018c.515.389.892.972.892 1.669 0 .696-.377 1.28-.892 1.668s-1.198.61-1.926.61c-1.1 0-2.143-.514-2.599-1.389a.625.625 0 0 1 1.109-.578c.187.36.728.717 1.49.717.482 0 .895-.148 1.174-.358s.394-.453.394-.67-.116-.46-.394-.67c-.28-.21-.692-.358-1.174-.358h-.461a.625.625 0 0 1 0-1.25h.357a1 1 0 0 1 .104-.01c.437 0 .81-.135 1.06-.326s.351-.41.351-.605-.101-.415-.351-.606-.623-.327-1.06-.327" fill="currentColor"/>
    </svg>
  )
}

function BulletListIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M4.809 12.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M16 13.375a.625.625 0 1 1 0 1.25H8.5a.625.625 0 0 1 0-1.25zM4.809 4.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M16 5.375a.625.625 0 1 1 0 1.25H8.5a.625.625 0 0 1 0-1.25z" fill="currentColor"/>
    </svg>
  )
}

function NumberedListIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M5.088 3.026a.55.55 0 0 1 .27.474v4a.55.55 0 0 1-1.1 0V4.435l-.24.134a.55.55 0 1 1-.535-.962l1.059-.588a.55.55 0 0 1 .546.007M8.5 5.375a.625.625 0 1 0 0 1.25H16a.625.625 0 1 0 0-1.25zm0 8a.625.625 0 0 0 0 1.25H16a.625.625 0 1 0 0-1.25zM6 16.55H3.5a.55.55 0 0 1-.417-.908l1.923-2.24a.7.7 0 0 0 .166-.45.335.335 0 0 0-.266-.327l-.164-.035a.6.6 0 0 0-.245.004l-.03.007a.57.57 0 0 0-.426.44.55.55 0 1 1-1.08-.206 1.67 1.67 0 0 1 1.248-1.304l.029-.007c.24-.058.49-.061.732-.01l.164.035c.664.14 1.138.726 1.138 1.404 0 .427-.153.84-.432 1.165L4.697 15.45H6a.55.55 0 0 1 0 1.1" fill="currentColor"/>
    </svg>
  )
}

function TodoListIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M6.184 10.804a1.1 1.1 0 0 1 1.1 1.1v2.8a1.1 1.1 0 0 1-1.1 1.1h-2.8a1.1 1.1 0 0 1-1.1-1.1v-2.8a1.1 1.1 0 0 1 1.1-1.1zm-2.65 3.75h2.5v-2.5h-2.5zm13.339-1.875a.626.626 0 0 1 0 1.25H9.748a.625.625 0 1 1 0-1.25zM6.748 3.394a.625.625 0 0 1 1.072.642l-2.85 4.75a.626.626 0 0 1-1.01.086l-1.9-2.217a.626.626 0 0 1 .949-.813l1.336 1.557zm10.125 2.634a.626.626 0 0 1 0 1.25H9.748a.625.625 0 0 1 0-1.25z" fill="currentColor"/>
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M12.6 3.172a.625.625 0 0 0-1.201-.344l-4 14a.625.625 0 0 0 1.202.344zM5.842 5.158a.625.625 0 0 1 0 .884L1.884 10l3.958 3.958a.625.625 0 0 1-.884.884l-4.4-4.4a.625.625 0 0 1 0-.884l4.4-4.4a.625.625 0 0 1 .884 0m8.316 0a.625.625 0 0 1 .884 0l4.4 4.4a.625.625 0 0 1 0 .884l-4.4 4.4a.625.625 0 0 1-.884-.884L18.116 10l-3.958-3.958a.625.625 0 0 1 0-.884" fill="currentColor"/>
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <path d="M15.796 4.971a5.067 5.067 0 0 0-5.067 5.067v.635a4.433 4.433 0 0 0 4.433 4.433 3.164 3.164 0 1 0-3.11-3.75 3.2 3.2 0 0 1-.073-.683v-.635a3.817 3.817 0 0 1 3.817-3.817h.635a.625.625 0 1 0 0-1.25zm-9.054 0a5.067 5.067 0 0 0-5.067 5.068v.634a4.433 4.433 0 0 0 4.433 4.433 3.164 3.164 0 1 0-3.11-3.75 3.2 3.2 0 0 1-.073-.683v-.634A3.817 3.817 0 0 1 6.742 6.22h.635a.625.625 0 1 0 0-1.25z" fill="currentColor"/>
    </svg>
  )
}

HandleMenu.displayName = 'HandleMenu'
