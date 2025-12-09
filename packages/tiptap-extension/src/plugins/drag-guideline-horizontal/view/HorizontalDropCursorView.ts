import type { EditorState } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import {
  HORIZONTAL_GUIDELINE_PLUGIN_KEY,
  HORIZONTAL_GUIDELINE_BASE_CLASS,
  HORIZONTAL_GUIDELINE_HORIZONTAL_CLASS,
  type HorizontalGuidelineState,
  type HorizontalGuidelineOptions,
  DEFAULT_HORIZONTAL_GUIDELINE_OPTIONS,
} from '../model'
import '@/shared/drop-cursor/drop-cursor.css'

/**
 * HorizontalDropCursorView
 *
 * 负责根据插件状态在 DOM 中渲染横向引导线。
 * 仅关注视觉效果，不参与 drop 行为。
 */
export class HorizontalDropCursorView {
  private element: HTMLElement | null = null
  private options: Required<HorizontalGuidelineOptions>

  constructor(private readonly editorView: EditorView, options: HorizontalGuidelineOptions) {
    this.options = {
      ...DEFAULT_HORIZONTAL_GUIDELINE_OPTIONS,
      ...options,
    }
  }

  update(view: EditorView, prevState: EditorState): void {
    const pluginState = HORIZONTAL_GUIDELINE_PLUGIN_KEY.getState(view.state)
    const prevPluginState = HORIZONTAL_GUIDELINE_PLUGIN_KEY.getState(prevState)

    if (!pluginState || !pluginState.isVisible) {
      this.hide()
      return
    }

    if (
      prevPluginState &&
      prevPluginState.isVisible &&
      prevPluginState.left === pluginState.left &&
      prevPluginState.right === pluginState.right &&
      prevPluginState.top === pluginState.top &&
      prevPluginState.bottom === pluginState.bottom
    ) {
      return
    }

    this.render(pluginState)
  }

  destroy(): void {
    this.hide()
  }

  private ensureElement(): HTMLElement {
    if (this.element) {
      return this.element
    }

    const editorDOM = this.editorView.dom as HTMLElement
    const parent =
      (editorDOM.offsetParent as HTMLElement | null) ??
      editorDOM.parentElement ??
      this.editorView.dom.ownerDocument?.body ??
      document.body

    const element = parent.appendChild(document.createElement('div'))
    element.classList.add(HORIZONTAL_GUIDELINE_BASE_CLASS, HORIZONTAL_GUIDELINE_HORIZONTAL_CLASS)
    element.style.position = 'absolute'
    element.style.pointerEvents = 'none'
    element.style.zIndex = '9999'

    this.element = element
    return element
  }

  private hide(): void {
    if (this.element) {
      this.element.remove()
      this.element = null
    }
  }

  private render(state: HorizontalGuidelineState): void {
    if (
      state.left == null ||
      state.right == null ||
      state.top == null ||
      state.bottom == null ||
      state.right <= state.left
    ) {
      this.hide()
      return
    }

    const element = this.ensureElement()
    const editorDOM = this.editorView.dom as HTMLElement
    const editorRect = editorDOM.getBoundingClientRect()
    const scaleX = editorRect.width / editorDOM.offsetWidth
    const scaleY = editorRect.height / editorDOM.offsetHeight

    const parent = element.parentElement as HTMLElement

    let parentLeft: number
    let parentTop: number

    if (
      !parent ||
      (parent === document.body && getComputedStyle(parent).position === 'static')
    ) {
      parentLeft = -window.pageXOffset
      parentTop = -window.pageYOffset
    } else {
      const rect = parent.getBoundingClientRect()
      const parentScaleX = rect.width / (parent.offsetWidth || 1)
      const parentScaleY = rect.height / (parent.offsetHeight || 1)
      parentLeft = rect.left - parent.scrollLeft * parentScaleX
      parentTop = rect.top - parent.scrollTop * parentScaleY
    }

    element.style.left = `${(state.left - parentLeft) / scaleX}px`
    element.style.top = `${(state.top - parentTop) / scaleY}px`
    element.style.width = `${(state.right - state.left) / scaleX}px`
    element.style.height = `${(state.bottom - state.top) / scaleY}px`
  }
}
