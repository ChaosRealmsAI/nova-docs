/**
 * Position Calculator
 *
 * 位置计算服务 - 计算句柄的显示位置
 */

import type { EditorView } from '@tiptap/pm/view'

export interface HandlePosition {
  left: number
  top: number
  width: number
  height: number
}

const DEFAULT_HANDLE_WIDTH = 42
const DEFAULT_HANDLE_HEIGHT = 26

export class PositionCalculator {
  private offset: number

  constructor(offset: number = 50) {
    this.offset = offset
  }

  /**
   * 计算句柄位置
   *
   * @param view - ProseMirror EditorView
   * @param pos - 节点在文档中的位置
   * @returns 句柄位置信息（相对于容器）
   */
  calculateHandlePosition(
    view: EditorView,
    pos: number,
    element?: HTMLElement | null,
    handleElement?: HTMLElement | null
  ): HandlePosition | null {
    const relativeRect = this.getRelativeRect(view, pos, element)
    if (!relativeRect) {
      return null
    }

    const handleRect = this.getHandleRect(handleElement)
    const baseGap = this.offset - DEFAULT_HANDLE_WIDTH
    const handleLeft = relativeRect.left - (handleRect.width + baseGap)

    return {
      left: handleLeft,
      top: relativeRect.top,
      width: handleRect.width,
      height: handleRect.height
    }
  }

  /**
   * 计算节点高亮区域
   */
  calculateHighlightPosition(view: EditorView, pos: number, element?: HTMLElement | null): HandlePosition | null {
    const relativeRect = this.getRelativeRect(view, pos, element)
    if (!relativeRect) {
      return null
    }

    return {
      left: relativeRect.left,
      top: relativeRect.top,
      width: relativeRect.width,
      height: relativeRect.height
    }
  }

  /**
   * 获取节点相对于容器的矩形信息
   */
  private getRelativeRect(view: EditorView, pos: number, element?: HTMLElement | null): HandlePosition | null {
    const nodeDOM = element || (view.nodeDOM(pos) as HTMLElement)

    if (!nodeDOM) {
      return null
    }

    const nodeRect = nodeDOM.getBoundingClientRect()

    const containerElement = view.dom.parentElement
    if (!containerElement) {
      return null
    }
    const containerRect = containerElement.getBoundingClientRect()

    // 🔧 添加滚动偏移量补偿（考虑嵌套滚动容器）
    let scrollLeft = 0
    let scrollTop = 0

    let currentScrollParent: HTMLElement | null = nodeDOM
    let depth = 0
    while (currentScrollParent && currentScrollParent !== containerElement && depth < 10) {
      scrollLeft += currentScrollParent.scrollLeft || 0
      scrollTop += currentScrollParent.scrollTop || 0
      currentScrollParent = currentScrollParent.parentElement
      depth++
    }

    scrollLeft += containerElement.scrollLeft || 0
    scrollTop += containerElement.scrollTop || 0

    // 多列容器内：横向位置与宽度对齐整个列，纵向位置保持对齐具体块节点
    const columnElement = nodeDOM.closest('[data-type="column"]') as HTMLElement | null
    const columnRect = columnElement ? columnElement.getBoundingClientRect() : null

    // 🔧 视觉补偿：获取元素的左内边距
    // 对于普通元素，将高亮区域向右推，使其贴近内容
    // 但对于容器类元素（列表、引用块），不应用偏移，保持整体高亮
    const isContainerElement = ['UL', 'OL', 'BLOCKQUOTE'].includes(nodeDOM.tagName)
    let paddingOffset = 0
    if (columnRect && columnElement) {
      // 多列模式：获取列元素的 padding，使高亮贴近文字内容
      const columnStyle = window.getComputedStyle(columnElement)
      paddingOffset = parseFloat(columnStyle.paddingLeft) || 0
    } else if (!isContainerElement) {
      // 非容器元素：应用 padding 偏移
      const style = window.getComputedStyle(nodeDOM)
      paddingOffset = parseFloat(style.paddingLeft) || 0
    }

    const resultLeft = columnRect
      ? columnRect.left + paddingOffset - containerRect.left + scrollLeft
      : nodeRect.left + paddingOffset - containerRect.left + scrollLeft

    const resultWidth = columnRect
      ? columnRect.width - paddingOffset * 2
      : nodeRect.width - paddingOffset

    return {
      left: resultLeft,
      top: nodeRect.top - containerRect.top + scrollTop,
      width: resultWidth,
      height: nodeRect.height
    }
  }

  private getHandleRect(handleElement?: HTMLElement | null) {
    if (!handleElement) {
      return {
        width: DEFAULT_HANDLE_WIDTH,
        height: DEFAULT_HANDLE_HEIGHT
      }
    }

    const rect = handleElement.getBoundingClientRect()

    return {
      width: rect.width || DEFAULT_HANDLE_WIDTH,
      height: rect.height || DEFAULT_HANDLE_HEIGHT
    }
  }
}
