/**
 * Column 节点定义（单列）
 */

import { Node, mergeAttributes } from '@tiptap/core'
import { COLUMN_NODE_NAME } from '../../model'

export const ColumnExtension = Node.create({
  name: COLUMN_NODE_NAME,

  // 列内可以包含任何 block 内容
  content: 'block+',

  // 隔离模式，防止内容溢出
  isolating: true,

  addAttributes() {
    return {
      width: {
        default: null,
        parseHTML: (element) => {
          return element.getAttribute('data-width') || null
        },
        renderHTML: (attributes) => {
          if (attributes.width) {
            return {
              'data-width': attributes.width,
            }
          }
          return {}
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'column',
        class: 'multi-column-item',
      }),
      0,
    ]
  },
})
