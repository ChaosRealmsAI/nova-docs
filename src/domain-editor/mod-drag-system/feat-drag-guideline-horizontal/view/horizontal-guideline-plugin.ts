import { Plugin } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import {
  HORIZONTAL_GUIDELINE_PLUGIN_KEY,
  INITIAL_HORIZONTAL_GUIDELINE_STATE,
  type HorizontalGuidelineOptions,
  type HorizontalGuidelineState,
  type HorizontalGuidelineStorage,
} from '../model'
import { HorizontalGuidelineCalculator } from '../service'
import { HorizontalDropCursorView } from './HorizontalDropCursorView'
import {
  VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY,
  type VerticalGuidelineState,
} from '../../feat-drag-guideline-vertical/model'

function isSameState(a: HorizontalGuidelineState | undefined, b: HorizontalGuidelineState): boolean {
  if (!a) return false
  return (
    a.isVisible === b.isVisible &&
    a.left === b.left &&
    a.right === b.right &&
    a.top === b.top &&
    a.bottom === b.bottom
  )
}

/**
 * 创建横线引导线插件（v1）
 *
 * 注意：这是一个独立的视觉插件，不会修改文档。
 */
export function createHorizontalGuidelinePlugin(
  options: Required<HorizontalGuidelineOptions>,
  storage: HorizontalGuidelineStorage,
): Plugin<HorizontalGuidelineState> {
  let view: HorizontalDropCursorView | null = null
  let calculator: HorizontalGuidelineCalculator | null = null
  let editorDragoverHandler: ((event: DragEvent) => void) | null = null
  let editorDragendHandler: ((event: DragEvent) => void) | null = null
  let globalDragoverHandler: ((event: DragEvent) => void) | null = null

  return new Plugin<HorizontalGuidelineState>({
    key: HORIZONTAL_GUIDELINE_PLUGIN_KEY,

    state: {
      init() {
        return INITIAL_HORIZONTAL_GUIDELINE_STATE
      },
      apply(tr, value) {
        const meta = tr.getMeta(HORIZONTAL_GUIDELINE_PLUGIN_KEY) as HorizontalGuidelineState | undefined
        if (meta) {
          return { ...value, ...meta }
        }
        if (tr.docChanged) {
          return INITIAL_HORIZONTAL_GUIDELINE_STATE
        }
        return value
      },
    },

    view(editorView: EditorView) {
      storage.view = editorView
      view = new HorizontalDropCursorView(editorView, options)
      calculator = new HorizontalGuidelineCalculator(options)

      editorDragoverHandler = (event: DragEvent) => {
        if (!calculator) return

        // 互斥逻辑：如果竖线引导线已显示，则强制隐藏横线
        const verticalState = VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY.getState(
          editorView.state,
        ) as VerticalGuidelineState | undefined
        
        if (verticalState?.isVisible) {
          console.log('[HorizontalPlugin] Vertical visible, forcing hide. VertState:', verticalState)
          const currentState = HORIZONTAL_GUIDELINE_PLUGIN_KEY.getState(editorView.state)
          if (currentState?.isVisible) {
            const tr = editorView.state.tr.setMeta(
              HORIZONTAL_GUIDELINE_PLUGIN_KEY,
              INITIAL_HORIZONTAL_GUIDELINE_STATE,
            )
            editorView.dispatch(tr)
          }
          return
        }

        const nextState = calculator.calculate(editorView, event)
        console.log('[HorizontalPlugin] Calculated state:', nextState)
        const currentState = HORIZONTAL_GUIDELINE_PLUGIN_KEY.getState(editorView.state)
        if (isSameState(currentState, nextState)) {
          return
        }
        const tr = editorView.state.tr.setMeta(HORIZONTAL_GUIDELINE_PLUGIN_KEY, nextState)
        editorView.dispatch(tr)
      }

      editorDragendHandler = () => {
        const tr = editorView.state.tr.setMeta(HORIZONTAL_GUIDELINE_PLUGIN_KEY, INITIAL_HORIZONTAL_GUIDELINE_STATE)
        editorView.dispatch(tr)
      }

      editorView.dom.addEventListener('dragover', editorDragoverHandler)
      editorView.dom.addEventListener('dragend', editorDragendHandler)

      // 全局 dragover：当鼠标离开编辑器区域时，清除横线
      globalDragoverHandler = (event: DragEvent) => {
        const editorRect = editorView.dom.getBoundingClientRect()
        const inside =
          event.clientX >= editorRect.left &&
          event.clientX <= editorRect.right &&
          event.clientY >= editorRect.top &&
          event.clientY <= editorRect.bottom

        if (!inside) {
          const currentState = HORIZONTAL_GUIDELINE_PLUGIN_KEY.getState(editorView.state)
          if (currentState?.isVisible) {
            const tr = editorView.state.tr.setMeta(
              HORIZONTAL_GUIDELINE_PLUGIN_KEY,
              INITIAL_HORIZONTAL_GUIDELINE_STATE,
            )
            editorView.dispatch(tr)
          }
        }
      }

      document.addEventListener('dragover', globalDragoverHandler, true)

      return {
        update(editorView, prevState) {
          view?.update(editorView, prevState)
        },
        destroy() {
          view?.destroy()
          view = null

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

          calculator = null
          storage.view = null
        },
      }
    },
  })
}
