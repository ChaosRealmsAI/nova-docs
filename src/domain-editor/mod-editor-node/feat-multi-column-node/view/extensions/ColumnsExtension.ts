/**
 * Columns 节点定义（列容器）
 */

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { loggers } from '@nova/infrastructure/logger'
import {
  COLUMNS_NODE_NAME,
  COLUMN_NODE_NAME,
  DEFAULT_COLUMNS,
  CLEANUP_SKIP_META,
  type ColumnWidths,
} from '../../model'
import { NestingValidator, WidthCalculator } from '../../service'
import { TipTapColumnsContainer } from '../components/TipTapColumnsContainer'
import { createCleanupPlugin } from './CleanupPlugin'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    multiColumn: {
      insertColumns: (columns?: number) => ReturnType
      setColumnWidths: (widths: ColumnWidths) => ReturnType
      setColumnsLayout: (layout: 'stacked' | 'grid') => ReturnType
    }
  }
}

export const ColumnsExtension = Node.create({
  name: COLUMNS_NODE_NAME,

  group: 'block',

  // 至少包含 2 列
  content: `${COLUMN_NODE_NAME} ${COLUMN_NODE_NAME}+`,

  isolating: true,

  addAttributes() {
    return {
      count: {
        default: DEFAULT_COLUMNS,
        parseHTML: (element) => {
          return parseInt(element.getAttribute('data-columns') || `${DEFAULT_COLUMNS}`)
        },
        renderHTML: (attributes) => {
          return {
            'data-columns': attributes.count,
          }
        },
      },
      columnWidths: {
        default: [],
        parseHTML: (element) => {
          const widths = element.getAttribute('data-column-widths')
          return widths ? JSON.parse(widths) : []
        },
        renderHTML: (attributes) => {
          if (attributes.columnWidths?.length) {
            return {
              'data-column-widths': JSON.stringify(attributes.columnWidths),
            }
          }
          return {}
        },
      },
      layout: {
        default: 'grid',
        parseHTML: (element) => element.getAttribute('data-layout') || 'grid',
        renderHTML: (attributes) => ({
          'data-layout': attributes.layout || 'grid',
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'columns',
      }),
      0,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TipTapColumnsContainer)
  },

  addCommands() {
    return {
      insertColumns:
        (columns = DEFAULT_COLUMNS) =>
        ({ commands, state }) => {
          // 检查当前位置是否在 column 内
          const validation = NestingValidator.canCreateColumns(state)
          if (!validation.valid) {
            loggers.multiColumn.debug('[ColumnsExtension]', validation.error)
            return false
          }

          const columnNodes = []
          const widths = WidthCalculator.initializeWidths(columns)

          for (let i = 0; i < columns; i++) {
            columnNodes.push({
              type: COLUMN_NODE_NAME,
              attrs: { width: widths[i] },
              content: [
                {
                  type: 'paragraph',
                  content: [],
                },
              ],
            })
          }

          const inserted = commands.insertContent({
            type: this.name,
            attrs: {
              count: columns,
              columnWidths: widths,
              layout: 'grid',
            },
            content: columnNodes,
          })

          if (inserted && this.editor.view) {
            const metaTr = this.editor.state.tr
            metaTr.setMeta(CLEANUP_SKIP_META, true)
            if (!metaTr.docChanged) {
              this.editor.view.dispatch(metaTr)
            }
          }

          return inserted
        },

      setColumnWidths:
        (widths: ColumnWidths) =>
        ({ state, dispatch }) => {
          const { selection } = state
          const node = selection.$from.node(selection.$from.depth)

          if (node.type.name !== this.name) return false

          if (dispatch) {
            const { tr } = state
            tr.setNodeMarkup(selection.$from.before(selection.$from.depth), undefined, {
              ...node.attrs,
              columnWidths: widths,
            })
            dispatch(tr)
          }

          return true
        },

      setColumnsLayout:
        (layout: 'stacked' | 'grid') =>
        ({ state, dispatch }) => {
          const { selection } = state
          const node = selection.$from.node(selection.$from.depth)

          if (node.type.name !== this.name) return false

          if (dispatch) {
            const { tr } = state
            tr.setNodeMarkup(selection.$from.before(selection.$from.depth), undefined, {
              ...node.attrs,
              layout,
            })
            dispatch(tr)
          }

          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-2': () => this.editor.commands.insertColumns(2),
      'Mod-Alt-3': () => this.editor.commands.insertColumns(3),
    }
  },

  addProseMirrorPlugins() {
    return [createCleanupPlugin()]
  },
})
