/**
 * 列自动清理 Plugin
 *
 * 职责：监听文档变化，自动执行清理操作
 */

import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { COLUMNS_NODE_NAME, CLEANUP_SKIP_META } from '../../model'
import { CleanupExecutor } from '../../service'

const PLUGIN_KEY = new PluginKey('multiColumnCleanup')

/**
 * 遍历文档，查找所有 columns 节点
 */
function findColumnsNodes(
  doc: ProseMirrorNode
): Array<{ node: ProseMirrorNode; pos: number }> {
  const columnsNodes: Array<{ node: ProseMirrorNode; pos: number }> = []

  doc.descendants((node, pos) => {
    if (node.type.name === COLUMNS_NODE_NAME) {
      columnsNodes.push({ node, pos })
      return false // 不再深入 columns 内部
    }
    return true
  })

  return columnsNodes
}

/**
 * 创建列自动清理插件
 */
export function createCleanupPlugin(): Plugin {
  return new Plugin({
    key: PLUGIN_KEY,

    appendTransaction(
      transactions: readonly Transaction[],
      _oldState: EditorState,
      newState: EditorState
    ): Transaction | null {
      // 只在有文档变化时才处理
      const docChanged = transactions.some((tr) => tr.docChanged)
      if (!docChanged) {
        return null
      }

      // 如果事务要求跳过清理，直接退出
      const shouldSkip = transactions.some((tr) =>
        tr.getMeta(CLEANUP_SKIP_META)
      )
      if (shouldSkip) {
        return null
      }

      // 查找所有 columns 节点
      const columnsNodes = findColumnsNodes(newState.doc)
      if (columnsNodes.length === 0) {
        return null
      }

      // 创建清理事务
      let tr = newState.tr
      let hasChanges = false

      // 从后往前处理，避免位置偏移问题
      for (let i = columnsNodes.length - 1; i >= 0; i--) {
        const { node, pos } = columnsNodes[i]

        // 检测清理动作
        const action = CleanupExecutor.detectCleanupAction(node, pos)
        if (action.type !== 'none') {
          tr = CleanupExecutor.executeCleanup(tr, action)
          hasChanges = true
          break // 每次只执行一个清理，避免冲突
        }
      }

      return hasChanges ? tr : null
    },
  })
}
