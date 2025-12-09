/**
 * 嵌套验证器
 *
 * 职责：检测并阻止在列内创建列容器
 */

import type { EditorState } from '@tiptap/pm/state'
import { COLUMN_NODE_NAME, type ValidationResult } from '../model'

export class NestingValidator {
  /**
   * 检查当前位置是否允许创建列容器
   *
   * @param state - 编辑器状态
   * @returns 验证结果
   */
  static canCreateColumns(state: EditorState): ValidationResult {
    const { $from } = state.selection

    // 从当前位置向上遍历，检查是否在 column 节点内
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth)
      if (node.type.name === COLUMN_NODE_NAME) {
        return {
          valid: false,
          error: '不允许在列内创建列容器（防止嵌套）',
        }
      }
    }

    return { valid: true }
  }

  /**
   * 检查节点是否在列内
   *
   * @param state - 编辑器状态
   * @param pos - 节点位置
   * @returns 是否在列内
   */
  static isInsideColumn(state: EditorState, pos: number): boolean {
    const $pos = state.doc.resolve(pos)

    for (let depth = $pos.depth; depth > 0; depth--) {
      const node = $pos.node(depth)
      if (node.type.name === COLUMN_NODE_NAME) {
        return true
      }
    }

    return false
  }
}
