/**
 * Handle View
 *
 * 句柄视图 - ProseMirror PluginView
 * 负责渲染和管理拖拽句柄的显示
 */

import type { EditorView } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'
import type { HandleDisplayOptions, HandleStyleConfig } from '../model'
import { HANDLE_VISIBILITY_PRESETS, DEFAULT_HANDLE_OFFSET } from '../model'
import { NodeMatcher, PositionCalculator } from '../service'
import { getNodeTypeIcon, DragHandleIcon } from '@nova/domain-editor/shared/ui/drag-handle/icons'
import type { NodeBoundarySelectorConfig } from '../service/NodeMatcher'
import { loggers } from '@nova/infrastructure/logger'
import { DragBehavior } from '../interactions/drag-behavior'
import { NodeOperations } from '../operations'
import { HighlightManager } from './HighlightManager'
import { FoldPreviewManager } from './FoldPreviewManager'
import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { HandleMenu } from '@nova/domain-editor/shared/ui/handle-menu'
import { EmptyNodeMenu } from '@nova/domain-editor/shared/ui/empty-node-menu'
import { I18nProvider } from '@nova/shared/i18n'
import tippy, { type Instance as TippyInstance } from 'tippy.js'

/**
 * 菜单状态
 */
interface MenuState {
  open: boolean
  position: { x: number; y: number }
  nodeId: string | null
  nodePos: number | null
  isEmptyNode: boolean
}

export class HandleView {
  private editorView: EditorView
  private overlay: HTMLElement
  private handles: Map<string, HTMLElement> = new Map()
  private highlights: Map<string, HTMLElement> = new Map()
  private nodeMatcher: NodeMatcher
  private positionCalculator: PositionCalculator
  private handleStyleConfig: HandleStyleConfig
  private dragBehavior: DragBehavior
  private nodeOperations: NodeOperations
  private highlightManager: HighlightManager
  private foldPreviewManager: FoldPreviewManager
  private resizeObserver: ResizeObserver | null = null
  private resizeDebounceTimer: ReturnType<typeof setTimeout> | null = null
  private readonly RESIZE_DEBOUNCE_MS = 100  // ResizeObserver 防抖时间

  // 性能优化：nodeId → pos 缓存，避免 O(N²) 遍历
  private nodePositionCache: Map<string, number> = new Map()

  // 菜单相关 - 使用 tippy.js
  private menuContainer: HTMLElement
  private menuRoot: Root | null = null
  private tippyInstance: TippyInstance | null = null
  private currentMenuHandle: HTMLElement | null = null
  private menuState: MenuState = {
    open: false,
    position: { x: 0, y: 0 },
    nodeId: null,
    nodePos: null,
    isEmptyNode: false
  }

  // 菜单 hover 控制（简化版：无子菜单）
  private isMouseOverHandle = false
  private isMouseOverMenu = false

  constructor(view: EditorView, options: HandleDisplayOptions = {}) {
    loggers.handleDisplay.info('🏗️ HandleView 构造函数被调用', { options })

    this.editorView = view

    // 初始化配置
    const visibilityMode = options.visibilityMode || 'default-hidden'
    this.handleStyleConfig = HANDLE_VISIBILITY_PRESETS[visibilityMode]
    loggers.handleDisplay.info('👁️ 可见性模式已初始化', {
      visibilityMode,
      styleConfig: this.handleStyleConfig
    })

    // 初始化服务
    this.nodeMatcher = new NodeMatcher(options.draggableNodeTypes, options.draggableNodePaths)
    this.positionCalculator = new PositionCalculator(options.offset || DEFAULT_HANDLE_OFFSET)
    this.dragBehavior = new DragBehavior(view, {
      resolveNodePosition: (nodeId, fallbackPos) => this.findNodePositionById(nodeId) ?? fallbackPos,
      onDragStart: () => this.handleDragStarted(),
      onDragEnd: () => this.handleDragEnded()
    })
    this.nodeOperations = new NodeOperations(view)
    this.highlightManager = new HighlightManager(this.handles, this.highlights, this.handleStyleConfig)
    this.foldPreviewManager = new FoldPreviewManager(view, this.handles, this.highlights)

    // 创建 overlay 容器
    this.overlay = document.createElement('div')
    this.overlay.className = 'handle-display-overlay'
    this.overlay.style.position = 'absolute'
    this.overlay.style.top = '0'
    this.overlay.style.left = '0'
    this.overlay.style.pointerEvents = 'none'
    this.overlay.style.zIndex = '10'
    loggers.handleDisplay.debug('Overlay created')

    // 添加到编辑器容器
    const container = view.dom.parentElement
    loggers.handleDisplay.debug('Editor container found', {
      tagName: container?.tagName,
      originalPosition: container ? getComputedStyle(container).position : null
    })

    if (container) {
      container.style.position = 'relative'
      container.appendChild(this.overlay)
      loggers.handleDisplay.info('✅ Overlay 已添加到编辑器容器', {
        inDOM: document.contains(this.overlay)
      })
    } else {
      loggers.handleDisplay.error('❌ 未找到编辑器容器！')
    }

    // 创建菜单容器（用于 tippy 的 content）
    this.menuContainer = document.createElement('div')
    this.menuContainer.className = 'handle-menu-container'
    this.menuRoot = createRoot(this.menuContainer)
    // 不在构造函数中渲染，等 tippy 显示时再渲染

    // 首次渲染
    loggers.handleDisplay.info('🎨 开始首次渲染...')
    this.update(view)

    // 监听容器大小变化（例如多列容器宽度变化），自动刷新句柄/高亮位置
    this.setupResizeObserver(container)
  }

  /**
   * 更新句柄
   * ProseMirror 会在文档变化时调用此方法
   *
   * 性能优化：移除了 getFoldedRanges + isInFoldedRange 的 O(N×M) 计算
   * 折叠节点的隐藏通过 CSS visibility 处理，无需在遍历时逐一检查
   */
  update(view: EditorView) {
    this.editorView = view
    this.nodeOperations.updateView(view)
    this.foldPreviewManager.updateView(view)

    // 确保 overlay 在 DOM 中
    if (!document.contains(this.overlay)) {
      const container = view.dom.parentElement
      if (container) {
        container.style.position = 'relative'
        container.appendChild(this.overlay)
      }
    }

    const existingHandles = new Set(this.handles.keys())
    const existingHighlights = new Set(this.highlights.keys())
    const activeNodeIds = new Set<string>()
    const pathMap = new WeakMap<PMNode, string>()
    pathMap.set(view.state.doc, 'doc')

    // 清空并重建 nodeId → pos 缓存
    this.nodePositionCache.clear()

    // 遍历文档，为可拖拽节点创建/更新句柄
    view.state.doc.descendants((node, pos, parent) => {
      const parentPath = parent ? pathMap.get(parent as PMNode) || 'doc' : 'doc'
      const currentPath = `${parentPath} > ${node.type.name}`
      pathMap.set(node, currentPath)

      if (this.nodeMatcher.isDraggable(node, pos, currentPath)) {
        const nodeId = this.nodeMatcher.getNodeId(node, pos)
        // 在遍历时直接填充缓存
        this.nodePositionCache.set(nodeId, pos)
        activeNodeIds.add(nodeId)
        this.updateHandle(node, pos, nodeId)
        existingHandles.delete(nodeId)
        existingHighlights.delete(nodeId)
      }
    })

    // 移除不再存在的句柄
    existingHandles.forEach(nodeId => {
      const handle = this.handles.get(nodeId)
      if (handle) {
        handle.remove()
        this.handles.delete(nodeId)
      }
      // 如果当前悬停的节点被移除，重置状态以避免悬空引用
      if (this.highlightManager.getCurrentNodeId() === nodeId) {
        this.highlightManager.resetCurrentNode()
      }
    })

    // 移除不再存在的高亮
    existingHighlights.forEach(nodeId => {
      const highlight = this.highlights.get(nodeId)
      if (highlight) {
        highlight.remove()
        this.highlights.delete(nodeId)
      }
    })
  }

  /**
   * 设置 ResizeObserver 监听容器大小变化
   * 当多列容器添加/删除列或调整列宽时，自动刷新所有句柄和高亮块的位置
   *
   * 性能优化：添加 100ms 防抖，避免频繁触发
   */
  private setupResizeObserver(container: HTMLElement | null) {
    if (!container || typeof ResizeObserver === 'undefined') {
      return
    }

    this.resizeObserver = new ResizeObserver(() => {
      // 防抖：100ms 内只执行一次
      if (this.resizeDebounceTimer) {
        clearTimeout(this.resizeDebounceTimer)
      }

      this.resizeDebounceTimer = setTimeout(() => {
        this.resizeDebounceTimer = null
        // 只刷新位置，不重新遍历文档
        this.handles.forEach((handle, nodeId) => {
          const pos = this.nodePositionCache.get(nodeId)
          if (pos !== undefined) {
            const node = this.editorView.state.doc.nodeAt(pos)
            if (node) {
              this.updateHandlePosition(node, pos, nodeId, handle)
            }
          }
        })
      }, this.RESIZE_DEBOUNCE_MS)
    })

    this.resizeObserver.observe(container)
  }

  /**
   * 创建或更新句柄
   */
  private updateHandle(node: PMNode, pos: number, nodeId: string) {
    let handle = this.handles.get(nodeId)
    let highlight = this.highlights.get(nodeId)

    if (!handle) {
      handle = this.createHandleElement(node, pos, nodeId)
      this.overlay.appendChild(handle)
      this.handles.set(nodeId, handle)
      this.dragBehavior.setupDraggable(handle, nodeId, pos)
    } else {
      this.renderHandleContent(handle, node, pos, nodeId)
    }

    if (!highlight) {
      highlight = this.highlightManager.createHighlightElement(nodeId)
      this.overlay.appendChild(highlight)
      this.highlights.set(nodeId, highlight)
    }

    // 初始位置计算（可能不准确，会在 requestAnimationFrame 中刷新）
    this.updateHandlePosition(node, pos, nodeId, handle)
  }

  /**
   * 更新句柄和高亮的位置
   */
  private updateHandlePosition(node: PMNode, pos: number, nodeId: string, handle: HTMLElement) {
    const highlight = this.highlights.get(nodeId)
    if (!highlight) return

    // 计算并更新位置
    const boundaryElement = this.findBoundaryElement(node, pos)
    const position = this.positionCalculator.calculateHandlePosition(
      this.editorView,
      pos,
      boundaryElement,
      handle
    )
    if (position) {
      handle.style.position = 'absolute'
      handle.style.left = `${position.left}px`
      handle.style.top = `${position.top}px`
      handle.style.width = `${position.width}px`
      handle.style.height = `${position.height}px`
    }

    const highlightPosition = this.positionCalculator.calculateHighlightPosition(this.editorView, pos, boundaryElement)
    if (highlightPosition) {
      highlight.style.position = 'absolute'
      highlight.style.left = `${highlightPosition.left}px`
      highlight.style.top = `${highlightPosition.top}px`
      highlight.style.width = `${highlightPosition.width}px`
      highlight.style.height = `${highlightPosition.height}px`
    }
  }

  private findBoundaryElement(node: PMNode, pos: number): HTMLElement | null {
    // 优先使用 nodeDOM 获取节点对应的 DOM
    let element = this.editorView.nodeDOM(pos) as HTMLElement | null

    // 同时使用 domAtPos 获取更精确的内部元素（特别是 NodeView 场景）
    const domResult = this.editorView.domAtPos(pos)
    let innerElement: HTMLElement | null = null
    if (domResult.node.nodeType === Node.TEXT_NODE) {
      innerElement = domResult.node.parentElement
    } else {
      innerElement = domResult.node as HTMLElement
    }

    // 如果 nodeDOM 是 NodeView wrapper 或者根节点，而 domAtPos 能提供更内部的元素，则优先使用 innerElement
    if (innerElement && innerElement !== this.editorView.dom) {
      const isNodeViewWrapper = element?.hasAttribute('data-node-view-wrapper') ?? false
      if (!element || element === this.editorView.dom || isNodeViewWrapper) {
        element = innerElement
      }
    }

    if (!element) {
      return null
    }

    const selector = this.nodeMatcher.getBoundarySelector(node.type.name)
    return this.applyBoundarySelector(element, selector)
  }

  private applyBoundarySelector(element: HTMLElement, selector: NodeBoundarySelectorConfig | null): HTMLElement {
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

  /**
   * 判断是否应该显示菜单
   */
  private shouldShowMenu(): boolean {
    return this.isMouseOverHandle || this.isMouseOverMenu
  }

  /**
   * 尝试隐藏菜单（立即执行，无延迟）
   */
  private tryHideMenu() {
    // 使用 requestAnimationFrame 确保状态已更新
    requestAnimationFrame(() => {
      if (!this.shouldShowMenu() && this.tippyInstance) {
        this.tippyInstance.hide()
      }
    })
  }

  /**
   * 菜单鼠标进入回调（简化版）
   */
  private handleMenuMouseEnter = () => {
    this.isMouseOverMenu = true
    // 保持句柄和高亮的显示
    if (this.menuState.nodeId) {
      this.highlightManager.showHandleByNodeId(this.menuState.nodeId)
    }
  }

  /**
   * 菜单鼠标离开回调（简化版）
   */
  private handleMenuMouseLeave = () => {
    this.isMouseOverMenu = false
    this.tryHideMenu()
  }

  /**
   * 拖拽开始回调 - 立即隐藏菜单
   */
  private handleDragStarted() {
    // 立即隐藏菜单
    if (this.tippyInstance) {
      this.tippyInstance.hide()
    }
  }

  /**
   * 拖拽结束回调 - 确保菜单已关闭
   */
  private handleDragEnded() {
    // 重置状态
    this.isMouseOverHandle = false
    this.isMouseOverMenu = false
    // 销毁 tippy 实例（而不仅仅是隐藏）
    // 拖拽后节点位置变化，旧的 tippy 实例绑定的句柄可能已失效
    if (this.tippyInstance) {
      this.tippyInstance.destroy()
      this.tippyInstance = null
    }
    this.currentMenuHandle = null
    // 重置菜单状态
    this.menuState = {
      open: false,
      position: { x: 0, y: 0 },
      nodeId: null,
      nodePos: null,
      isEmptyNode: false
    }
    // 隐藏当前高亮
    const currentNodeId = this.highlightManager.getCurrentNodeId()
    if (currentNodeId) {
      this.highlightManager.hideHighlight(currentNodeId)
    }
    // 重置当前悬停节点，以便下次 mousemove 重新检测
    // 这是关键：拖拽后文档结构可能变化，旧的 nodeId 可能已失效
    this.highlightManager.resetCurrentNode()
  }

  /**
   * 创建句柄元素
   */
  private createHandleElement(node: PMNode, pos: number, nodeId: string): HTMLElement {
    const handle = document.createElement('div')
    handle.className = 'drag-handle feishu-menu-trigger'
    handle.style.opacity = this.handleStyleConfig.initialOpacity
    handle.style.pointerEvents = this.handleStyleConfig.initialPointerEvents
    handle.style.cursor = 'grab'
    handle.style.transition = 'opacity 0.15s ease'
    handle.style.zIndex = '2'
    this.renderHandleContent(handle, node, pos, nodeId)

    // 句柄 mouseenter（简化版：立即显示菜单）
    handle.addEventListener('mouseenter', () => {
      this.isMouseOverHandle = true
      this.highlightManager.showHandleByNodeId(nodeId)
      this.highlightManager.showHighlight(nodeId)

      // 立即显示菜单（无延迟）
      this.showMenuForHandle(handle, nodeId, pos)
    })

    // 句柄 mouseleave（简化版：立即尝试隐藏）
    handle.addEventListener('mouseleave', () => {
      this.isMouseOverHandle = false

      // 如果菜单没有打开，立即隐藏高亮
      if (!this.tippyInstance?.state.isVisible) {
        this.highlightManager.hideHighlight(nodeId)
      }

      this.tryHideMenu()
    })

    // 句柄点击事件 - 触发菜单
    handle.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      
      // 如果正在拖拽，不触发点击
      if (this.dragBehavior.isDragging()) {
        return
      }

      this.showMenuForHandle(handle, nodeId, pos)
    })

    return handle
  }

  /**
   * 为句柄显示菜单（使用 tippy.js）
   */
  private showMenuForHandle(handle: HTMLElement, nodeId: string, pos: number) {
    // 检测是否为空节点
    const isEmptyNode = handle.getAttribute('data-empty') === 'true'

    // 更新菜单状态
    this.menuState = {
      open: true,
      position: { x: 0, y: 0 },
      nodeId,
      nodePos: pos,
      isEmptyNode
    }

    // 重新渲染菜单内容
    this.renderMenu()

    // 如果已有 tippy 实例且绑定的是同一个句柄，直接显示
    if (this.tippyInstance && this.currentMenuHandle === handle) {
      this.tippyInstance.show()
      return
    }

    // 销毁旧的 tippy 实例
    if (this.tippyInstance) {
      this.tippyInstance.destroy()
      this.tippyInstance = null
    }

    this.currentMenuHandle = handle

    // 创建新的 tippy 实例
    // 位置优先级：左侧 > 下方 > 上方 > 右侧
    this.tippyInstance = tippy(handle, {
      content: this.menuContainer,
      interactive: true,           // 关键！允许鼠标在菜单上交互
      interactiveBorder: 20,       // 关键！菜单周围 20px 的透明交互区域，解决间隙问题
      trigger: 'manual',           // 手动控制
      placement: 'left-start',     // 默认：菜单在句柄左侧
      arrow: false,
      offset: [0, 4],              // 紧贴句柄，留 4px 间隙
      zIndex: 1000,
      appendTo: () => document.body,
      animation: 'shift-away',
      duration: [150, 100],        // 更快的动画
      // 配置位置回退顺序：左 → 下 → 上 → 右
      popperOptions: {
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['bottom-start', 'top-start', 'right-start'],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
              padding: 8,
            },
          },
        ],
      },
      onShow: (instance) => {
        // 绑定菜单的 hover 事件到 tippy 的 popper 元素
        // 确保鼠标移入菜单区域时不会触发隐藏
        const popper = instance.popper
        popper.addEventListener('mouseenter', this.handleMenuMouseEnter)
        popper.addEventListener('mouseleave', this.handleMenuMouseLeave)
      },
      onHide: (instance) => {
        // 移除事件监听器
        const popper = instance.popper
        popper.removeEventListener('mouseenter', this.handleMenuMouseEnter)
        popper.removeEventListener('mouseleave', this.handleMenuMouseLeave)

        // 隐藏高亮
        if (this.menuState.nodeId) {
          this.highlightManager.hideHighlight(this.menuState.nodeId)
        }
        // 更新状态并重新渲染菜单（关闭子菜单）
        this.menuState.open = false
        this.renderMenuClosed()
      }
    })

    this.tippyInstance.show()
  }

  private renderHandleContent(handle: HTMLElement, node: PMNode, pos: number, nodeId: string) {
    handle.setAttribute('data-node-id', nodeId)
    handle.setAttribute('data-pos', String(pos))
    handle.setAttribute('data-node-type', node.type.name)

    // 判断是否为空段落（只对 paragraph 类型）
    const isEmptyParagraph = node.type.name === 'paragraph' && this.isEmptyNode(node)
    handle.setAttribute('data-empty', isEmptyParagraph ? 'true' : 'false')

    // 空段落使用特殊渲染（只显示加号图标）
    if (isEmptyParagraph) {
      handle.innerHTML = `
        <div class="feishu-menu-wrapper empty-node-wrapper">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      `
      return
    }

    const isHeadingNode = node.type.name === 'heading' || node.type.name === 'numberedHeading'
    const typeIcon = getNodeTypeIcon(node.type.name, node.attrs)
    const foldButton = isHeadingNode
      ? `
          <button
            class="heading-fold-toggle-inline"
            data-testid="fold-toggle"
            data-collapsed="${node.attrs.collapsed ? 'true' : 'false'}"
            type="button"
            contentEditable="false"
            draggable="false"
            aria-label="${node.attrs.collapsed ? '展开标题内容' : '折叠标题内容'}"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M6.2 4.5c-.28 0-.53.16-.65.4a.7.7 0 00.05.71l2.5 3.9c.13.2.35.32.58.32h.16c.23 0 .45-.12.58-.32l2.5-3.9a.7.7 0 00.05-.7.75.75 0 00-.65-.41H6.2z" fill="currentColor" />
            </svg>
          </button>
        `
      : ''

    handle.innerHTML = `
      <div class="feishu-menu-wrapper ${isHeadingNode ? 'heading-with-fold' : ''}">
        ${foldButton}
        <div class="feishu-type-icon">
          <span>${typeIcon}</span>
        </div>
        <span class="feishu-drag-handle">
          ${DragHandleIcon}
        </span>
      </div>
    `

    if (isHeadingNode) {
      const headingLevel = typeof node.attrs.level === 'number' ? node.attrs.level : Number(node.attrs.level || 1)
      handle.setAttribute('data-heading-level', String(headingLevel || 1))
      const button = handle.querySelector('.heading-fold-toggle-inline') as HTMLButtonElement | null
      if (button) {
        button.onclick = (event) => {
          event.preventDefault()
          event.stopPropagation()

          const currentPos = Number(handle.getAttribute('data-pos'))
          if (!isNaN(currentPos)) {
            requestAnimationFrame(() => {
              this.foldPreviewManager.toggleHeadingFold(currentPos)
            })
          }
        }
        button.onmouseover = () => {
          // 🔧 修复：直接从 handle 元素获取最新的 pos
          const currentPos = Number(handle.getAttribute('data-pos'))
          if (!isNaN(currentPos)) {
            this.foldPreviewManager.previewFoldRange(currentPos)
          }
        }
        button.onmouseout = () => {
          this.foldPreviewManager.clearFoldPreviewHighlights()
        }
      }
    }
  }

  /**
   * 检测节点是否为空（无内容或只有空白文本）
   */
  private isEmptyNode(node: PMNode): boolean {
    if (!node.content || node.content.size === 0) {
      return true
    }

    let hasContent = false
    node.content.forEach((child) => {
      if (child.type.name !== 'text' || (child.text && child.text.trim() !== '')) {
        hasContent = true
      }
    })

    return !hasContent
  }

  private findNodePositionById(nodeId: string): number | null {
    let found: number | null = null
    this.editorView.state.doc.descendants((node, pos) => {
      if (node.attrs.id && node.attrs.id === nodeId) {
        found = pos
        return false
      }
      return
    })
    return found
  }

  /**
   * 显示指定节点的句柄（只显示句柄，不显示高亮）
   * 高亮在 hover 句柄时才显示
   */
  showHandleByNodeId(nodeId: string) {
    this.highlightManager.showHandleByNodeId(nodeId)
  }

  /**
   * 隐藏所有句柄
   */
  hideAllHandles() {
    this.highlightManager.hideAll(() => this.foldPreviewManager.clearFoldPreviewHighlights())
  }

  getCurrentNodeId(): string | null {
    return this.highlightManager.getCurrentNodeId()
  }

  isPointerWithinHandleArea(clientX: number, clientY: number, margin = 6): boolean {
    return this.highlightManager.isPointerWithinHandleArea(clientX, clientY, margin)
  }

  isPointerWithinActiveZone(clientX: number, clientY: number, margin = 6): boolean {
    return this.highlightManager.isPointerWithinActiveZone(clientX, clientY, margin)
  }

  // ========== 菜单相关方法 ==========

  /**
   * 渲染菜单（内容渲染到 tippy 的 content 容器）
   */
  private renderMenu() {
    if (!this.menuRoot) return

    // 空节点使用 EmptyNodeMenu，普通节点使用 HandleMenu
    // 两者使用相同的 hover 交互逻辑（onMouseEnter/onMouseLeave）
    if (this.menuState.isEmptyNode) {
      this.menuRoot.render(
        createElement(
          I18nProvider,
          null,
          createElement(EmptyNodeMenu, {
            open: true,
            position: { x: 0, y: 0 },
            onClose: () => this.hideMenu(),
            onSelect: (type: string) => this.handleEmptyNodeSelect(type),
            onMouseEnter: this.handleMenuMouseEnter,
            onMouseLeave: this.handleMenuMouseLeave
          })
        )
      )
    } else {
      this.menuRoot.render(
        createElement(
          I18nProvider,
          null,
          createElement(HandleMenu, {
            open: true,  // tippy 控制显示/隐藏，这里总是 true
            position: { x: 0, y: 0 },  // tippy 控制位置
            onClose: () => this.hideMenu(),
            onDuplicate: () => this.handleDuplicate(),
            onDelete: () => this.handleDelete(),
            onMouseEnter: this.handleMenuMouseEnter,
            onMouseLeave: this.handleMenuMouseLeave
          })
        )
      )
    }
  }

  /**
   * 渲染关闭状态的菜单
   */
  private renderMenuClosed() {
    if (!this.menuRoot) return

    this.menuRoot.render(
      createElement(
        I18nProvider,
        null,
        createElement(HandleMenu, {
          open: false,
          position: { x: 0, y: 0 },
          onClose: () => this.hideMenu(),
          onDuplicate: () => this.handleDuplicate(),
          onDelete: () => this.handleDelete(),
          onMouseEnter: this.handleMenuMouseEnter,
          onMouseLeave: this.handleMenuMouseLeave
        })
      )
    )
  }

  /**
   * 隐藏菜单（通过 tippy）
   */
  private hideMenu() {
    if (this.tippyInstance) {
      this.tippyInstance.hide()
    }
    this.menuState = {
      open: false,
      position: { x: 0, y: 0 },
      nodeId: null,
      nodePos: null,
      isEmptyNode: false
    }
  }

  /**
   * 处理空节点菜单选择（转换节点类型）
   */
  private handleEmptyNodeSelect(type: string) {
    const { nodePos } = this.menuState
    if (nodePos === null) return

    this.nodeOperations.handleEmptyNodeSelect(nodePos, type)
    this.hideMenu()
  }

  /**
   * 处理复制
   */
  private handleDuplicate() {
    const { nodePos } = this.menuState
    if (nodePos === null) return

    this.nodeOperations.duplicate(nodePos)
    this.hideMenu()
  }

  /**
   * 处理删除
   */
  private handleDelete() {
    const { nodePos } = this.menuState
    if (nodePos === null) return

    this.nodeOperations.deleteNode(nodePos)
    this.hideMenu()
  }

  /**
   * 销毁视图
   */
  destroy() {
    this.foldPreviewManager.clearFoldPreviewHighlights()
    this.overlay.remove()
    this.handles.clear()
    this.highlights.clear()
    this.dragBehavior.destroy()

    // 清理 tippy 实例
    if (this.tippyInstance) {
      this.tippyInstance.destroy()
      this.tippyInstance = null
    }

    // 清理 React root（延迟卸载避免竞态条件）
    if (this.menuRoot) {
      const rootToUnmount = this.menuRoot
      this.menuRoot = null
      setTimeout(() => {
        rootToUnmount.unmount()
      }, 0)
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  }
}
