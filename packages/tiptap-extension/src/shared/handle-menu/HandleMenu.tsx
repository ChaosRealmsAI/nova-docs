/**
 * Handle Menu 组件（句柄菜单）
 *
 * 简化版：只保留复制和删除功能
 */

import React from 'react'
import { useI18n } from '@/lib/i18n'
import './handle-menu.css'

export interface HandleMenuProps {
  /** 是否显示菜单 */
  open?: boolean

  /** 菜单位置 */
  position?: { x: number; y: number }

  /** 关闭菜单回调 */
  onClose?: () => void

  /** Duplicate 点击 */
  onDuplicate?: () => void

  /** Delete 点击 */
  onDelete?: () => void

  /** 鼠标进入菜单区域 */
  onMouseEnter?: () => void

  /** 鼠标离开菜单区域 */
  onMouseLeave?: () => void
}

export const HandleMenu: React.FC<HandleMenuProps> = ({
  open = false,
  position = { x: 0, y: 0 },
  onClose,
  onDuplicate,
  onDelete,
  onMouseEnter,
  onMouseLeave
}) => {
  const { t } = useI18n()
  const menuRef = React.useRef<HTMLDivElement>(null)

  // 监听外部点击关闭菜单
  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (!menuRef.current?.contains(target)) {
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

  if (!open) return null

  return (
    <div
      ref={menuRef}
      className="handle-menu-dialog"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="handle-menu-content">
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
  )
}

// Icons
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

HandleMenu.displayName = 'HandleMenu'
