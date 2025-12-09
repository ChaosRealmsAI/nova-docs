/**
 * Highlight Manager
 *
 * 高亮管理器 - 管理句柄和高亮的可见性
 * 从 HandleView 中提取的 UI 可见性逻辑
 */

import type { HandleStyleConfig } from '../model'

/**
 * 高亮管理器
 * 负责句柄和节点高亮的显示/隐藏
 */
export class HighlightManager {
  private currentHoveredNodeId: string | null = null

  constructor(
    private handles: Map<string, HTMLElement>,
    private highlights: Map<string, HTMLElement>,
    private handleStyleConfig: HandleStyleConfig
  ) {}

  /**
   * 创建节点高亮元素
   */
  createHighlightElement(nodeId: string): HTMLElement {
    const highlight = document.createElement('div')
    highlight.className = 'drag-node-highlight feishu-hover-mask'
    highlight.setAttribute('data-node-id', nodeId)
    highlight.style.opacity = '0'
    highlight.style.pointerEvents = 'none'
    highlight.style.zIndex = '1'
    return highlight
  }

  /**
   * 显示指定节点的句柄（只显示句柄，不显示高亮）
   * 高亮在 hover 句柄时才显示
   */
  showHandleByNodeId(nodeId: string) {
    if (this.currentHoveredNodeId === nodeId) {
      this.showHandle(nodeId)
      return
    }

    if (this.currentHoveredNodeId) {
      this.hideHandleAndHighlight(this.currentHoveredNodeId)
    }

    this.currentHoveredNodeId = nodeId
    this.showHandle(nodeId)
  }

  /**
   * 只显示句柄（不显示高亮）
   */
  showHandle(nodeId: string) {
    const handle = this.handles.get(nodeId)
    if (handle) {
      handle.style.opacity = this.handleStyleConfig.visibleOpacity
      handle.style.pointerEvents = this.handleStyleConfig.visiblePointerEvents
      handle.setAttribute('data-visible', 'true')
    }
  }

  /**
   * 只隐藏句柄（不隐藏高亮）
   */
  hideHandle(nodeId: string) {
    const handle = this.handles.get(nodeId)
    if (handle) {
      handle.style.opacity = this.handleStyleConfig.hiddenOpacity
      handle.style.pointerEvents = this.handleStyleConfig.hiddenPointerEvents
      handle.setAttribute('data-visible', 'false')
    }
  }

  /**
   * 只显示高亮
   */
  showHighlight(nodeId: string) {
    const highlight = this.highlights.get(nodeId)
    if (highlight) {
      highlight.style.opacity = '1'
    }
  }

  /**
   * 只隐藏高亮
   */
  hideHighlight(nodeId: string) {
    const highlight = this.highlights.get(nodeId)
    if (highlight) {
      highlight.style.opacity = '0'
    }
  }

  /**
   * 隐藏句柄和高亮
   */
  hideHandleAndHighlight(nodeId: string) {
    this.hideHandle(nodeId)
    this.hideHighlight(nodeId)
  }

  /**
   * 隐藏所有句柄和高亮
   * @param beforeHide 在隐藏前调用的回调（用于清理折叠预览等）
   */
  hideAll(beforeHide?: () => void) {
    beforeHide?.()
    this.handles.forEach((_handle, id) => {
      this.hideHandleAndHighlight(id)
    })
    this.currentHoveredNodeId = null
  }

  /**
   * 获取当前悬停的节点 ID
   */
  getCurrentNodeId(): string | null {
    return this.currentHoveredNodeId
  }

  /**
   * 重置当前悬停节点
   */
  resetCurrentNode() {
    this.currentHoveredNodeId = null
  }

  /**
   * 检测指针是否在句柄区域内
   */
  isPointerWithinHandleArea(clientX: number, clientY: number, margin = 6): boolean {
    if (!this.currentHoveredNodeId) {
      return false
    }
    const handle = this.handles.get(this.currentHoveredNodeId)
    if (!handle) {
      return false
    }
    const rect = handle.getBoundingClientRect()
    return (
      clientX >= rect.left - margin &&
      clientX <= rect.right + margin &&
      clientY >= rect.top - margin &&
      clientY <= rect.bottom + margin
    )
  }

  /**
   * 检测指针是否在活跃区域内（句柄或高亮）
   */
  isPointerWithinActiveZone(clientX: number, clientY: number, margin = 6): boolean {
    if (!this.currentHoveredNodeId) {
      return false
    }

    const highlight = this.highlights.get(this.currentHoveredNodeId)
    if (highlight) {
      const rect = highlight.getBoundingClientRect()
      if (
        clientX >= rect.left - margin &&
        clientX <= rect.right + margin &&
        clientY >= rect.top - margin &&
        clientY <= rect.bottom + margin
      ) {
        return true
      }
    }

    return this.isPointerWithinHandleArea(clientX, clientY, margin)
  }
}
