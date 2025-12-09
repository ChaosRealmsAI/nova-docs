import { Plugin } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { loggers } from '@/infrastructure/logger'
import {
  INITIAL_VERTICAL_GUIDELINE_STATE,
  VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY,
  type VerticalGuidelineOptions,
  type VerticalGuidelineState,
  type VerticalGuidelineStorage,
} from '../model'
import { VerticalGuidelineCalculator, VerticalDropExecutor } from '../service'
import { VerticalDropCursorView } from './VerticalDropCursorView'

function isSameState(a: VerticalGuidelineState | undefined, b: VerticalGuidelineState): boolean {
  if (!a) return false
  return (
    a.mode === b.mode &&
    a.isVisible === b.isVisible &&
    a.edgeX === b.edgeX &&
    a.top === b.top &&
    a.bottom === b.bottom &&
    a.side === b.side &&
    a.hotzoneType === b.hotzoneType &&
    a.targetColumnIndex === b.targetColumnIndex &&
    a.targetNodePos === b.targetNodePos &&
    a.isInsideColumns === b.isInsideColumns
  )
}

/**
 * 创建竖线引导线插件
 *
 * 注意：这是完全独立的 feature，如有问题可以直接从编辑器配置中移除。
 */
export function createVerticalGuidelinePlugin(
  options: Required<VerticalGuidelineOptions>,
  storage: VerticalGuidelineStorage,
): Plugin<VerticalGuidelineState> {
  let dropCursorView: VerticalDropCursorView | null = null
  let calculator: VerticalGuidelineCalculator | null = null

  let editorDragoverHandler: ((event: DragEvent) => void) | null = null
  let editorDragendHandler: ((event: DragEvent) => void) | null = null

  let globalDragoverHandler: ((event: DragEvent) => void) | null = null
  let globalDropHandler: ((event: DragEvent) => void) | null = null
  let debugDropListener: ((event: DragEvent) => void) | null = null

  return new Plugin<VerticalGuidelineState>({
    key: VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY,

    props: {
      handleDOMEvents: {
        drop: (view: EditorView, event: Event) => {
          const dragEvent = event as DragEvent

          if (!view.dragging) {
            return false
          }

          loggers.dragGuideline.debug('[VerticalGuidelinePlugin] editor drop', {
            hasDragging: !!view.dragging,
            clientX: dragEvent.clientX,
            clientY: dragEvent.clientY,
          })

          const executor = new VerticalDropExecutor(options)
          const handled = executor.execute(view, dragEvent, () =>
            VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY.getState(view.state),
          )

          if (handled) {
            const tr = view.state.tr.setMeta(
              VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY,
              INITIAL_VERTICAL_GUIDELINE_STATE,
            )
            view.dispatch(tr)
            return true
          }

          return false
        },
      },
    },

    state: {
      init(): VerticalGuidelineState {
        return INITIAL_VERTICAL_GUIDELINE_STATE
      },
      apply(tr, value) {
        const meta = tr.getMeta(VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY) as
          | VerticalGuidelineState
          | undefined

        if (meta) {
          return { ...value, ...meta }
        }

        if (tr.docChanged) {
          return INITIAL_VERTICAL_GUIDELINE_STATE
        }

        return value
      },
    },

    view(editorView: EditorView) {
      storage.view = editorView
      dropCursorView = new VerticalDropCursorView(editorView)
      calculator = new VerticalGuidelineCalculator(options)

      // 编辑器内部 dragover：处理列容器竖线
      editorDragoverHandler = (event: DragEvent) => {
        if (!calculator) return
        const nextState = calculator.calculateForEditorDragover(editorView, event)
        loggers.dragGuideline.debug('[VerticalPlugin] Editor dragover state:', nextState)
        const currentState = VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY.getState(editorView.state)

        if (isSameState(currentState, nextState)) {
          return
        }

        const tr = editorView.state.tr.setMeta(VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY, nextState)
        editorView.dispatch(tr)
      }

      // 编辑器内部 dragend：仅负责清除竖线状态（实际 drop 逻辑在全局 drop 中处理）
      editorDragendHandler = () => {
        const tr = editorView.state.tr.setMeta(
          VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY,
          INITIAL_VERTICAL_GUIDELINE_STATE,
        )
        editorView.dispatch(tr)
      }

      editorView.dom.addEventListener('dragover', editorDragoverHandler)
      editorView.dom.addEventListener('dragend', editorDragendHandler)

      // 全局 dragover：处理编辑器边缘竖线
      globalDragoverHandler = (event: DragEvent) => {
        if (!calculator) return

        const nextState = calculator.calculateForGlobalDragover(editorView, event)
        const currentState = VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY.getState(editorView.state)

        // 关键：必须 preventDefault 才能允许 drop 事件触发
        if (nextState.isVisible || editorView.dragging) {
          event.preventDefault()
          event.dataTransfer!.dropEffect = 'move'
        }

        if (isSameState(currentState, nextState)) {
          return
        }

        if (nextState.isVisible) {
          loggers.dragGuideline.debug('[VerticalGuidelinePlugin] Global dragover - showing guideline', {
            mode: nextState.mode,
            side: nextState.side,
            edgeX: nextState.edgeX,
          })
        }

        const tr = editorView.state.tr.setMeta(VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY, nextState)
        editorView.dispatch(tr)
      }

      // 全局 drop：尝试执行两列布局创建 + 清除竖线
      globalDropHandler = (event: DragEvent) => {
        const currentState = VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY.getState(editorView.state)

        // 只在竖线可见时才处理，否则让原生 drop 继续
        if (!currentState?.isVisible) {
          return
        }

        loggers.dragGuideline.debug('[VerticalPlugin] Global DROP event', {
          clientX: event.clientX,
          clientY: event.clientY,
          hasDragging: !!editorView.dragging,
        })

        if (!editorView.dragging) {
          loggers.dragGuideline.debug('[VerticalPlugin] Drop skipped: No dragging data')
          const trSkip = editorView.state.tr.setMeta(
            VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY,
            INITIAL_VERTICAL_GUIDELINE_STATE,
          )
          editorView.dispatch(trSkip)
          return
        }

        const executor = new VerticalDropExecutor(options)
        const handled = executor.execute(editorView, event, () =>
          VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY.getState(editorView.state),
        )
        loggers.dragGuideline.debug('[VerticalPlugin] Drop handled by executor?', handled)

        // 清除竖线状态
        const tr = editorView.state.tr.setMeta(
          VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY,
          INITIAL_VERTICAL_GUIDELINE_STATE,
        )
        editorView.dispatch(tr)

        if (handled) {
          // 如果已经由 VerticalDropExecutor 处理，阻止默认 drop 行为
          event.preventDefault()
          event.stopPropagation()
        }
      }

      // 添加调试监听器，确认 drop 事件是否触发
      debugDropListener = (event: DragEvent) => {
        loggers.dragGuideline.debug('[VerticalGuidelinePlugin] Document drop event captured', {
          clientX: event.clientX,
          clientY: event.clientY,
          target: event.target,
          defaultPrevented: event.defaultPrevented,
        })
      }
      document.addEventListener('drop', debugDropListener, true)

      document.addEventListener('dragover', globalDragoverHandler, true)
      document.addEventListener('drop', globalDropHandler, true)

      return {
        update(view, prevState) {
          dropCursorView?.update(view, prevState)
        },
        destroy() {
          dropCursorView?.destroy()
          dropCursorView = null

          if (editorDragoverHandler) {
            editorView.dom.removeEventListener('dragover', editorDragoverHandler)
            editorDragoverHandler = null
          }

          if (editorDragendHandler) {
            editorView.dom.removeEventListener('dragend', editorDragendHandler)
            editorDragendHandler = null
          }

          if (globalDragoverHandler) {
            document.removeEventListener('dragover', globalDragoverHandler, true)
            globalDragoverHandler = null
          }

          if (globalDropHandler) {
            document.removeEventListener('drop', globalDropHandler, true)
            globalDropHandler = null
          }

          if (debugDropListener) {
            document.removeEventListener('drop', debugDropListener, true)
            debugDropListener = null
          }

          calculator = null
          storage.view = null
        },
      }
    },
  })
}
