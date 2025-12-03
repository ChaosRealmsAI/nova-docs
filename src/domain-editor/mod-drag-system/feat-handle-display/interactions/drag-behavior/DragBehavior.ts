import { TextSelection, NodeSelection } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'
import { calculateFoldRange, getHeadingDepth, isHeadingNode } from '@nova/domain-editor/mod-editor-node/feat-heading-structure/service/fold/RangeCalculator'
import { DragPreviewRenderer, type DragPreviewResult } from './DragPreviewRenderer'
import { NodeMatcher, type NodeBoundarySelectorConfig } from '../..//service/NodeMatcher'
import { loggers } from '@nova/infrastructure/logger'

export interface DragBehaviorOptions {
  resolveNodePosition?: (nodeId: string, fallbackPos: number) => number | null
  onDragStart?: () => void
  onDragEnd?: () => void
}

interface DragState {
  nodeId: string
  handleElement: HTMLElement
}

export class DragBehavior {
  private editorView: EditorView
  private options: DragBehaviorOptions
  private previewRenderer: DragPreviewRenderer
  private currentPreview: DragPreviewResult | null = null
  private dragState: DragState | null = null
  private boundHandlers = new Map<HTMLElement, { start: EventListener; end: EventListener }>()
  private boundaryMatcher: NodeMatcher

  constructor(view: EditorView, options: DragBehaviorOptions = {}) {
    this.editorView = view
    this.options = options
    this.previewRenderer = new DragPreviewRenderer()
    this.boundaryMatcher = new NodeMatcher()
  }

  setupDraggable(handle: HTMLElement, nodeId: string, pos: number) {
    handle.draggable = true

    const onDragStart = (event: Event) => {
      this.handleDragStart(event as DragEvent, nodeId, pos)
    }

    const onDragEnd = () => {
      this.handleDragEnd()
    }

    handle.addEventListener('dragstart', onDragStart)
    handle.addEventListener('dragend', onDragEnd)

    this.boundHandlers.set(handle, { start: onDragStart, end: onDragEnd })
  }

  destroy() {
    this.boundHandlers.forEach((handlers, element) => {
      element.removeEventListener('dragstart', handlers.start)
      element.removeEventListener('dragend', handlers.end)
    })
    this.boundHandlers.clear()
    this.cleanupPreview()
  }

  isDragging(): boolean {
    return !!this.dragState
  }

  private handleDragStart(event: DragEvent, nodeId: string, fallbackPos: number) {
    if (!event.dataTransfer) {
      return
    }

    const doc = this.editorView.state.doc
    const nodePos = this.options.resolveNodePosition?.(nodeId, fallbackPos) ?? fallbackPos
    const node = doc.nodeAt(nodePos)

    if (!node) {
      loggers.handleDisplay.warn('drag-behavior: node not found', { nodeId, fallbackPos })
      return
    }

    let from = nodePos
    let to = nodePos + node.nodeSize

    if (isHeadingNode(node) && node.attrs?.collapsed) {
      const depth = getHeadingDepth(node.attrs)
      const range = calculateFoldRange(nodePos, depth, doc)
      if (range) {
        from = nodePos
        to = range.to
      }
    }

    if (from >= to) {
      loggers.handleDisplay.error('[DragBehavior] Invalid range: from >= to', {
        from,
        to,
        nodePos,
        nodeSize: node.nodeSize,
      })
      return
    }

    loggers.handleDisplay.debug('[DragBehavior] Starting drag', {
      from,
      to,
      nodeType: node.type.name,
    })

    const slice = doc.slice(from, to)
    event.dataTransfer.clearData()
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', '{}')

    const tr = this.editorView.state.tr
    try {
      tr.setSelection(TextSelection.create(doc, from, to))
      loggers.handleDisplay.debug('[DragBehavior] TextSelection created successfully')
    } catch (error) {
      loggers.handleDisplay.warn('[DragBehavior] TextSelection failed, using NodeSelection', { error })
      try {
        tr.setSelection(NodeSelection.create(doc, from))
        loggers.handleDisplay.debug('[DragBehavior] NodeSelection created successfully')
      } catch (nodeError) {
        loggers.handleDisplay.error('[DragBehavior] NodeSelection also failed', { error: nodeError })
      }
    }
    this.editorView.dispatch(tr)
    ;(this.editorView as any).dragging = { slice, move: true, from, to }
    loggers.handleDisplay.debug('[DragBehavior] view.dragging set', { from, to })

    const boundaryElement = this.findBoundaryElement(node, nodePos)
    if (boundaryElement) {
      try {
        const rect = boundaryElement.getBoundingClientRect()
        const offsetX = Math.max(0, event.clientX - rect.left)
        const offsetY = Math.max(0, event.clientY - rect.top)

        this.currentPreview = this.previewRenderer.create(boundaryElement, {
          opacity: 0.95,
        })

        // 让拖拽卡片与原节点一比一展示，并让光标保持在拖拽起始点附近
        event.dataTransfer.setDragImage(
          this.currentPreview.element,
          Math.min(offsetX, rect.width),
          Math.min(offsetY, rect.height)
        )
      } catch (error) {
        loggers.handleDisplay.warn('drag-behavior: preview creation failed', error)
      }
    }

    const target = event.target as HTMLElement
    if (target) {
      target.style.opacity = '0.5'
      target.style.cursor = 'grabbing'
      target.setAttribute('data-dragging', 'true')
    }

    this.dragState = { nodeId, handleElement: target }

    // 通知拖拽开始
    this.options.onDragStart?.()
  }

  private handleDragEnd() {
    loggers.handleDisplay.debug('[DragBehavior] Drag ended', {
      hadDragState: !!this.dragState,
      viewDragging: !!(this.editorView as any).dragging,
    })

    if (this.dragState?.handleElement) {
      const handle = this.dragState.handleElement
      handle.style.opacity = ''
      handle.style.cursor = 'grab'
      handle.setAttribute('data-dragging', 'false')
    }
    this.dragState = null
    this.cleanupPreview()

    // 通知拖拽结束
    this.options.onDragEnd?.()
  }

  private cleanupPreview() {
    if (this.currentPreview) {
      this.currentPreview.cleanup()
      this.currentPreview = null
    }
  }

  private findBoundaryElement(node: PMNode, pos: number): HTMLElement | null {
    let element = this.editorView.nodeDOM(pos) as HTMLElement | null

    if (!element) {
      const domResult = this.editorView.domAtPos(pos)
      if (domResult.node.nodeType === Node.TEXT_NODE) {
        element = domResult.node.parentElement as HTMLElement | null
      } else {
        element = domResult.node as HTMLElement
      }
    }

    if (!element) {
      return null
    }

    const selector = this.boundaryMatcher.getBoundarySelector(node.type.name) as NodeBoundarySelectorConfig | null
    if (selector?.primary) {
      const found = element.closest(selector.primary)
      if (found && found !== this.editorView.dom) {
        return found as HTMLElement
      }
    }

    if (selector?.fallback) {
      const found = element.closest(selector.fallback)
      if (found && found !== this.editorView.dom) {
        return found as HTMLElement
      }
    }

    return element
  }
}
