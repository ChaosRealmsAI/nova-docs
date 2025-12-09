/**
 * Node Operations
 *
 * 节点操作模块 - 处理菜单触发的节点转换、复制、删除等操作
 * 从 HandleView 中提取的纯业务逻辑
 */

import type { EditorView } from '@tiptap/pm/view'
import { loggers } from '@/infrastructure/logger'

/**
 * 节点操作类
 * 封装所有菜单触发的节点操作
 */
export class NodeOperations {
  constructor(private editorView: EditorView) {}

  /**
   * 更新 EditorView 引用（文档变化时）
   */
  updateView(view: EditorView) {
    this.editorView = view
  }

  /**
   * 处理 Turn Into 操作
   * @returns true 如果操作成功执行
   */
  turnInto(nodePos: number, type: string): boolean {
    const state = this.editorView.state
    const node = state.doc.nodeAt(nodePos)
    if (!node) return false

    const tr = state.tr
    const schema = state.schema

    switch (type) {
      case 'text':
      case 'paragraph':
        tr.setNodeMarkup(nodePos, schema.nodes.paragraph)
        break
      case 'heading1':
        tr.setNodeMarkup(nodePos, schema.nodes.heading, { level: 1 })
        break
      case 'heading2':
        tr.setNodeMarkup(nodePos, schema.nodes.heading, { level: 2 })
        break
      case 'heading3':
        tr.setNodeMarkup(nodePos, schema.nodes.heading, { level: 3 })
        break
      case 'bulletList':
        return this.convertToList(nodePos, 'bulletList')
      case 'numberedList':
        return this.convertToList(nodePos, 'orderedList')
      case 'todoList':
        return this.convertToList(nodePos, 'taskList')
      case 'code':
        tr.setNodeMarkup(nodePos, schema.nodes.codeBlock)
        break
      case 'quote':
        return this.wrapInBlockquote(nodePos)
      default:
        return false
    }

    this.editorView.dispatch(tr)
    return true
  }

  /**
   * 处理空节点菜单选择（转换节点类型）
   * @returns true 如果操作成功执行
   */
  handleEmptyNodeSelect(nodePos: number, type: string): boolean {
    const state = this.editorView.state
    const node = state.doc.nodeAt(nodePos)
    if (!node) return false

    const tr = state.tr
    const schema = state.schema

    switch (type) {
      case 'heading1':
        tr.setNodeMarkup(nodePos, schema.nodes.heading, { level: 1 })
        break
      case 'heading2':
        tr.setNodeMarkup(nodePos, schema.nodes.heading, { level: 2 })
        break
      case 'heading3':
        tr.setNodeMarkup(nodePos, schema.nodes.heading, { level: 3 })
        break
      case 'numberedList':
        return this.convertToList(nodePos, 'orderedList')
      case 'bulletList':
        return this.convertToList(nodePos, 'bulletList')
      case 'todoList':
        return this.convertToList(nodePos, 'taskList')
      case 'code':
        tr.setNodeMarkup(nodePos, schema.nodes.codeBlock)
        break
      case 'quote':
        return this.wrapInBlockquote(nodePos)
      case 'table':
        return this.insertTable(nodePos)
      case 'columns':
        return this.insertColumns(nodePos)
      case 'callout':
        return this.insertCallout(nodePos)
      default:
        return false
    }

    this.editorView.dispatch(tr)
    return true
  }

  /**
   * 转换为列表
   */
  convertToList(nodePos: number, listType: string): boolean {
    const state = this.editorView.state
    const node = state.doc.nodeAt(nodePos)
    if (!node) return false

    const schema = state.schema
    const listNodeType = schema.nodes[listType]
    const listItemType = listType === 'taskList' ? schema.nodes.taskItem : schema.nodes.listItem

    if (!listNodeType || !listItemType) {
      return false
    }

    // 创建列表项，包裹原内容
    const listItem = listItemType.create(
      listType === 'taskList' ? { checked: false } : null,
      schema.nodes.paragraph.create(null, node.content)
    )
    const list = listNodeType.create(null, listItem)

    const tr = state.tr.replaceWith(nodePos, nodePos + node.nodeSize, list)
    this.editorView.dispatch(tr)
    return true
  }

  /**
   * 包裹在 blockquote 中
   */
  wrapInBlockquote(nodePos: number): boolean {
    const state = this.editorView.state
    const node = state.doc.nodeAt(nodePos)
    if (!node) return false

    const schema = state.schema
    const blockquoteType = schema.nodes.blockquote

    if (!blockquoteType) {
      return false
    }

    const blockquote = blockquoteType.create(null, node)
    const tr = state.tr.replaceWith(nodePos, nodePos + node.nodeSize, blockquote)
    this.editorView.dispatch(tr)
    return true
  }

  /**
   * 插入表格
   */
  insertTable(nodePos: number): boolean {
    const state = this.editorView.state
    const schema = state.schema

    if (!schema.nodes.table) {
      loggers.handleDisplay.warn('Table node type not found in schema')
      return false
    }

    // 创建 3x3 表格
    const cellContent = schema.nodes.paragraph.create()
    const cells = Array(3).fill(null).map(() => schema.nodes.tableCell.create(null, cellContent))
    const rows = Array(3).fill(null).map(() => schema.nodes.tableRow.create(null, cells))
    const table = schema.nodes.table.create(null, rows)

    const tr = state.tr.replaceWith(nodePos, nodePos + 1, table)
    this.editorView.dispatch(tr)
    return true
  }

  /**
   * 插入分栏
   */
  insertColumns(nodePos: number): boolean {
    const state = this.editorView.state
    const schema = state.schema

    if (!schema.nodes.columns || !schema.nodes.column) {
      loggers.handleDisplay.warn('Columns node type not found in schema')
      return false
    }

    // 创建 2 列布局
    const paragraph = schema.nodes.paragraph.create()
    const columns = schema.nodes.columns.create(null, [
      schema.nodes.column.create(null, paragraph),
      schema.nodes.column.create(null, paragraph.copy())
    ])

    const tr = state.tr.replaceWith(nodePos, nodePos + 1, columns)
    this.editorView.dispatch(tr)
    return true
  }

  /**
   * 插入高亮块
   */
  insertCallout(nodePos: number): boolean {
    const state = this.editorView.state
    const schema = state.schema

    if (!schema.nodes.callout) {
      loggers.handleDisplay.warn('Callout node type not found in schema')
      return false
    }

    const paragraph = schema.nodes.paragraph.create()
    const callout = schema.nodes.callout.create(null, paragraph)

    const tr = state.tr.replaceWith(nodePos, nodePos + 1, callout)
    this.editorView.dispatch(tr)
    return true
  }

  /**
   * 处理颜色变更
   */
  changeColor(nodePos: number, color: string, isBackground: boolean): boolean {
    const state = this.editorView.state
    const node = state.doc.nodeAt(nodePos)
    if (!node) return false

    // 设置节点属性（颜色）
    const tr = state.tr.setNodeMarkup(nodePos, undefined, {
      ...node.attrs,
      [isBackground ? 'backgroundColor' : 'textColor']: color === 'default' ? null : color
    })
    this.editorView.dispatch(tr)
    return true
  }

  /**
   * 处理复制
   */
  duplicate(nodePos: number): boolean {
    const state = this.editorView.state
    const node = state.doc.nodeAt(nodePos)
    if (!node) return false

    // 在节点后插入副本
    const insertPos = nodePos + node.nodeSize
    const tr = state.tr.insert(insertPos, node.copy(node.content))
    this.editorView.dispatch(tr)
    return true
  }

  /**
   * 处理删除
   */
  deleteNode(nodePos: number): boolean {
    const state = this.editorView.state
    const node = state.doc.nodeAt(nodePos)
    if (!node) return false

    // 删除节点
    const tr = state.tr.delete(nodePos, nodePos + node.nodeSize)
    this.editorView.dispatch(tr)
    return true
  }
}
