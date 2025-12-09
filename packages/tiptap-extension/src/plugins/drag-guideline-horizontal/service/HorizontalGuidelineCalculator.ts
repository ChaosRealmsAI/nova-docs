import type { EditorView } from '@tiptap/pm/view'
import { dropPoint } from '@tiptap/pm/transform'
import { loggers } from '@/infrastructure/logger'
import {
  DEFAULT_HORIZONTAL_GUIDELINE_OPTIONS,
  INITIAL_HORIZONTAL_GUIDELINE_STATE,
  type HorizontalGuidelineOptions,
  type HorizontalGuidelineState,
} from '../model'
import { HorizontalRectCalculator } from './HorizontalRectCalculator'

/** 列 gap 热区检测配置 */
const COLUMN_GAP_HOTZONE = {
  containerSelector: '.columns-container-grid',
  columnSelector: '[data-type="column"]',
  threshold: 24, // 与竖线热区阈值保持一致
}

/**
 * 横向拖拽引导线计算器（v1）
 *
 * 参考历史实现，仅负责：
 * - 普通块级节点之间的横线提示
 * - 禁止拖拽到自身范围内时显示横线
 * - 在列 gap 热区内时隐藏横线（让竖线独占显示）
 */
export class HorizontalGuidelineCalculator {
  private readonly options: Required<HorizontalGuidelineOptions>
  private rectCalculator: HorizontalRectCalculator | null = null

  constructor(options: HorizontalGuidelineOptions = {}) {
    this.options = {
      ...DEFAULT_HORIZONTAL_GUIDELINE_OPTIONS,
      ...options,
    }
  }

  private ensureRectCalculator(view: EditorView): HorizontalRectCalculator {
    if (!this.rectCalculator) {
      this.rectCalculator = new HorizontalRectCalculator(view, this.options.thickness)
    }
    return this.rectCalculator
  }

  /**
   * 检测鼠标是否在列间 gap 热区内
   *
   * 当在热区内时，横线应隐藏，让竖线独占显示（互斥逻辑）
   *
   *     列 1          │    列 2
   *                ←24px→←24px→
   *                   │▌▌▌▌│
   *                   │▌▌▌▌│  ← 只显示竖线
   *                   │▌▌▌▌│
   */
  private isInsideColumnGapHotzone(rootElement: HTMLElement, mouseX: number, mouseY: number): boolean {
    const containers = rootElement.querySelectorAll<HTMLElement>(COLUMN_GAP_HOTZONE.containerSelector)
    if (containers.length === 0) {
      return false
    }

    const threshold = COLUMN_GAP_HOTZONE.threshold

    for (const container of containers) {
      const containerRect = container.getBoundingClientRect()

      // 检查是否在容器垂直范围内（含 threshold 扩展）
      if (mouseY < containerRect.top - threshold || mouseY > containerRect.bottom + threshold) {
        continue
      }

      const columns = container.querySelectorAll<HTMLElement>(COLUMN_GAP_HOTZONE.columnSelector)
      if (columns.length < 2) {
        // 单列或无列时，没有 gap
        continue
      }

      const columnRects = Array.from(columns).map((c) => c.getBoundingClientRect())

      // 检测列间 gap 热区（以 gap 中心为基准）
      for (let i = 0; i < columnRects.length - 1; i++) {
        const gapCenter = (columnRects[i].right + columnRects[i + 1].left) / 2
        if (Math.abs(mouseX - gapCenter) <= threshold) {
          return true
        }
      }
    }

    return false
  }

  calculate(view: EditorView, event: DragEvent): HorizontalGuidelineState {
    if (!view.editable) {
      return { ...INITIAL_HORIZONTAL_GUIDELINE_STATE, reason: 'readonly' }
    }

    if (!view.dragging) {
      return { ...INITIAL_HORIZONTAL_GUIDELINE_STATE, reason: 'no-dragging' }
    }

    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
    if (!pos) {
      return { ...INITIAL_HORIZONTAL_GUIDELINE_STATE, reason: 'outside-editor' }
    }

    // 简单的"拖到自己身上"检测：目标位置落在拖拽片段区间内则隐藏横线
    const dragging = view.dragging as any
    if (dragging.from !== undefined && dragging.to !== undefined) {
      if (pos.pos >= dragging.from && pos.pos <= dragging.to) {
        if (this.options.debug) {
          loggers.dragGuideline.debug('horizontal-v1: dropping on self, hide guideline', {
            targetPos: pos.pos,
            from: dragging.from,
            to: dragging.to,
          })
        }
        return { ...INITIAL_HORIZONTAL_GUIDELINE_STATE, reason: 'drop-on-self' }
      }
    }

    // 列 gap 热区检测：在热区内时隐藏横线，让竖线独占显示
    if (this.isInsideColumnGapHotzone(view.dom as HTMLElement, event.clientX, event.clientY)) {
      if (this.options.debug) {
        loggers.dragGuideline.debug('horizontal-v1: inside column gap hotzone, hide guideline')
      }
      return { ...INITIAL_HORIZONTAL_GUIDELINE_STATE, reason: 'column-gap-hotzone' }
    }

    const slice = view.dragging?.slice
    let insertPos = pos.pos

    if (slice) {
      try {
        const point = dropPoint(view.state.doc, pos.pos, slice)
        if (point != null) {
          insertPos = point
        }
      } catch (error) {
        if (this.options.debug) {
          loggers.dragGuideline.warn('horizontal-v1: dropPoint failed, fallback to raw pos', {
            error,
          })
        }
      }
    }

    const rectCalculator = this.ensureRectCalculator(view)
    const rect = rectCalculator.computeRect(insertPos)
    if (!rect) {
      return { ...INITIAL_HORIZONTAL_GUIDELINE_STATE, reason: 'no-rect' }
    }

    if (this.options.debug) {
      loggers.dragGuideline.debug('horizontal-v1: computed rect', rect)
    }

    return {
      isVisible: true,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      reason: 'ok',
    }
  }

  clear(): HorizontalGuidelineState {
    return { ...INITIAL_HORIZONTAL_GUIDELINE_STATE, reason: 'cleared' }
  }
}
