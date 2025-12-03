import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

export interface RectResult {
  left: number
  right: number
  top: number
  bottom: number
}

/**
 * 从历史实现中抽取的横线矩形计算逻辑
 *
 * 基于 ProseMirror 文档结构与 DOM 布局，计算“块与块之间横线”的位置。
 */
export class HorizontalRectCalculator {
  constructor(
    private readonly editorView: EditorView,
    private readonly thickness: number,
  ) {}

  computeRect(cursorPos: number): RectResult | null {
    const state = this.editorView.state
    const $pos = state.doc.resolve(cursorPos)
    const isBlock = !$pos.parent.inlineContent

    let rect: RectResult | null = null

    if (isBlock) {
      const before: ProseMirrorNode | null | undefined = $pos.nodeBefore
      const after: ProseMirrorNode | null | undefined = $pos.nodeAfter

      if (before || after) {
        const basePos = cursorPos - (before ? before.nodeSize : 0)
        const node = this.editorView.nodeDOM(basePos)
        if (node && node instanceof HTMLElement) {
          const nodeRect = node.getBoundingClientRect()
          let top = before ? nodeRect.bottom : nodeRect.top

          if (before && after) {
            const afterDOM = this.editorView.nodeDOM(cursorPos)
            if (afterDOM && afterDOM instanceof HTMLElement) {
              const afterRect = afterDOM.getBoundingClientRect()
              top = (top + afterRect.top) / 2
            }
          }

          const halfThickness = this.thickness / 2
          rect = {
            left: nodeRect.left,
            right: nodeRect.right,
            top: top - halfThickness,
            bottom: top + halfThickness,
          }
        }
      }
    }

    if (!rect) {
      const coords = this.editorView.coordsAtPos(cursorPos)
      const halfThickness = this.thickness / 2
      rect = {
        left: coords.left - halfThickness,
        right: coords.left + halfThickness,
        top: coords.top,
        bottom: coords.bottom ?? coords.top,
      }
    }

    return rect
  }
}
