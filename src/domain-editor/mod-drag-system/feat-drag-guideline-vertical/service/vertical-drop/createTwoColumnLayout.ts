import type { EditorView } from '@tiptap/pm/view'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { loggers } from '@nova/infrastructure/logger'
import {
  COLUMNS_NODE_NAME,
  COLUMN_NODE_NAME,
  MAX_COLUMNS,
} from '@nova/domain-editor/mod-editor-node/feat-multi-column-node/model'
import type { VerticalGuidelineSide } from '../../model'
import { BorderNodeFinder } from '../BorderNodeFinder'

/**
 * 在目标块位置创建两列布局：
 * - 左列：拖拽内容
 * - 右列：目标块内容
 *
 * 仅在目标块不在 columns 内时执行。
 *
 * @param insertAfterIndex 在列容器的指定列后插入新列（0-based）。仅在目标是 columns 时使用。
 */
export function createTwoColumnLayoutAt(
  view: EditorView,
  targetPos: number,
  side: VerticalGuidelineSide,
  insertAfterIndex?: number | null,
): boolean {
  const { state, dragging } = view

  console.log('[createTwoColumnLayoutAt] START', { targetPos, side, insertAfterIndex, hasDragging: !!dragging })
  loggers.dragGuideline.debug('[createTwoColumnLayoutAt] START', {
    targetPos,
    side,
    hasDragging: !!dragging,
  })

  if (!dragging || dragging.from === undefined || dragging.to === undefined || !dragging.slice) {
    console.log('[createTwoColumnLayoutAt] skip: invalid dragging data')
    loggers.dragGuideline.debug('[createTwoColumnLayoutAt] skip: invalid dragging data', {
      hasDragging: !!dragging,
    })
    return false
  }

  // 解析为块级节点（兼容 text 节点等情况）
  const resolved = resolveBlockAtPos(state.doc, targetPos)
  if (!resolved) {
    console.log('[createTwoColumnLayoutAt] skip: could not resolve block node')
    loggers.dragGuideline.debug('[createTwoColumnLayoutAt] skip: could not resolve block node', {
      targetPos,
    })
    return false
  }

  let { pos, node: targetNode } = resolved
  const $target = state.doc.resolve(pos)

  console.log('[createTwoColumnLayoutAt] Resolved target', { pos, nodeType: targetNode.type.name })
  loggers.dragGuideline.debug('[createTwoColumnLayoutAt] Resolved target', {
    pos,
    nodeType: targetNode.type.name,
    depth: $target.depth,
  })

  if (!targetNode || !targetNode.isBlock) {
    console.log('[createTwoColumnLayoutAt] skip: target node is not a block')
    loggers.dragGuideline.debug('[createTwoColumnLayoutAt] skip: target node is not a block', {
      pos,
      nodeType: targetNode?.type.name,
    })
    return false
  }

  // 🔥 关键修复：先检查目标节点本身是否是 columns
  if (targetNode.type.name === COLUMNS_NODE_NAME) {
    console.log('[createTwoColumnLayoutAt] Target IS a COLUMNS node')
    loggers.dragGuideline.debug('[createTwoColumnLayoutAt] ✅ Target IS a COLUMNS node, calling addColumnToExistingColumns', {
      columnsPos: pos,
      side,
      columnsChildCount: targetNode.childCount,
    })

    loggers.dragGuideline.debug('vertical-drop: target is columns node, add column', {
      columnsPos: pos,
      side,
      insertAfterIndex,
      columnsChildCount: targetNode.childCount,
    })

    return addColumnToExistingColumns(view, pos, targetNode, side, insertAfterIndex)
  }

  // 如果目标在 columns 容器内：在现有容器上添加一列，而不是创建嵌套容器
  loggers.dragGuideline.debug('[createTwoColumnLayoutAt] Checking if target is inside columns...')
  for (let d = $target.depth; d >= 0; d--) {
    const node = $target.node(d)
    loggers.dragGuideline.debug(`[createTwoColumnLayoutAt] depth ${d}: ${node.type.name}`)

    if (node.type.name === COLUMNS_NODE_NAME) {
      const columnsDepth = d
      const columnsNode = node
      const columnsPos = $target.before(columnsDepth)

      console.log('[createTwoColumnLayoutAt] Found COLUMNS ancestor')
      loggers.dragGuideline.debug('[createTwoColumnLayoutAt] ✅ Found COLUMNS ancestor, calling addColumnToExistingColumns', {
        columnsPos,
        columnsDepth,
        side,
        columnsChildCount: columnsNode.childCount,
      })

      loggers.dragGuideline.debug('vertical-drop: target inside existing columns, add column', {
        columnsPos,
        side,
        insertAfterIndex,
        columnsChildCount: columnsNode.childCount,
      })

      return addColumnToExistingColumns(view, columnsPos, columnsNode, side, insertAfterIndex)
    }
  }

  loggers.dragGuideline.debug('[createTwoColumnLayoutAt] No COLUMNS ancestor found, creating new two-column layout')

  // 如果目标在单个 column 节点内，也视为在 columns 内，由 columns 容器处理
  for (let d = $target.depth; d >= 0; d--) {
    const node = $target.node(d)
    if (node.type.name === COLUMN_NODE_NAME) {
      console.log('[createTwoColumnLayoutAt] skip: target inside column without columns ancestor')
      loggers.dragGuideline.debug('[createTwoColumnLayoutAt] skip: target inside column without columns ancestor', {
        nodeType: node.type.name,
        depth: d,
      })
      return false
    }
  }

  const columnsType = state.schema.nodes[COLUMNS_NODE_NAME]
  const columnType = state.schema.nodes[COLUMN_NODE_NAME]

  if (!columnsType || !columnType) {
    console.log('[createTwoColumnLayoutAt] schema missing columns/column')
    loggers.dragGuideline.error(
      'vertical-drop: columns / column node type not found in schema',
      { available: Object.keys(state.schema.nodes) },
    )
    return false
  }

  // 构造拖拽内容和目标内容（只取第一个块级节点）
  const draggedContent = dragging.slice.content.firstChild || state.schema.nodes.paragraph.create()
  const targetSlice = state.doc.slice(pos, pos + targetNode.nodeSize)
  const targetContent =
    targetSlice.content.firstChild || state.schema.nodes.paragraph.create()

  const leftContent = side === 'left' ? draggedContent : targetContent
  const rightContent = side === 'left' ? targetContent : draggedContent

  const leftColumn = columnType.create({ width: 50 }, leftContent)
  const rightColumn = columnType.create({ width: 50 }, rightContent)

  const columnsNode = columnsType.create(
    {
      count: 2,
      columnWidths: [50, 50],
      layout: 'grid',
    },
    [leftColumn, rightColumn],
  )

  const tr = state.tr

  // 删除目标块
  tr.delete(pos, pos + targetNode.nodeSize)
  // 插入 columns 节点
  tr.insert(pos, columnsNode)

  // 删除源（移动模式）
  const { from, to, move } = dragging as any
  if (move && from !== undefined && to !== undefined) {
    const deleteFrom = from < pos ? from : from + columnsNode.nodeSize - targetNode.nodeSize
    const deleteTo = deleteFrom + (to - from)
    tr.delete(deleteFrom, deleteTo)
  }

  view.dispatch(tr)

  console.log('[createTwoColumnLayoutAt] Success: columns created')
  loggers.dragGuideline.debug('[createTwoColumnLayoutAt] columns created', {
    targetPos: pos,
    from: dragging.from,
    to: dragging.to,
    move: (dragging as any).move,
  })

  return true
}

/**
 * 从任意文档位置解析出块级节点及其起始位置
 * 兼容 text 节点 / inline 节点等情况。
 */
function resolveBlockAtPos(
  doc: ProseMirrorNode,
  pos: number,
): { node: ProseMirrorNode; pos: number } | null {
  const $pos = doc.resolve(pos)

  // 从当前位置向上寻找第一个块级节点
  for (let depth = $pos.depth; depth >= 0; depth--) {
    const node = $pos.node(depth)
    if (node.isBlock && node.type.name !== 'doc') {
      const blockPos = depth > 0 ? $pos.before(depth) : 0
      return { node, pos: blockPos }
    }
  }

  // 回退：尝试 nodeAfter / nodeBefore
  const fallback = $pos.nodeAfter || $pos.nodeBefore
  if (fallback && fallback.isBlock) {
    return { node: fallback, pos: $pos.pos }
  }

  return null
}

/**
 * 在当前 Y 坐标范围内查找多列容器 DOM
 * 解决鼠标在编辑器外侧时无法命中多列容器的问题
 */
function findColumnsElementAtY(view: EditorView, clientY: number): HTMLElement | null {
  const columns = Array.from(
    view.dom.querySelectorAll('[data-type="columns"]'),
  ) as HTMLElement[]

  let closest: { element: HTMLElement; distance: number } | null = null

  for (const element of columns) {
    const rect = element.getBoundingClientRect()
    const withinVerticalBounds = clientY >= rect.top && clientY <= rect.bottom

    if (!withinVerticalBounds) {
      continue
    }

    const distanceToCenter = Math.abs(clientY - (rect.top + rect.height / 2))
    if (!closest || distanceToCenter < closest.distance) {
      closest = {
        element,
        distance: distanceToCenter,
      }
    }
  }

  return closest?.element ?? null
}

/**
 * 在已有 columns 容器中添加一列：
 * - 不创建嵌套 columns
 * - 支持在指定列索引位置插入（insertAfterIndex），或在容器最左/最右侧插入（side）
 * - 平均分配列宽
 *
 * @param insertAfterIndex 在指定列后插入新列（0-based）。如果提供，则忽略 side 参数。
 */
function addColumnToExistingColumns(
  view: EditorView,
  columnsPos: number,
  columnsNode: ProseMirrorNode,
  side: VerticalGuidelineSide,
  insertAfterIndex?: number | null,
): boolean {
  const { state, dragging } = view

  console.log('[addColumnToExistingColumns] START', { columnsPos, side, insertAfterIndex, currentCount: columnsNode.childCount })
  loggers.dragGuideline.debug('[addColumnToExistingColumns] START', {
    columnsPos,
    side,
    currentCount: columnsNode.childCount,
    hasDragging: !!dragging,
  })

  if (!dragging || dragging.slice == null) {
    console.log('[addColumnToExistingColumns] skip: no dragging slice')
    loggers.dragGuideline.debug('[addColumnToExistingColumns] skip: no dragging slice')
    loggers.dragGuideline.debug('vertical-drop: addColumnToExistingColumns skipped, no dragging slice')
    return false
  }

  const { schema } = state
  const columnType = schema.nodes[COLUMN_NODE_NAME]

  if (!columnType) {
    console.log('[addColumnToExistingColumns] skip: column node type not found')
    loggers.dragGuideline.error('vertical-drop: column node type not found in schema', {
      available: Object.keys(schema.nodes),
    })
    return false
  }

  const currentCount = columnsNode.childCount
  if (currentCount >= MAX_COLUMNS) {
    console.log('[addColumnToExistingColumns] skip: reached MAX_COLUMNS')
    loggers.dragGuideline.debug('[addColumnToExistingColumns] skip: reached MAX_COLUMNS', {
      currentCount,
      MAX_COLUMNS,
    })
    loggers.dragGuideline.debug('vertical-drop: reached MAX_COLUMNS, skip add column', {
      currentCount,
      MAX_COLUMNS,
    })
    return false
  }

  const draggedContent =
    dragging.slice.content.firstChild || schema.nodes.paragraph.create()

  loggers.dragGuideline.debug('[addColumnToExistingColumns] Building new columns structure', {
    side,
    insertAfterIndex,
    draggedContentType: draggedContent.type.name,
  })

  const children: ProseMirrorNode[] = []
  const newColumn = columnType.create({ width: 0 }, draggedContent)

  // 如果指定了 insertAfterIndex，在该位置后插入新列
  if (insertAfterIndex != null && insertAfterIndex >= 0 && insertAfterIndex < columnsNode.childCount) {
    for (let i = 0; i < columnsNode.childCount; i++) {
      children.push(columnsNode.child(i))
      if (i === insertAfterIndex) {
        children.push(newColumn)
      }
    }
  } else {
    // 否则使用 side 参数决定插入位置
    if (side === 'left') {
      children.push(newColumn)
    }

    for (let i = 0; i < columnsNode.childCount; i++) {
      children.push(columnsNode.child(i))
    }

    if (side === 'right') {
      children.push(newColumn)
    }
  }

  const newCount = children.length
  const equalWidth = 100 / newCount
  const newWidths = Array(newCount).fill(equalWidth)

  loggers.dragGuideline.debug('[addColumnToExistingColumns] Creating new columns node', {
    newCount,
    newWidths,
    oldCount: columnsNode.childCount,
  })

  const newColumnsAttrs = {
    ...columnsNode.attrs,
    count: newCount,
    columnWidths: newWidths,
  }

  const newColumnsNode = columnsNode.type.create(newColumnsAttrs, children)

  let tr = state.tr.replaceWith(
    columnsPos,
    columnsPos + columnsNode.nodeSize,
    newColumnsNode,
  )

  const { from, to, move } = dragging as any
  if (move && from !== undefined && to !== undefined) {
    const mappedFrom = tr.mapping.map(from)
    const mappedTo = tr.mapping.map(to)

    loggers.dragGuideline.debug('[addColumnToExistingColumns] Deleting dragging source', {
      from,
      to,
      mappedFrom,
      mappedTo,
    })

    tr = tr.delete(mappedFrom, mappedTo)
  }

  view.dispatch(tr)

  loggers.dragGuideline.debug('[addColumnToExistingColumns] ✅ SUCCESS: Added column to existing columns', {
    columnsPos,
    newCount,
    side,
  })

  return true
}
