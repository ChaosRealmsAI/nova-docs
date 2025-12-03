/**
 * Callout Node 定义
 *
 * 基于 TipTap/ProseMirror 的 Callout 节点
 */

import { Node, mergeAttributes } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import type { CalloutTheme } from '../model/types'
import { DEFAULT_CALLOUT_ATTRS, getDefaultEmoji } from '../model'
import { CalloutNodeView } from './callout-nodeview'

export interface CalloutOptions {
  /** HTML 属性 */
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * 插入 Callout 节点
       */
      insertCallout: (attrs?: { theme?: CalloutTheme; emoji?: string }) => ReturnType
      /**
       * 更新 Callout 属性
       */
      updateCalloutAttrs: (attrs: { theme?: CalloutTheme; emoji?: string; customColor?: string }) => ReturnType
    }
  }
}

export const CalloutNode = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      theme: {
        default: DEFAULT_CALLOUT_ATTRS.theme,
        parseHTML: (element) => element.getAttribute('data-theme') || DEFAULT_CALLOUT_ATTRS.theme,
        renderHTML: (attributes) => ({
          'data-theme': attributes.theme,
        }),
      },
      emoji: {
        default: DEFAULT_CALLOUT_ATTRS.emoji,
        parseHTML: (element) => {
          const theme = element.getAttribute('data-theme') as CalloutTheme
          const emoji = element.getAttribute('data-emoji')
          return emoji || getDefaultEmoji(theme || 'blue')
        },
        renderHTML: (attributes) => ({
          'data-emoji': attributes.emoji,
        }),
      },
      customColor: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-custom-color') || null,
        renderHTML: (attributes) => {
          if (attributes.customColor) {
            return { 'data-custom-color': attributes.customColor }
          }
          return {}
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ]
  },

  renderHTML({ node: _node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-type': 'callout',
        }
      ),
      0, // 内容插槽
    ]
  },

  addNodeView() {
    return CalloutNodeView
  },

  addCommands() {
    return {
      insertCallout:
        (attrs = {}) =>
        ({ commands }) => {
          const theme = attrs.theme || DEFAULT_CALLOUT_ATTRS.theme
          const emoji = attrs.emoji || getDefaultEmoji(theme)

          return commands.insertContent({
            type: this.name,
            attrs: {
              theme,
              emoji,
            },
            content: [
              {
                type: 'paragraph',
              },
            ],
          })
        },

      updateCalloutAttrs:
        (attrs) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          const { $from } = selection

          // 查找最近的 callout 节点
          let calloutNode: PMNode | null = null
          let calloutPos: number | null = null

          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth)
            if (node.type.name === 'callout') {
              calloutNode = node
              calloutPos = $from.before(depth)
              break
            }
          }

          if (!calloutNode || calloutPos === null) {
            return false
          }

          if (dispatch) {
            tr.setNodeMarkup(calloutPos, undefined, {
              ...calloutNode.attrs,
              ...attrs,
            })
          }

          return true
        },
    }
  },
})
