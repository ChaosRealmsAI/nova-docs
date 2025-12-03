import type { EditorView } from '@tiptap/pm/view'

/**
 * BorderNodeFinder - 用于编辑器边缘拖拽时，根据 Y 坐标找到目标块级 DOM 节点
 *
 * 参考重构前 NodeFinder.findTargetNodeAtY 的实现：
 * - 先用 posAtCoords 映射 Y 到文档位置
 * - 再通过 domAtPos 拿到 DOM 节点
 * - 向上查找容器节点（columns/table/callout）
 * - 否则向上查找块级节点（heading/paragraph/blockquote/pre/li/taskItem 等）
 */
export class BorderNodeFinder {
  constructor(private readonly editorView: EditorView) {}

  /**
   * 根据 Y 坐标查找目标块级节点（或容器节点）
   */
  findTargetBlockAtY(clientY: number, editorRect: DOMRect): HTMLElement | null {
    const clampedY = Math.max(editorRect.top, Math.min(clientY, editorRect.bottom))
    const centerX = (editorRect.left + editorRect.right) / 2

    const pos = this.editorView.posAtCoords({ left: centerX, top: clampedY })
    if (!pos) return null

    const domAtPos = this.editorView.domAtPos(pos.pos)
    let currentElement = domAtPos.node as HTMLElement

    // 1. 优先查找容器节点（columns/table/callout）
    const container = this.findContainerNode(currentElement)
    if (container) {
      return container
    }

    // 2. 查找普通块级节点
    const block = this.findBlockNode(currentElement)
    if (block) {
      return block
    }

    return null
  }

  /**
   * 查找容器节点（多列、表格、callout）
   */
  private findContainerNode(startElement: HTMLElement): HTMLElement | null {
    let element: HTMLElement | null = startElement

    while (element && element !== this.editorView.dom) {
      if (element.nodeType !== 1) {
        element = element.parentElement
        continue
      }

      if (
        element.matches(
          '.columns-container-grid, [data-type="columns"], [data-type="columnsFlex"]',
        )
      ) {
        return element
      }

      if (element.matches('table, .tableWrapper, [data-type="table"]')) {
        return element
      }

      if (element.matches('.callout-wrapper, [data-type="callout"]')) {
        return element
      }

      element = element.parentElement
    }

    return null
  }

  /**
   * 查找块级节点
   */
  private findBlockNode(startElement: HTMLElement): HTMLElement | null {
    // 修改：优先查找最顶层的列表容器 (ul/ol)，而不是 li
    const listContainer = this.findTopLevelListContainer(startElement)
    if (listContainer) return listContainer

    let element: HTMLElement | null = startElement
    while (element && element !== this.editorView.dom) {
      if (
        element.nodeType === 1 &&
        element.matches(
          'h1, h2, h3, h4, h5, h6, p, blockquote, pre, .draggable-node, li[data-type="taskItem"]',
        )
      ) {
        return element
      }
      element = element.parentElement
    }

    return null
  }

  /**
   * 查找最顶层的列表容器 (ul/ol)
   * 无论当前元素在列表的第几层嵌套中，总是返回最外层的 ul/ol 元素
   * 这样竖线引导线就能覆盖整个列表区域
   */
  private findTopLevelListContainer(startElement: HTMLElement): HTMLElement | null {
    let element: HTMLElement | null = startElement
    let topLevelList: HTMLElement | null = null

    while (element && element !== this.editorView.dom) {
      // 检查是否是列表容器
      if (element.nodeType === 1 && (element.matches('ul') || element.matches('ol'))) {
        // 排除 taskList 的容器（通常 taskList 我们希望行为像普通块或者独立处理）
        // 如果 taskList 也需要整体包裹，可以去掉这个判断。
        // 这里假设 taskList (ul[data-type="taskList"]) 也作为一个整体处理。
        topLevelList = element
      }
      
      // 继续向上查找，看看是不是嵌套在另一个列表中
      element = element.parentElement
    }

    return topLevelList
  }
}

