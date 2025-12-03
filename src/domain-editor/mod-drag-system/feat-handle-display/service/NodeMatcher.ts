/**
 * Node Matcher
 *
 * 节点匹配器 - 判断节点是否可拖拽
 */

import type { Node as PMNode } from '@tiptap/pm/model'
import { DRAGGABLE_NODE_TYPES, DRAGGABLE_NODE_PATHS } from '../model'

export class NodeMatcher {
  private draggableTypes: Set<string>
  private pathWhitelist: Set<string>

  constructor(customTypes?: string[], customPaths?: string[]) {
    this.draggableTypes = new Set(customTypes || DRAGGABLE_NODE_TYPES)

    // 配置优先级：
    // 1. 显式传入 customPaths → 使用调用方提供的路径白名单
    // 2. 只传入 customTypes（无 customPaths）→ 关闭路径白名单，完全按类型判断
    // 3. 都不传 → 使用默认的 DRAGGABLE_NODE_PATHS
    if (typeof customPaths !== 'undefined') {
      this.pathWhitelist = new Set(customPaths)
    } else if (!customTypes) {
      this.pathWhitelist = new Set(DRAGGABLE_NODE_PATHS)
    } else {
      this.pathWhitelist = new Set()
    }
  }

  /**
   * 判断节点是否可拖拽
   *
   * @param node - ProseMirror 节点
   * @param _pos - 节点位置（保留参数以供未来扩展）
   * @param path - 结构化路径（如 "doc > bulletList > listItem"）
   * @returns 是否可拖拽
   */
  isDraggable(node: PMNode, _pos: number, path?: string): boolean {
    // 当配置了结构化白名单时，严格使用路径白名单判断
    //（即“全白名单模式”）：只有路径本身在白名单中才允许拖拽
    if (this.pathWhitelist.size > 0) {
      if (!path) {
        return false
      }

      return this.pathWhitelist.has(path)
    }

    return this.draggableTypes.has(node.type.name)
  }

  /**
   * 获取节点唯一标识
   *
   * @param node - ProseMirror 节点
   * @param pos - 节点位置
   * @returns 节点唯一标识
   */
  getNodeId(node: PMNode, pos: number): string {
    return node.attrs.id || `node-${pos}`
  }

  getBoundarySelector(nodeType: string): NodeBoundarySelectorConfig | null {
    return NODE_BOUNDARY_SELECTORS[nodeType] || null
  }
}

export interface NodeBoundarySelectorConfig {
  primary?: string | null
  fallback?: string | null
}

const NODE_BOUNDARY_SELECTORS: Record<string, NodeBoundarySelectorConfig> = {
  paragraph: { primary: 'p' },
  heading: { primary: 'h1, h2, h3, h4, h5, h6' },
  blockquote: { primary: 'blockquote' },
  codeBlock: { primary: 'pre', fallback: 'code' },
  bulletList: { primary: 'ul' },
  orderedList: { primary: 'ol' },
  listItem: { primary: 'li' },
  callout: { primary: '[data-type="callout"]', fallback: '.callout-wrapper' },
  taskList: { primary: 'ul[data-type="taskList"]', fallback: 'ul' },
  taskItem: { primary: 'li[data-type="taskItem"]', fallback: 'li' },
  columns: { primary: '.columns-container-grid', fallback: '.columns-view-grid' },
  columnsFlex: { primary: '.columns-container-grid', fallback: '[data-type="columnsFlex"]' },
  column: { primary: '[data-type="column"]' },
  mermaid: { primary: '[data-type="mermaid"]', fallback: '.mermaid-container' },
  table: { primary: '.tableWrapper', fallback: 'table' }
}
