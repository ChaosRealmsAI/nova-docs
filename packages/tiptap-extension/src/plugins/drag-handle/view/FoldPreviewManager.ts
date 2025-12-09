/**
 * Fold Preview Manager
 *
 * 折叠预览管理器 - 管理标题折叠的预览和切换
 * 从 HandleView 中提取的折叠预览逻辑
 */

import type { EditorView } from '@tiptap/pm/view'
import { calculateFoldRange, isHeadingNode } from '@/nodes/heading-structure/service/fold/RangeCalculator'

/**
 * 折叠预览管理器
 * 负责标题折叠的预览效果
 */
export class FoldPreviewManager {
  private foldPreviewTargets: Set<string> = new Set()

  constructor(
    private editorView: EditorView,
    private handles: Map<string, HTMLElement>,
    private highlights: Map<string, HTMLElement>
  ) {}

  /**
   * 更新 EditorView 引用（文档变化时）
   */
  updateView(view: EditorView) {
    this.editorView = view
  }

  /**
   * 切换标题折叠状态
   */
  toggleHeadingFold(headingPos: number) {
    this.clearFoldPreviewHighlights()
    const state = this.editorView.state
    const node = state.doc.nodeAt(headingPos)

    if (!node || (node.type.name !== 'heading' && node.type.name !== 'numberedHeading')) {
      return
    }

    const tr = state.tr
    tr.setNodeMarkup(headingPos, undefined, {
      ...node.attrs,
      collapsed: !node.attrs.collapsed
    })
    tr.setMeta('fold-changed', true)
    this.editorView.dispatch(tr)
  }

  /**
   * 预览折叠范围
   */
  previewFoldRange(pos: number) {
    const node = this.editorView.state.doc.nodeAt(pos)
    if (!node || !isHeadingNode(node)) {
      return
    }

    const headingLevel = typeof node.attrs.level === 'number'
      ? node.attrs.level
      : parseInt(String(node.attrs.level ?? 1), 10) || 1
    const range = calculateFoldRange(pos, headingLevel, this.editorView.state.doc)

    if (!range) {
      this.clearFoldPreviewHighlights()
      return
    }

    this.applyFoldPreview(range.from, range.to, headingLevel)
  }

  /**
   * 应用折叠预览高亮
   */
  private applyFoldPreview(rangeFrom: number, rangeTo: number, headingLevel: number) {
    this.clearFoldPreviewHighlights()

    const doc = this.editorView.state.doc

    type FoldPreviewCandidate = {
      nodeId: string
      startPos: number
      endPos: number
      nodeType: string | null
      handleLevel: number
    }

    const candidates: FoldPreviewCandidate[] = []

    // 第一步：收集折叠范围内的所有候选节点
    this.handles.forEach((handle, nodeId) => {
      const posAttr = handle.getAttribute('data-pos')
      if (!posAttr) {
        return
      }

      const startPos = Number(posAttr)
      if (Number.isNaN(startPos)) {
        return
      }

      // 只高亮在折叠范围内的节点
      if (startPos >= rangeFrom && startPos < rangeTo) {
        const nodeType = handle.getAttribute('data-node-type')
        const handleLevel = Number(handle.getAttribute('data-heading-level') || '0')

        // 排除同级或更高级的 heading
        if (
          nodeType &&
          (nodeType === 'heading' || nodeType === 'numberedHeading') &&
          handleLevel > 0 &&
          handleLevel <= headingLevel
        ) {
          return
        }

        const node = doc.nodeAt(startPos)
        if (!node) {
          return
        }

        candidates.push({
          nodeId,
          startPos,
          endPos: startPos + node.nodeSize,
          nodeType,
          handleLevel,
        })
      }
    })

    // 第二步：只保留"最外层"的候选节点（排除被其他候选完全包裹的嵌套节点）
    const outerCandidates = candidates.filter((candidate, index) => {
      return !candidates.some((other, otherIndex) => {
        if (otherIndex === index) return false
        return other.startPos <= candidate.startPos && other.endPos >= candidate.endPos
      })
    })

    // 第三步：对外层节点应用高亮
    outerCandidates.forEach(candidate => {
      const highlight = this.highlights.get(candidate.nodeId)
      if (highlight) {
        highlight.classList.add('fold-preview-active')
        this.foldPreviewTargets.add(candidate.nodeId)
      }
    })
  }

  /**
   * 清除折叠预览高亮
   */
  clearFoldPreviewHighlights() {
    this.foldPreviewTargets.forEach(nodeId => {
      const highlight = this.highlights.get(nodeId)
      if (highlight) {
        highlight.classList.remove('fold-preview-active')
      }
    })
    this.foldPreviewTargets.clear()
  }
}
