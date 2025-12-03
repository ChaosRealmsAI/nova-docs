import { mergeAttributes, InputRule } from '@tiptap/core'
import Heading from '@tiptap/extension-heading'
import type { Editor } from '@tiptap/core'
import {
  createNumberingPlugin,
  createNumberingShortcuts,
} from '../service/numbering'
import { createFoldPlugin } from '../service/fold'
import { loggers } from '@nova/infrastructure/logger'
import { MAX_HEADING_LEVEL, MAX_INDENT_LEVEL, MIN_HEADING_LEVEL } from '../model'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    headingStructure: {
      toggleNumbered: () => ReturnType
      indentHeading: () => ReturnType
      outdentHeading: () => ReturnType
      toggleFold: () => ReturnType
    }
  }
}

export const HeadingStructureExtension = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      numbered: {
        default: false,
        parseHTML: element => element.getAttribute('data-numbered') === 'true' || element.getAttribute('data-type') === 'numbered',
        renderHTML: attributes => {
          if (attributes.numbered) {
            return { 'data-numbered': 'true', 'data-type': 'numbered' }
          }
          return {}
        },
      },
      manualNumber: {
        default: null,
        parseHTML: element => element.getAttribute('data-manual-number'),
        renderHTML: attributes => {
          if (attributes.manualNumber) {
            return { 'data-manual-number': attributes.manualNumber }
          }
          return {}
        },
      },
      indent: {
        default: 0,
        parseHTML: element => {
          const indent = element.getAttribute('data-indent')
          return indent ? Number(indent) : 0
        },
        renderHTML: attributes => {
          if (attributes.indent && attributes.indent > 0) {
            return { 'data-indent': attributes.indent }
          }
          return {}
        },
      },
      collapsed: {
        default: false,
        parseHTML: element => element.getAttribute('data-collapsed') === 'true',
        renderHTML: attributes => {
          if (attributes.collapsed) {
            return { 'data-collapsed': 'true' }
          }
          return {}
        },
      },
    }
  },

  addCommands() {
    // ... commands ...
    return {
      ...this.parent?.(),
      toggleNumbered: () => ({ state, dispatch }) => {
        // ... existing implementation ...
        const { $from } = state.selection
        const node = $from.parent
        if (node.type.name !== 'heading') {
          return false
        }
        if (dispatch) {
          const tr = state.tr
          tr.setNodeMarkup($from.before(), undefined, {
            ...node.attrs,
            numbered: !node.attrs.numbered,
            // 如果关闭编号，同时也清除手动编号
            manualNumber: !node.attrs.numbered ? node.attrs.manualNumber : null,
          })
          tr.setMeta('fold-changed', true)
          dispatch(tr)
        }
        return true
      },
      // ... other commands ...
      indentHeading: () => ({ state, dispatch }) => {
        // ... existing implementation ...
         const { $from } = state.selection
        const node = $from.parent
        if (node.type.name !== 'heading' || !node.attrs.numbered) {
          return false
        }
        const indent = node.attrs.indent as number
        const level = node.attrs.level as number
        if (indent >= MAX_INDENT_LEVEL || level >= MAX_HEADING_LEVEL) {
          return false
        }
        if (dispatch) {
          loggers.headingExtension.debug('增加缩进', { indent, level })
          const tr = state.tr
          tr.setNodeMarkup($from.before(), undefined, {
            ...node.attrs,
            indent: indent + 1,
            level: Math.min(level + 1, MAX_HEADING_LEVEL),
          })
          tr.setMeta('numbering-changed', true)
          dispatch(tr)
        }
        return true
      },
      outdentHeading: () => ({ state, dispatch }) => {
        // ... existing implementation ...
        const { $from } = state.selection
        const node = $from.parent
        if (node.type.name !== 'heading' || !node.attrs.numbered) {
          return false
        }
        const indent = node.attrs.indent as number
        const level = node.attrs.level as number
        if (indent === 0) {
          return false
        }
        if (dispatch) {
          loggers.headingExtension.debug('减少缩进', { indent, level })
          const tr = state.tr
          tr.setNodeMarkup($from.before(), undefined, {
            ...node.attrs,
            indent: indent - 1,
            level: Math.max(level - 1, MIN_HEADING_LEVEL),
          })
          tr.setMeta('numbering-changed', true)
          dispatch(tr)
        }
        return true
      },
      toggleFold: () => ({ state, dispatch }) => {
         const { $from } = state.selection
        const node = $from.parent
        if (node.type.name !== 'heading') {
          return false
        }
        if (dispatch) {
          loggers.headingExtension.debug('切换折叠状态', {
            level: node.attrs.level,
            collapsed: !node.attrs.collapsed,
          })
          const tr = state.tr
          tr.setNodeMarkup($from.before(), undefined, {
            ...node.attrs,
            collapsed: !node.attrs.collapsed,
          })
          tr.setMeta('fold-changed', true)
          dispatch(tr)
        }
        return true
      },
    }
  },

  addInputRules() {
    const parentRules = this.parent?.() ?? []

    // 新增规则：捕获 "1. " 或 "1.3. " 并设置为手动编号
    // 支持多级编号格式如 "1.2.3."
    const manualNumberingRule = new InputRule({
      find: /^((?:\d+\.)+)\s$/,
      handler: ({ state, range, match }) => {
        const { tr } = state
        const start = range.from
        const end = range.to
        const numberText = match[1] // e.g. "1." or "1.3."

        // 删除输入的 "1. " 或 "1.3. "
        tr.delete(start, end)

        // 更新节点属性：开启 numbered，并设置 manualNumber
        const $start = tr.doc.resolve(start)
        const node = $start.parent

        if (node.type.name === 'heading') {
           tr.setNodeMarkup($start.before(), undefined, {
            ...node.attrs,
            numbered: true,
            manualNumber: numberText
          })
        }
      }
    })

    return [...parentRules, manualNumberingRule]
  },

  addKeyboardShortcuts() {
    const parentShortcuts = this.parent?.() ?? {}
    // 移除快捷键
    return {
      ...parentShortcuts,
    }
  },

  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level)
    const level = hasLevel ? node.attrs.level : this.options.levels[0]
    const extraAttrs: Record<string, string> = {}
    
    if (node.attrs.numbered) {
      extraAttrs['data-numbered'] = 'true'
      // 只有当确实有 manualNumber 时才输出，或者根据需求输出
      if (node.attrs.manualNumber) {
        extraAttrs['data-manual-number'] = node.attrs.manualNumber
      }
    }

    if (node.attrs.collapsed) {
      extraAttrs['data-collapsed'] = 'true'
    }

    if (node.attrs.indent > 0) {
      extraAttrs['data-indent'] = String(node.attrs.indent)
    }

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, extraAttrs),
      0,
    ]
  },

  addProseMirrorPlugins() {
    const parent = this.parent?.() ?? []
    return [
      ...parent,
      createNumberingPlugin(),
      createFoldPlugin(),
    ]
  },
})
