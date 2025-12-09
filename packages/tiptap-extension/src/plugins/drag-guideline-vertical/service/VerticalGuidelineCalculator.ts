import type { EditorView } from '@tiptap/pm/view'
import { loggers } from '@/infrastructure/logger'
import {
  INITIAL_VERTICAL_GUIDELINE_STATE,
  type VerticalGuidelineOptions,
  type VerticalGuidelineState,
} from '../model'
import { ColumnHotzoneDetector, type ColumnHotzoneDetectionResult } from './ColumnHotzoneDetector'
import { EditorBorderDetector, type EditorBorderDetectionResult } from './EditorBorderDetector'
import { BorderNodeFinder } from './BorderNodeFinder'
import { COLUMNS_NODE_NAME } from '@/nodes/multi-column/model'

/**
 * 竖线引导线计算器
 *
 * 职责：
 * - 编辑器内部：检测多列容器的列边缘 / gap，生成 columns-edge 模式状态
 * - 编辑器外部：检测编辑器边缘热区，生成 editor-border 模式状态
 */
export class VerticalGuidelineCalculator {
  private readonly options: Required<VerticalGuidelineOptions>
  private readonly columnDetector: ColumnHotzoneDetector
  private readonly borderDetector: EditorBorderDetector
  private borderNodeFinder: BorderNodeFinder | null = null

  constructor(options: VerticalGuidelineOptions) {
    this.options = {
      columnContainerSelector: options.columnContainerSelector ?? '.columns-container-grid',
      columnSelector: options.columnSelector ?? '[data-type="column"]',
      columnHotzoneThreshold: options.columnHotzoneThreshold ?? 24,
      enableColumnGuideline: options.enableColumnGuideline ?? true,
      enableEditorBorderGuideline: options.enableEditorBorderGuideline ?? true,
      editorBorderHorizontalThreshold: options.editorBorderHorizontalThreshold ?? 1000,
      editorBorderVerticalTolerance: options.editorBorderVerticalTolerance ?? 50,
      debug: options.debug ?? false,
    }

    this.columnDetector = new ColumnHotzoneDetector(this.options)
    this.borderDetector = new EditorBorderDetector(this.options)
  }

  /**
   * 编辑器内部 dragover 处理
   */
  calculateForEditorDragover(view: EditorView, event: DragEvent): VerticalGuidelineState {
    if (!view.editable || !view.dragging) {
      return INITIAL_VERTICAL_GUIDELINE_STATE
    }

    if (!this.options.enableColumnGuideline) {
      return INITIAL_VERTICAL_GUIDELINE_STATE
    }

    const hotzone = this.columnDetector.detect(event.clientX, event.clientY, view.dom as HTMLElement)
    if (!hotzone) {
      if (this.options.debug) {
        loggers.dragGuideline.debug('VerticalGuideline: editor dragover, no hotzone detected')
      }
      return INITIAL_VERTICAL_GUIDELINE_STATE
    }

    return this.buildColumnEdgeState(view, hotzone)
  }

  /**
   * 全局 dragover（编辑器外部）处理
   */
  calculateForGlobalDragover(view: EditorView, event: DragEvent): VerticalGuidelineState {
    if (!view.editable || !view.dragging) {
      return INITIAL_VERTICAL_GUIDELINE_STATE
    }

    if (!this.options.enableEditorBorderGuideline) {
      return INITIAL_VERTICAL_GUIDELINE_STATE
    }

    const editorRect = view.dom.getBoundingClientRect()

    // 鼠标在编辑器内部则忽略，由编辑器内部逻辑处理
    const insideEditor =
      event.clientX >= editorRect.left &&
      event.clientX <= editorRect.right &&
      event.clientY >= editorRect.top &&
      event.clientY <= editorRect.bottom
    if (insideEditor) {
      return INITIAL_VERTICAL_GUIDELINE_STATE
    }

    const borderInfo = this.borderDetector.detect(event.clientX, event.clientY, editorRect)
    if (!borderInfo) {
      return INITIAL_VERTICAL_GUIDELINE_STATE
    }

    const blockRect = this.resolveBorderBlockRect(view, event.clientY, editorRect)

    if (!blockRect) {
      // 在节点间隙等无法确定目标块的位置时，不显示竖线
      return INITIAL_VERTICAL_GUIDELINE_STATE
    }

    // 计算目标块在文档中的位置 & 是否在多列容器内
    if (!this.borderNodeFinder) {
      this.borderNodeFinder = new BorderNodeFinder(view)
    }
    const targetDom = this.borderNodeFinder.findTargetBlockAtY(event.clientY, editorRect)
    if (!targetDom) {
      return INITIAL_VERTICAL_GUIDELINE_STATE
    }

    const targetPos = view.posAtDOM(targetDom, 0)
    if (targetPos == null) {
      return INITIAL_VERTICAL_GUIDELINE_STATE
    }

    const $target = view.state.doc.resolve(targetPos)
    let isInsideColumns = false
    for (let depth = $target.depth; depth >= 0; depth--) {
      const node = $target.node(depth)
      if (node.type.name === COLUMNS_NODE_NAME) {
        isInsideColumns = true
        break
      }
    }

    return this.buildEditorBorderState(borderInfo, blockRect, targetPos, isInsideColumns)
  }

  clear(): VerticalGuidelineState {
    return INITIAL_VERTICAL_GUIDELINE_STATE
  }

  private buildColumnEdgeState(view: EditorView, hotzone: ColumnHotzoneDetectionResult): VerticalGuidelineState {
    // 获取 columns 容器的 ProseMirror 位置
    const columnsPos = view.posAtDOM(hotzone.columnsElement, 0)

    // 映射热区类型到 side
    // 'gap' 类型表示在列间间隙，插入到当前列的右边（即下一列的左边）
    let side: 'left' | 'right' | null = null
    if (hotzone.type === 'left-edge') {
      side = 'left'
    } else if (hotzone.type === 'right-edge' || hotzone.type === 'column-gap' || hotzone.type === 'gap') {
      side = 'right'
    }

    return {
      mode: 'columns-edge',
      isVisible: true,
      edgeX: hotzone.edgeX,
      top: hotzone.top,
      bottom: hotzone.bottom,
      side, // 修正：根据热区类型设置 side，满足 DropExecutor 的检查
      hotzoneType: hotzone.type,
      targetColumnIndex: hotzone.columnIndex ?? null,
      targetNodePos: columnsPos ?? null,
      isInsideColumns: true,
    }
  }

  private buildEditorBorderState(
    border: EditorBorderDetectionResult,
    blockRect: Pick<DOMRect, 'top' | 'bottom'>,
    targetNodePos: number,
    isInsideColumns: boolean,
  ): VerticalGuidelineState {
    return {
      mode: 'editor-border',
      isVisible: true,
      edgeX: border.edgeX,
      top: blockRect.top,
      bottom: blockRect.bottom,
      side: border.side,
      hotzoneType: null,
      targetColumnIndex: null,
      targetNodePos,
      isInsideColumns,
    }
  }

  /**
   * 解析编辑器边缘拖拽时的目标块高度
   *
   * 思路：
   * - 使用与官方 dropcursor 类似的方式：
   *   - 在编辑器内部选取一个 X（靠近左/右边缘），Y 使用当前鼠标 Y
   *   - 使用 posAtCoords 找到该位置对应的文档位置
   *   - 向上寻找最近的块级节点，取其 DOMRect 作为 blockRect
   * - 找不到块级节点时，退回整个编辑区域高度
   */
  private resolveBorderBlockRect(
    view: EditorView,
    clientY: number,
    editorRect: DOMRect,
  ): Pick<DOMRect, 'top' | 'bottom'> | null {
    if (!this.borderNodeFinder) {
      this.borderNodeFinder = new BorderNodeFinder(view)
    }

    const target = this.borderNodeFinder.findTargetBlockAtY(clientY, editorRect)
    if (!target) {
      return null
    }

    const rect = target.getBoundingClientRect()

    return {
      top: Math.max(rect.top, editorRect.top),
      bottom: Math.min(rect.bottom, editorRect.bottom),
    }
  }
}
