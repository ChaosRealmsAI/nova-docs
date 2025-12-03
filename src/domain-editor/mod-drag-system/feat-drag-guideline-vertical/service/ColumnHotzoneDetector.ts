import { loggers } from '@nova/infrastructure/logger'
import type {
  ColumnHotzoneType,
  VerticalGuidelineOptions,
} from '../model'

interface ColumnHotzoneDetectorConfig {
  threshold: number
  containerSelector: string
  columnSelector: string
  debug: boolean
}

export interface ColumnHotzoneDetectionResult {
  /** 热区类型：只有 'gap'（列间间隙），左右边缘由编辑器边缘拖拽处理 */
  type: ColumnHotzoneType
  edgeX: number
  top: number
  bottom: number
  columnIndex: number | null
  /** 多列容器的 DOM 元素，用于后续获取 ProseMirror 位置 */
  columnsElement: HTMLElement
}

/**
 * 列热区检测器（竖线专用，独立于横线实现）
 */
export class ColumnHotzoneDetector {
  private config: ColumnHotzoneDetectorConfig

  constructor(options: VerticalGuidelineOptions) {
    this.config = {
      threshold: options.columnHotzoneThreshold ?? 24,
      containerSelector: options.columnContainerSelector ?? '.columns-container-grid',
      columnSelector: options.columnSelector ?? '[data-type="column"]',
      debug: options.debug ?? false,
    }
  }

  update(options: VerticalGuidelineOptions): void {
    this.config = {
      threshold: options.columnHotzoneThreshold ?? this.config.threshold,
      containerSelector: options.columnContainerSelector ?? this.config.containerSelector,
      columnSelector: options.columnSelector ?? this.config.columnSelector,
      debug: options.debug ?? this.config.debug,
    }
  }

  /**
   * 检测鼠标是否在列间 gap 热区内
   *
   * 设计说明：
   * - 只检测列与列之间的 gap 热区（以 gap 中心为基准，左右各 threshold px）
   * - 左右边缘不在此处理，由编辑器边缘拖拽逻辑（EditorBorderDetector）处理
   *
   *     列 1          │    列 2
   *                ←24px→←24px→
   *                   │▌▌▌▌│
   *                   │▌▌▌▌│  ← 竖线（gap 中心）
   *                   │▌▌▌▌│
   *                   └─┬──┘
   *                     │
   *                gap 热区
   */
  detect(mouseX: number, mouseY: number, rootElement: HTMLElement): ColumnHotzoneDetectionResult | null {
    const containers = rootElement.querySelectorAll<HTMLElement>(this.config.containerSelector)
    if (containers.length === 0) {
      return null
    }

    for (const container of containers) {
      const containerRect = container.getBoundingClientRect()
      const threshold = this.config.threshold

      const withinVertical =
        mouseY >= containerRect.top - threshold && mouseY <= containerRect.bottom + threshold
      if (!withinVertical) {
        continue
      }

      const columns = container.querySelectorAll<HTMLElement>(this.config.columnSelector)
      if (columns.length < 2) {
        // 单列或无列时，没有 gap，跳过
        continue
      }

      const columnRects = Array.from(columns).map((column) => column.getBoundingClientRect())

      // 只检测列间 gap 热区（以 gap 中心为基准）
      for (let i = 0; i < columnRects.length - 1; i++) {
        const currentRect = columnRects[i]
        const nextRect = columnRects[i + 1]
        const gapCenter = (currentRect.right + nextRect.left) / 2

        if (Math.abs(mouseX - gapCenter) <= threshold) {
          if (this.config.debug) {
            loggers.dragGuideline.debug('vertical: Gap 热区命中', { mouseX, gapCenter, index: i })
          }
          return {
            type: 'gap',
            edgeX: gapCenter,
            top: containerRect.top,
            bottom: containerRect.bottom,
            columnIndex: i,
            columnsElement: container,
          }
        }
      }
    }

    return null
  }
}

