/**
 * 列操作服务
 *
 * 职责：执行添加列、删除列等操作
 */

import type { Editor } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { loggers } from '@/infrastructure/logger'
import {
  MAX_COLUMNS,
  MIN_COLUMNS,
  CLEANUP_SKIP_META,
  COLUMN_NODE_NAME,
  type ColumnWidths,
  type ValidationResult,
} from '../model'
import { WidthCalculator } from './WidthCalculator'

export interface AddColumnParams {
  editor: Editor
  node: ProseMirrorNode
  nodePos: number
  afterIndex: number
  currentWidths: ColumnWidths
}

export interface RemoveColumnParams {
  editor: Editor
  node: ProseMirrorNode
  nodePos: number
  columnIndex: number
  currentWidths: ColumnWidths
}

export class ColumnOperations {
  /**
   * 验证是否可以添加列
   */
  static canAddColumn(currentColumnCount: number): ValidationResult {
    if (currentColumnCount >= MAX_COLUMNS) {
      return {
        valid: false,
        error: `已达到最大列数限制 ${MAX_COLUMNS}`,
      }
    }
    return { valid: true }
  }

  /**
   * 验证是否可以删除列
   */
  static canRemoveColumn(currentColumnCount: number): ValidationResult {
    if (currentColumnCount <= MIN_COLUMNS) {
      return {
        valid: false,
        error: `已达到最小列数限制 ${MIN_COLUMNS}`,
      }
    }
    return { valid: true }
  }

  /**
   * 添加列
   */
  static addColumn(params: AddColumnParams): boolean {
    const { editor, node, nodePos, afterIndex, currentWidths } = params

    loggers.multiColumn.debug('➕ 开始添加列', {
      nodePos,
      afterIndex,
      currentWidths,
      currentColumnCount: currentWidths.length,
    })

    // 验证是否可以添加
    const validation = this.canAddColumn(currentWidths.length)
    if (!validation.valid) {
      loggers.multiColumn.warn('无法添加列', { error: validation.error })
      return false
    }

    const { tr } = editor.state

    // 计算新宽度
    const newWidths = WidthCalculator.widthsAfterAddColumn(currentWidths.length + 1)
    loggers.multiColumn.debug('📏 计算新列宽', {
      oldWidths: currentWidths,
      newWidths,
      oldColumnCount: currentWidths.length,
      newColumnCount: newWidths.length,
    })

    // 更新容器属性
    tr.setNodeMarkup(nodePos, undefined, {
      ...node.attrs,
      count: newWidths.length,
      columnWidths: newWidths,
    })

    // 创建新列
    const columnType = editor.schema.nodes[COLUMN_NODE_NAME]
    const newWidthPerColumn = 100 / newWidths.length
    const newColumn = columnType.create(
      { width: newWidthPerColumn },
      editor.schema.nodes.paragraph.create()
    )

    // 计算插入位置
    let insertPos = nodePos + 1
    for (let i = 0; i <= afterIndex && i < node.childCount; i++) {
      insertPos += node.child(i).nodeSize
    }

    loggers.multiColumn.debug('📍 新列插入位置', { insertPos, afterIndex })

    tr.insert(insertPos, newColumn)
    tr.setMeta(CLEANUP_SKIP_META, true)
    editor.view.dispatch(tr)

    loggers.multiColumn.info('✅ 列添加完成，transaction 已 dispatch', {
      nodePos,
      afterIndex,
      columnCount: newWidths.length,
    })

    return true
  }

  /**
   * 删除列
   */
  static removeColumn(params: RemoveColumnParams): boolean {
    const { editor, node, nodePos, columnIndex, currentWidths } = params

    // 验证是否可以删除
    const validation = this.canRemoveColumn(currentWidths.length)
    if (!validation.valid) {
      loggers.multiColumn.warn('无法删除列', { error: validation.error })
      return false
    }

    if (columnIndex >= node.childCount) {
      loggers.multiColumn.warn('列索引超出范围', { columnIndex, totalColumns: node.childCount })
      return false
    }

    const { tr } = editor.state

    // 计算新宽度
    const newWidths = WidthCalculator.widthsAfterRemoveColumn(currentWidths.length - 1)

    // 更新容器属性
    tr.setNodeMarkup(nodePos, undefined, {
      ...node.attrs,
      count: newWidths.length,
      columnWidths: newWidths,
    })

    // 计算删除位置
    let deletePos = nodePos + 1
    for (let i = 0; i < columnIndex && i < node.childCount; i++) {
      deletePos += node.child(i).nodeSize
    }

    // 删除列
    const columnNode = node.child(columnIndex)
    tr.delete(deletePos, deletePos + columnNode.nodeSize)

    editor.view.dispatch(tr)

    return true
  }

  /**
   * 更新列宽属性
   */
  static updateColumnWidths(
    editor: Editor,
    node: ProseMirrorNode,
    nodePos: number,
    newWidths: ColumnWidths
  ): void {
    const { tr } = editor.state
    tr.setNodeMarkup(nodePos, undefined, {
      ...node.attrs,
      columnWidths: newWidths,
    })
    editor.view.dispatch(tr)
  }
}
