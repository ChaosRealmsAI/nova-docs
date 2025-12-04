/**
 * Hover Detector
 *
 * Hover 检测服务 - 检测鼠标悬停在哪个节点上
 * 采用节点路径遍历策略（参考 syllo-before-refactor 实现）
 */

import type { EditorView } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'
import { loggers } from '@nova/infrastructure/logger'
import type { HoverResult } from '../model'
import { NodeMatcher } from './NodeMatcher'

export class HoverDetector {
  private nodeMatcher: NodeMatcher
  private lastCallTime: number = 0
  private throttleMs: number

  // 性能优化：列上下文缓存，避免每次 mousemove 都调用 closest()
  private columnCache: {
    element: Element | null
    target: HTMLElement | null
    timestamp: number
  } | null = null
  private readonly COLUMN_CACHE_TTL = 50 // 缓存有效期 50ms

  constructor(throttleMs: number = 50, customTypes?: string[], customPaths?: string[]) {
    this.throttleMs = throttleMs
    this.nodeMatcher = new NodeMatcher(customTypes, customPaths)
  }

  /**
   * 处理鼠标移动事件
   *
   * 性能优化：
   * 1. 节流 50ms
   * 2. 列检测缓存 50ms
   * 3. DOM First + Raycast Fallback 两阶段检测
   *
   * @param view - ProseMirror EditorView
   * @param event - 鼠标事件
   * @returns Hover 结果（如果检测到可拖拽节点）
   */
  handleMouseMove(view: EditorView, event: MouseEvent): HoverResult | null {
    const now = performance.now()

    // 节流：50ms 内不重复处理
    if (now - this.lastCallTime < this.throttleMs) {
      return null
    }
    this.lastCallTime = now

    const target = event.target as HTMLElement

    // --- Phase 1: DOM First (极速模式) ---
    // 直接从 DOM 向上查找最近的可拖拽节点
    const domResult = this.detectFromDOM(view, target)
    if (domResult) {
      loggers.handleDisplay.debug('Phase1 DOM First 命中:', {
        nodeType: domResult.node?.type.name,
        pos: domResult.pos,
        nodeId: domResult.nodeId
      })
      return domResult
    }

    // --- Phase 2: Raycast Fallback (整行感应模式) ---
    // 支持编辑器留白区域和列容器内的整行感应
    const columnElement = this.getColumnContext(target, now)
    loggers.handleDisplay.debug('Phase2 Raycast 开始:', {
      inColumn: !!columnElement,
      targetTag: target.tagName,
      targetClass: target.className
    })

    const raycastResult = this.detectFromRaycast(view, event, columnElement)
    if (raycastResult) {
      loggers.handleDisplay.debug('Phase2 Raycast 命中:', {
        nodeType: raycastResult.node?.type.name,
        pos: raycastResult.pos,
        nodeId: raycastResult.nodeId
      })
      return raycastResult
    }

    loggers.handleDisplay.debug('未检测到可拖拽节点')
    return null
  }

  /**
   * 获取列上下文（带缓存）
   *
   * 性能优化：50ms 内对同一 target 复用缓存结果
   */
  private getColumnContext(target: HTMLElement, now: number): Element | null {
    // 如果 target 相同且缓存未过期，直接返回缓存
    if (
      this.columnCache &&
      this.columnCache.target === target &&
      now - this.columnCache.timestamp < this.COLUMN_CACHE_TTL
    ) {
      return this.columnCache.element
    }

    // 执行 DOM 查询并缓存
    const column = target.closest('[data-type="column"]')
    this.columnCache = {
      element: column,
      target,
      timestamp: now
    }

    return column
  }

  /**
   * Phase 1: 从 DOM 元素直接查找
   */
  private detectFromDOM(view: EditorView, target: HTMLElement): HoverResult | null {
    // 使用 ProseMirror 的 posAtDOM 获取位置
    // 注意：posAtDOM 返回的是该 DOM 节点在文档中的位置
    try {
      // 🔧 特殊处理：NodeView 内部元素（如 mermaid 的 textarea）
      // 这些元素不在 ProseMirror 的 contentEditable 中，posAtDOM 可能会失败
      // 先尝试找到最近的 NodeView wrapper
      const nodeViewWrapper = target.closest('[data-node-view-wrapper]') as HTMLElement | null
      const searchTarget = nodeViewWrapper || target

      // 向上查找直到找到一个可能是 PM 节点的元素
      // 这里我们利用 view.posAtDOM 的特性，它能处理内部元素
      const pos = view.posAtDOM(searchTarget, 0)
      if (pos === null || pos < 0) return null

      return this.resolveNodeAtPos(view, pos)
    } catch (e) {
      // posAtDOM 可能会在某些边缘情况下报错
      // 🔧 Fallback: 尝试从 data-type 属性向上查找
      const nodeTypeElement = target.closest('[data-type]') as HTMLElement | null
      if (nodeTypeElement) {
        try {
          const pos = view.posAtDOM(nodeTypeElement, 0)
          if (pos !== null && pos >= 0) {
            return this.resolveNodeAtPos(view, pos)
          }
        } catch {
          // 忽略
        }
      }
      return null
    }
  }

  /**
   * Phase 2: 射线探测 (Left Anchor Raycast)
   *
   * @param columnElement - 如果在列容器内，传入列元素以使用列的左边界作为锚点
   */
  private detectFromRaycast(view: EditorView, event: MouseEvent, columnElement?: Element | null): HoverResult | null {
    let anchorX: number

    if (columnElement) {
      // 列内：使用列的左侧边界作为锚点
      const columnRect = columnElement.getBoundingClientRect()
      const columnStyle = window.getComputedStyle(columnElement)
      const columnPaddingLeft = parseInt(columnStyle.paddingLeft) || 0
      anchorX = columnRect.left + columnPaddingLeft + 10
    } else {
      // 编辑器根级：使用编辑器的左侧边界作为锚点
      const editorRect = view.dom.getBoundingClientRect()
      const style = window.getComputedStyle(view.dom)
      const paddingLeft = parseInt(style.paddingLeft) || 0
      anchorX = editorRect.left + paddingLeft + 10
    }

    // 使用 posAtCoords 探测
    const posResult = view.posAtCoords({
      left: anchorX,
      top: event.clientY
    })

    if (!posResult) return null

    // --- Phase 3: Vertical Validation (垂直验证) ---
    // 必须确保找到的节点在垂直方向上真的包含鼠标
    // 这是一个关键的防误触检查
    const nodeDOM = view.nodeDOM(posResult.pos) as HTMLElement
    if (nodeDOM && nodeDOM.nodeType === 1) {
      const rect = nodeDOM.getBoundingClientRect()
      // 允许 5px 的误差 buffer
      if (event.clientY < rect.top - 5 || event.clientY > rect.bottom + 5) {
        return null
      }
    }

    return this.resolveNodeAtPos(view, posResult.pos)
  }

  /**
   * 通用逻辑：解析位置并验证白名单
   */
  private resolveNodeAtPos(view: EditorView, pos: number): HoverResult | null {
    const $pos = view.state.doc.resolve(pos)

    loggers.handleDisplay.debug('resolveNodeAtPos 开始:', { pos, depth: $pos.depth })

    // 从当前深度向上遍历，找到第一个符合白名单的可拖拽祖先节点
    for (let depth = $pos.depth; depth >= 0; depth--) {
      const node = $pos.node(depth)

      // 跳过 text 节点和 doc 节点
      if (!node || node.type.name === 'text' || node.type.name === 'doc') {
        continue
      }

      // 计算节点位置
      const nodePos = depth > 0 ? $pos.before(depth) : 0
      const path = this.buildNodePath(view, nodePos, node)

      loggers.handleDisplay.debug('检查节点:', {
        depth,
        nodeType: node.type.name,
        path,
        nodePos
      })

      // 🎯 核心：使用 NodeMatcher 检查白名单配置
      if (this.nodeMatcher.isDraggable(node, nodePos, path)) {
        const nodeId = this.nodeMatcher.getNodeId(node, nodePos)

        loggers.handleDisplay.debug('✅ 白名单匹配:', { path, nodeType: node.type.name })

        return {
          nodeId,
          pos: nodePos,
          isDraggable: true,
          node
        }
      } else {
        loggers.handleDisplay.debug('❌ 白名单不匹配:', { path, nodeType: node.type.name })
      }
    }

    return null
  }

  private buildNodePath(view: EditorView, pos: number, node: PMNode): string {
    const $resolved = view.state.doc.resolve(Math.max(0, pos))
    const parts: string[] = ['doc']

    for (let depth = 1; depth <= $resolved.depth; depth++) {
      const ancestor = $resolved.node(depth)
      if (ancestor) {
        parts.push(ancestor.type.name)
      }
    }

    const last = parts[parts.length - 1]
    if (last !== node.type.name) {
      parts.push(node.type.name)
    }

    return parts.join(' > ')
  }
}
