/**
 * 清理执行器
 *
 * 职责：检测并执行列容器的自动清理
 */

import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import {
  MIN_COLUMNS,
  COLUMNS_NODE_NAME,
  COLUMN_NODE_NAME,
  type CleanupAction,
} from '../model'
import { WidthCalculator } from './WidthCalculator'

export class CleanupExecutor {
  /**
   * 检测是否需要清理
   *
   * @param node - columns 节点
   * @param pos - 节点位置
   * @returns 清理动作
   */
  static detectCleanupAction(
    node: ProseMirrorNode,
    pos: number
  ): CleanupAction {
    if (node.type.name !== COLUMNS_NODE_NAME) {
      return { type: 'none' }
    }

    // 优先级1：检查是否少于最小列数（需要解除容器）
    if (node.childCount < MIN_COLUMNS) {
      return {
        type: 'unwrap-single-column',
        columnsPos: pos,
      }
    }

    // 优先级2：检查是否有空列（需要删除）
    const emptyColumnIndex = this.findFirstEmptyColumn(node)
    if (emptyColumnIndex !== -1) {
      return {
        type: 'remove-empty-column',
        columnsPos: pos,
        columnIndex: emptyColumnIndex,
      }
    }

    return { type: 'none' }
  }

  /**
   * 执行清理动作
   *
   * @param tr - 事务
   * @param action - 清理动作
   * @returns 修改后的事务
   */
  static executeCleanup(tr: Transaction, action: CleanupAction): Transaction {
    if (action.type === 'unwrap-single-column') {
      return this.unwrapColumns(tr, action.columnsPos)
    }

    if (action.type === 'remove-empty-column') {
      return this.removeEmptyColumn(tr, action.columnsPos, action.columnIndex)
    }

    return tr
  }

  /**
   * 查找第一个空列
   *
   * @param columnsNode - columns 节点
   * @returns 空列索引，如果没有则返回 -1
   */
  private static findFirstEmptyColumn(columnsNode: ProseMirrorNode): number {
    for (let i = 0; i < columnsNode.childCount; i++) {
      const column = columnsNode.child(i)
      if (this.isColumnEmpty(column)) {
        return i
      }
    }
    return -1
  }

  /**
   * 判断列是否为空
   *
   * @param columnNode - column 节点
   * @returns 是否为空
   */
  private static isColumnEmpty(columnNode: ProseMirrorNode): boolean {
    if (columnNode.type.name !== COLUMN_NODE_NAME) {
      return false
    }

    // 如果列中没有内容
    if (columnNode.childCount === 0) {
      return true
    }

    // 如果列中只有一个空段落
    if (columnNode.childCount === 1) {
      const child = columnNode.child(0)
      if (child.type.name === 'paragraph' && child.childCount === 0) {
        return true
      }
    }

    return false
  }

  /**
   * 解除列容器（提取内容到父级）
   *
   * @param tr - 事务
   * @param columnsPos - columns 节点位置
   * @returns 修改后的事务
   */
  private static unwrapColumns(
    tr: Transaction,
    columnsPos: number
  ): Transaction {
    const columnsNode = tr.doc.nodeAt(columnsPos)

    if (!columnsNode || columnsNode.type.name !== COLUMNS_NODE_NAME) {
      return tr
    }

    // 收集所有列中的内容
    const content: ProseMirrorNode[] = []
    columnsNode.forEach((column) => {
      if (column.type.name !== COLUMN_NODE_NAME) {
        return
      }

      column.forEach((child) => {
        content.push(child)
      })
    })

    // 删除 columns 节点
    tr.delete(columnsPos, columnsPos + columnsNode.nodeSize)

    // 插入提取的内容
    if (content.length > 0) {
      tr.insert(columnsPos, content)
    }

    return tr
  }

  /**
   * 删除空列
   *
   * @param tr - 事务
   * @param columnsPos - columns 节点位置
   * @param columnIndex - 列索引
   * @returns 修改后的事务
   */
  private static removeEmptyColumn(
    tr: Transaction,
    columnsPos: number,
    columnIndex: number
  ): Transaction {
    const columnsNode = tr.doc.nodeAt(columnsPos)

    if (!columnsNode || columnsNode.type.name !== COLUMNS_NODE_NAME) {
      return tr
    }

    // 计算删除位置
    let deletePos = columnsPos + 1
    for (let i = 0; i < columnIndex; i++) {
      deletePos += columnsNode.child(i).nodeSize
    }

    const columnNode = columnsNode.child(columnIndex)
    const deleteEnd = deletePos + columnNode.nodeSize

    // 删除列
    tr.delete(deletePos, deleteEnd)

    const newColumnCount = columnsNode.childCount - 1

    // 如果删除后少于最小列数，触发解除容器
    if (newColumnCount < MIN_COLUMNS) {
      return this.unwrapColumns(tr, columnsPos)
    }

    // 重新计算宽度
    const newWidths = WidthCalculator.widthsAfterRemoveColumn(newColumnCount)

    // 更新容器属性
    tr.setNodeMarkup(columnsPos, undefined, {
      ...columnsNode.attrs,
      count: newColumnCount,
      columnWidths: newWidths,
    })

    return tr
  }
}
