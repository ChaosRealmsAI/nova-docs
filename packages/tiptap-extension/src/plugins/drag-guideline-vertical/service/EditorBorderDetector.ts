import { loggers } from '@/infrastructure/logger'
import type { VerticalGuidelineOptions, VerticalGuidelineSide } from '../model'

export interface EditorBorderDetectionResult {
  side: VerticalGuidelineSide
  edgeX: number
  top: number
  bottom: number
}

/**
 * 编辑器边缘热区检测（竖线专用）
 *
 * 用于检测“鼠标在编辑器左/右侧外一定范围内”的情况，
 * 以显示贯穿目标块的竖线。
 */
export class EditorBorderDetector {
  constructor(private readonly options: Required<VerticalGuidelineOptions>) {}

  detect(
    clientX: number,
    clientY: number,
    editorRect: DOMRect,
  ): EditorBorderDetectionResult | null {
    const { editorBorderHorizontalThreshold, editorBorderVerticalTolerance, debug } = this.options

    const withinVertical =
      clientY >= editorRect.top - editorBorderVerticalTolerance &&
      clientY <= editorRect.bottom + editorBorderVerticalTolerance
    if (!withinVertical) {
      return null
    }

    const leftLimit = editorRect.left - editorBorderHorizontalThreshold
    const rightLimit = editorRect.right + editorBorderHorizontalThreshold

    // 左侧热区
    if (clientX >= leftLimit && clientX < editorRect.left) {
      if (debug) {
        loggers.dragGuideline.debug('vertical: 编辑器左侧边缘热区命中', {
          clientX,
          editorLeft: editorRect.left,
          leftLimit,
        })
      }
      return {
        side: 'left',
        edgeX: editorRect.left,
        top: editorRect.top,
        bottom: editorRect.bottom,
      }
    }

    // 右侧热区
    if (clientX <= rightLimit && clientX > editorRect.right) {
      if (debug) {
        loggers.dragGuideline.debug('vertical: 编辑器右侧边缘热区命中', {
          clientX,
          editorRight: editorRect.right,
          rightLimit,
        })
      }
      return {
        side: 'right',
        edgeX: editorRect.right,
        top: editorRect.top,
        bottom: editorRect.bottom,
      }
    }

    return null
  }
}

