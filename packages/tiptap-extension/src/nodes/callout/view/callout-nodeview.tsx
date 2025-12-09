/**
 * Callout NodeView
 *
 * 使用 React 渲染 Callout 节点
 */

import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/core'
import type { CalloutTheme } from '../model/types'
import type { CalloutType } from '../../../shared/ui/callout/Callout'
import { HoverToolbar } from './hover-toolbar'
import './icon-picker.css'
import './color-picker.css'
import './hover-toolbar.css'

/**
 * 将 CalloutTheme 映射到 shared/ui 的 CalloutType
 */
const THEME_TO_TYPE_MAP: Record<CalloutTheme, CalloutType> = {
  blue: 'info',
  green: 'success',
  yellow: 'warning',
  red: 'danger',
  gray: 'note',
  purple: 'purple',
  orange: 'orange',
  cyan: 'cyan',
}

/**
 * Callout NodeView 组件
 */
function CalloutNodeViewComponent(props: NodeViewProps) {
  const { node, editor, getPos, deleteNode } = props
  const { theme, emoji, customColor } = node.attrs

  // 将主题映射到类型
  const calloutType = THEME_TO_TYPE_MAP[theme as CalloutTheme] || 'info'

  // 处理颜色变更
  const handleColorChange = (newTheme: CalloutTheme, newCustomColor?: string) => {
    const pos = getPos()
    if (typeof pos !== 'number') return

    editor.commands.command(({ tr, dispatch }) => {
      if (dispatch) {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          theme: newTheme,
          customColor: newCustomColor || null,
        })
      }
      return true
    })
  }

  // 处理 Emoji 变更
  const handleEmojiChange = (newEmoji: string) => {
    const pos = getPos()
    if (typeof pos !== 'number') return

    editor.commands.command(({ tr, dispatch }) => {
      if (dispatch) {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          emoji: newEmoji,
        })
      }
      return true
    })
  }

  // 处理删除
  const handleDelete = () => {
    deleteNode()
  }

  return (
    <NodeViewWrapper data-callout-node-view>
      <div
        className={`callout-wrapper`}
        data-theme={theme}
        data-emoji={emoji}
        style={{ position: 'relative' }}
      >
        {/* Hover 工具栏 - 始终渲染，通过 CSS 控制显示 */}
        <HoverToolbar
          currentTheme={theme}
          currentEmoji={emoji}
          currentCustomColor={customColor}
          visible={true}
          onEmojiChange={handleEmojiChange}
          onColorChange={handleColorChange}
          onDelete={handleDelete}
        />

        <div className={`callout-container callout-${calloutType}`}>
          {/* Emoji 显示（只读） */}
          <div className="callout-emoji-container" contentEditable={false}>
            <span className="callout-emoji-display">{emoji}</span>
          </div>

          {/* 内容区域（可编辑） */}
          <div className="callout-content">
            <NodeViewContent />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

/**
 * 导出 ReactNodeViewRenderer
 */
export const CalloutNodeView = ReactNodeViewRenderer(CalloutNodeViewComponent)
