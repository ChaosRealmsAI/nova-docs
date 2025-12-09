/**
 * Empty Node Menu 组件（空节点加号菜单）
 *
 * 基于 empty-node-menu.html 复刻
 * 功能：
 * - 基础部分：图标网格显示常用块类型（H1/H2/H3/列表/代码/引用等）
 * - 常用部分：列表显示表格、分栏、高亮块等
 */

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import * as MenuIcons from '../menu-icons'
import './empty-node-menu.css'

export interface EmptyNodeMenuProps {
  /** 是否显示菜单 */
  open?: boolean

  /** 菜单位置 */
  position?: { x: number; y: number }

  /** 关闭菜单回调 */
  onClose?: () => void

  /** 块类型选择回调 */
  onSelect?: (type: string) => void

  /** 鼠标进入菜单回调（用于保持菜单显示） */
  onMouseEnter?: () => void

  /** 鼠标离开菜单回调（用于延迟隐藏菜单） */
  onMouseLeave?: () => void
}

export const EmptyNodeMenu: React.FC<EmptyNodeMenuProps> = ({
  open = false,
  position = { x: 0, y: 0 },
  onClose,
  onSelect,
  onMouseEnter,
  onMouseLeave
}) => {
  const { t } = useI18n()
  // 注意：BASIC_BLOCKS 的 title 原本是英文，这里暂时保留，因为没有对应的翻译键
  // 如果需要翻译，可以添加对应的键
  const BASIC_BLOCKS = [
    { type: 'heading1', title: 'Heading 1', icon: Heading1Icon },
    { type: 'heading2', title: 'Heading 2', icon: Heading2Icon },
    { type: 'heading3', title: 'Heading 3', icon: Heading3Icon },
    { type: 'numberedList', title: 'Numbered list', icon: NumberedListIcon },
    { type: 'bulletList', title: 'Bulleted list', icon: BulletListIcon },
    { type: 'todoList', title: 'To-do list', icon: TodoListIcon },
    { type: 'code', title: 'Code', icon: CodeIcon },
    { type: 'quote', title: 'Quote', icon: QuoteIcon }
  ]

  const COMMON_BLOCKS = [
    { type: 'table', label: t('emptyMenuTable'), icon: TableIcon },
    { type: 'columns', label: t('emptyMenuColumns'), icon: ColumnsIcon },
    { type: 'callout', label: t('emptyMenuCallout'), icon: CalloutIcon }
  ]

  if (!open) return null

  return (
    <>
      {/* 菜单对话框 - 由 tippy.js 控制位置，这里不需要遮罩层 */}
      <div
        className="empty-node-menu-dialog notion-bg-dialog notion-shadow-dialog"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="empty-node-menu-content">
          {/* 基础块 - 图标网格 */}
          <div className="empty-node-menu-section basic-section">
            <div className="basic-grid">
              {BASIC_BLOCKS.map((block) => (
                <div
                  key={block.type}
                  className="basic-grid-item"
                  title={block.title}
                  onClick={() => {
                    onSelect?.(block.type)
                    onClose?.()
                  }}
                >
                  <block.icon />
                </div>
              ))}
            </div>
          </div>

          {/* 分隔线 */}
          <div className="empty-node-menu-separator-wrapper">
            <div className="empty-node-menu-separator notion-separator" />
          </div>

          {/* 常用块 - 列表 */}
          <div className="empty-node-menu-section common-section">
            {COMMON_BLOCKS.map((block) => (
              <div
                key={block.type}
                className="common-list-item notion-menu-item"
                onClick={() => {
                  onSelect?.(block.type)
                  onClose?.()
                }}
              >
                <div className="common-list-item-icon notion-text-secondary">
                  <block.icon />
                </div>
                <div className="common-list-item-label notion-text-primary">
                  {block.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// Icons - 基础块图标（图标网格用）
function Heading1Icon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 3a1 1 0 0 0-1 1v16a1 1 0 1 0 2 0v-7h9v7a1 1 0 1 0 2 0V4a1 1 0 1 0-2 0v7H3V4a1 1 0 0 0-1-1Zm15.604 9.91a.4.4 0 0 1-.585-.355c0-.533 0-.774.004-1.582a.4.4 0 0 1 .203-.347l2.769-1.568A.39.39 0 0 1 20.197 9h1.404c.234 0 .423.21.423.468V19.95c0 .593-.483 1.073-1.075 1.073a1.07 1.07 0 0 1-1.07-1.073v-8.228l-2.275 1.19Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Heading2Icon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 3a1 1 0 0 0-1 1v16a1 1 0 1 0 2 0v-7h9v7a1 1 0 1 0 2 0V4a1 1 0 1 0-2 0v7H3V4a1 1 0 0 0-1-1Zm20.993 16.872c0-.561-.455-1.015-1.017-1.015h-3.121l3.407-4.272a3.35 3.35 0 0 0 .731-2.126c-.01-.992-.347-1.816-1.005-2.464-.647-.651-1.492-.984-2.523-.995-.931.011-1.72.34-2.356.982-.37.386-.941 1.044-.941 1.602 0 .591.48 1.07 1.07 1.07.563 0 .769-.347.993-.726.06-.101.12-.204.19-.304a1.36 1.36 0 0 1 .186-.214c.262-.252.584-.376.982-.376.447.01.784.15 1.02.423.234.28.35.606.35.987 0 .146-.019.303-.057.471-.05.152-.156.341-.315.548l-4.402 5.506a.4.4 0 0 0-.087.25v1.022c0 .221.267.65.606.65h5.272c.562 0 1.017-.457 1.017-1.019Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Heading3Icon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 3a1 1 0 0 0-1 1v16a1 1 0 1 0 2 0v-7h9v7a1 1 0 1 0 2 0V4a1 1 0 1 0-2 0v7H3V4a1 1 0 0 0-1-1Zm21 14.296c0-.51-.108-.998-.324-1.461a2.923 2.923 0 0 0-.877-1.044c.377-.297.65-.63.816-1.001.17-.44.252-.886.252-1.348a3.48 3.48 0 0 0-.943-2.385C21.274 9.363 20.398 9.01 19.31 9a3.179 3.179 0 0 0-2.251.932c-.349.336-.848.879-.848 1.384a1 1 0 0 0 1 1c.482 0 .767-.352 1.043-.692l.09-.11c.057-.07.121-.132.192-.185.256-.2.53-.296.834-.296.431.01.779.144 1.049.405.267.267.406.61.415 1.04 0 .417-.133.75-.4 1.008-.335.335-.766.387-1.212.387a.958.958 0 1 0 0 1.917h.088c.452-.002.824-.003 1.205.353.29.277.442.674.452 1.201-.01.51-.16.894-.451 1.162-.296.296-.65.44-1.076.44-.4 0-.712-.107-.944-.316l-.008-.008a8.055 8.055 0 0 1-.213-.207c-.1-.099-.178-.207-.254-.31-.193-.264-.366-.5-.81-.5a1 1 0 0 0-1 1c0 .574.543 1.19.954 1.533.635.53 1.35.84 2.174.84 1.057-.01 1.93-.35 2.609-1.018.69-.651 1.04-1.545 1.052-2.664Z"
        fill="currentColor"
      />
    </svg>
  )
}

function NumberedListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4.577 1.809a.543.543 0 0 0-.819-.469l-.502.296-.004.003-.309.187c-.342.207-.858.519-1.142.701a.573.573 0 0 0-.261.485c0 .482.544.774.948.522.227-.141.465-.287.642-.395v3.478a.723.723 0 1 0 1.447 0V1.81Zm-.899 7.128c-1.233 0-2.056.817-2.056 1.84a.25.25 0 0 0 .25.251h.891a.259.259 0 0 0 .26-.259c0-.32.227-.589.608-.589a.62.62 0 0 1 .428.15.52.52 0 0 1 .16.396c0 .315-.188.579-.538.949l-1.815 1.968a.672.672 0 0 0 .494 1.127h3.003a.63.63 0 0 0 0-1.26H3.744l.933-1.047c.61-.652.99-1.127.99-1.834a1.57 1.57 0 0 0-.563-1.226c-.356-.3-.852-.466-1.426-.466Zm.015 7.429c-1.006 0-1.692.478-1.946 1.178a.541.541 0 0 0 .107.553c.122.137.307.22.503.22a.773.773 0 0 0 .478-.18c.125-.098.23-.222.312-.33.096-.124.257-.224.511-.224.21 0 .37.063.472.152a.46.46 0 0 1 .16.359v.002a.503.503 0 0 1-.165.391.71.71 0 0 1-.483.16h-.14a.606.606 0 1 0 0 1.213h.168c.275 0 .468.074.59.178a.538.538 0 0 1 .186.42.554.554 0 0 1-.185.435c-.122.107-.314.184-.583.184-.32 0-.528-.114-.644-.264a1.776 1.776 0 0 0-.308-.323.766.766 0 0 0-.47-.174.678.678 0 0 0-.504.22.549.549 0 0 0-.114.55c.244.717.926 1.22 2.012 1.22.602 0 1.161-.168 1.575-.478.416-.311.683-.768.676-1.323-.01-.69-.376-1.122-.793-1.332.34-.231.63-.644.621-1.224-.019-.962-.92-1.583-2.036-1.583ZM8 4a1 1 0 0 1 1-1h13a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm0 8a1 1 0 0 1 1-1h13a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm0 8a1 1 0 0 1 1-1h13a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Z"
        fill="currentColor"
      />
    </svg>
  )
}

function BulletListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3.5 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM9 3a1 1 0 0 0 0 2h13a1 1 0 1 0 0-2H9Zm0 8a1 1 0 1 0 0 2h13a1 1 0 1 0 0-2H9Zm-1 9a1 1 0 0 1 1-1h13a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm-3-8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-1.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        fill="currentColor"
      />
    </svg>
  )
}

function TodoListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M17.207 10.207a1 1 0 0 0-1.414-1.414L11 13.586l-2.293-2.293a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l5.5-5.5Z"
        fill="currentColor"
      />
      <path
        d="M2 4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm2 0v16h16V4H4Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.865 21C4.275 21 2 18.88 2 15.037c0-4.5 3.143-9.725 6.518-12.422a.888.888 0 0 1 1.203.107c.398.424.32 1.11-.112 1.5-2.412 2.17-5.32 6.855-5.153 9.055.215-.113 1.277-.516 2.801-.516 2.197 0 3.845 1.726 3.845 4.002A4.22 4.22 0 0 1 6.865 21Zm10.898 0c-2.59 0-4.865-2.119-4.865-5.963 0-4.5 3.143-9.725 6.518-12.422a.888.888 0 0 1 1.203.107c.398.424.32 1.11-.112 1.5-2.412 2.17-5.32 6.855-5.153 9.055.215-.113 1.277-.516 2.801-.516 2.197 0 3.845 1.726 3.845 4.002A4.22 4.22 0 0 1 17.763 21Z"
        fill="currentColor"
      />
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm16 2v6H4V4h16ZM3 16a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm1 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H4Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icons - 常用块图标（列表用）
function TableIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path d="M19.5 4.25v15.5H4V4.25h15.5ZM4 2.25a2 2 0 0 0-2 2v15.5a2 2 0 0 0 2 2h15.5a2 2 0 0 0 2-2V4.25a2 2 0 0 0-2-2H4Z" fill="currentColor"/>
      <path d="M9.997 4.25v3.835H19.5v2H9.997v3.83H19.5v2H9.997v3.835h-2v-3.835H4v-2h3.997v-3.83H4v-2h3.997V4.25h2Z" fill="currentColor"/>
    </svg>
  )
}

function ColumnsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path d="M11 5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V5ZM4 5h5v14H4V5Zm18 0a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V5Zm-7 0h5v14h-5V5Z" fill="currentColor"/>
    </svg>
  )
}

function CalloutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path d="M4 2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm16 2v6H4V4h16ZM3 16a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm1 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H4Z" fill="currentColor"/>
    </svg>
  )
}

EmptyNodeMenu.displayName = 'EmptyNodeMenu'
