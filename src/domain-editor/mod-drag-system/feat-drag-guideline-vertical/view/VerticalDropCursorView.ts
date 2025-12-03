import type { EditorState } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import {
  VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY,
  VERTICAL_GUIDELINE_CLASS,
  VERTICAL_GUIDELINE_COLUMN_EDGE_CLASS,
  VERTICAL_GUIDELINE_EDITOR_BORDER_CLASS,
  type VerticalGuidelineState,
} from '../model'
import '../style/vertical-drag-guideline.css'

/**
 * VerticalDropCursorView
 *
 * 根据插件状态在 DOM 中渲染竖向引导线。
 * 注意：本实现仅关注视觉效果，不参与 drop 行为。
 */
export class VerticalDropCursorView {
  private element: HTMLElement | null = null

  constructor(private readonly editorView: EditorView) {}

  update(view: EditorView, prevState: EditorState): void {
    const pluginState = VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY.getState(view.state)
    const prevPluginState = VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY.getState(prevState)

    if (!pluginState || !pluginState.isVisible) {
      this.hide()
      return
    }

    // 简单 diff，避免无意义重绘
    if (
      prevPluginState &&
      prevPluginState.isVisible &&
      prevPluginState.mode === pluginState.mode &&
      prevPluginState.edgeX === pluginState.edgeX &&
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
    element.classList.add(VERTICAL_GUIDELINE_CLASS)
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
    // 移除编辑器上的数据属性，恢复原生 dropcursor 的显示
    this.editorView.dom.removeAttribute('data-vertical-guideline-visible')
  }

  private render(state: VerticalGuidelineState): void {
    const element = this.ensureElement()
    const editorDOM = this.editorView.dom as HTMLElement
    // 添加数据属性，用于通过 CSS 隐藏原生 dropcursor
    editorDOM.setAttribute('data-vertical-guideline-visible', 'true')
    const editorRect = editorDOM.getBoundingClientRect()
    const scaleX = editorRect.width / (editorDOM.offsetWidth || 1)
    const scaleY = editorRect.height / (editorDOM.offsetHeight || 1)

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

    element.className = VERTICAL_GUIDELINE_CLASS

    if (state.mode === 'columns-edge') {
      element.classList.add(VERTICAL_GUIDELINE_COLUMN_EDGE_CLASS)
    } else if (state.mode === 'editor-border') {
      element.classList.add(VERTICAL_GUIDELINE_EDITOR_BORDER_CLASS)
    }

    if (state.edgeX == null || state.top == null || state.bottom == null) {
      this.hide()
      return
    }

    const height = state.bottom - state.top
    if (height <= 0) {
      this.hide()
      return
    }

    const width = element.offsetWidth || 4

    element.style.left = `${(state.edgeX - width / 2 - parentLeft) / scaleX}px`
    element.style.top = `${(state.top - parentTop) / scaleY}px`
    element.style.width = `${width / scaleX}px`
    element.style.height = `${height / scaleY}px`
  }
}
