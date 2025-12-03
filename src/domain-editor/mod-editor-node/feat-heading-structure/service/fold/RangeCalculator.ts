import type { Node } from '@tiptap/pm/model'
import type { FoldRange } from '../../model'
import { loggers } from '@nova/infrastructure/logger'

export function isHeadingNode(node: Node): boolean {
  return node.type.name === 'heading'
}

export interface HeadingAttrs {
  level?: number
  indent?: number
  numbered?: boolean
}

export function getHeadingDepth(attrs: HeadingAttrs): number {
  loggers.foldCalculator.debug('🔢 计算 heading depth', { attrs })

  // 统一使用 level 属性计算 depth，忽略 numbered 和 indent
  // 这样可以保证 H2 总是比 H1 深，且 H2 与 H2 同级
  const level = typeof attrs.level === 'number'
    ? attrs.level
    : parseInt(String(attrs.level ?? 1), 10) || 1

  const depth = Math.max(1, Math.min(level, 6))
  loggers.foldCalculator.debug('✅ 使用 level 计算 depth', {
    level,
    depth,
    attrs
  })
  return depth
}

export interface IFoldRangeCalculator {
  calculate(headingPos: number, headingDepth: number, doc: Node): FoldRange | null
}

export class HierarchicalFoldRangeCalculator implements IFoldRangeCalculator {
  calculate(headingPos: number, headingDepth: number, doc: Node): FoldRange | null {
    loggers.foldCalculator.debug('📐 开始计算折叠范围', { headingPos, headingDepth })

    const headingNode = doc.nodeAt(headingPos)
    if (!headingNode || !isHeadingNode(headingNode)) {
      loggers.foldCalculator.warn('折叠范围计算失败: 目标不是标题', { headingPos })
      return null
    }

    const $headingPos = doc.resolve(headingPos)
    let containerEnd = doc.content.size
    let containerStart = 0
    let containerNode: Node | null = null

    for (let depth = $headingPos.depth; depth > 0; depth -= 1) {
      const node = $headingPos.node(depth)
      if (node.type.spec.isolating) {
        containerNode = node
        containerStart = $headingPos.start(depth)
        containerEnd = containerStart + node.content.size
        loggers.foldCalculator.debug('找到容器节点', { containerStart, containerEnd })
        break
      }
    }

    const from = headingPos + headingNode.nodeSize
    if (from >= containerEnd) {
      loggers.foldCalculator.debug('折叠范围为空（from >= containerEnd）', { from, containerEnd })
      return null
    }

    let to = containerEnd
    const currentLevel = getHeadingDepth(headingNode.attrs)

    loggers.foldCalculator.info('🎯 开始遍历查找折叠终点', {
      headingPos,
      currentLevel,
      containerEnd,
      hasContainer: !!containerNode,
    })

    // 🔧 修复：使用标志变量，找到第一个停止点后不再更新
    let foundStopPoint = false

    doc.descendants((node, pos) => {
      // 如果已经找到停止点，不再处理
      if (foundStopPoint) {
        return false
      }

      // 跳过被折叠 heading 之前的节点
      if (pos <= headingPos) {
        return
      }
      // 超出 container 范围，停止遍历
      if (pos >= containerEnd) {
        loggers.foldCalculator.debug('超出 container 范围，停止遍历', { pos, containerEnd })
        return false
      }

      // 检查是否在同一个 container 中
      if (containerNode) {
        const $pos = doc.resolve(pos)
        let inSameContainer = false
        for (let depth = $pos.depth; depth > 0; depth -= 1) {
          if ($pos.node(depth) === containerNode) {
            inSameContainer = true
            break
          }
        }
        if (!inSameContainer) {
          loggers.foldCalculator.debug('❌ 节点不在同一 container，跳过', {
            pos,
            nodeType: node.type.name,
          })
          return
        }
      }

      // 检查是否是 heading
      if (isHeadingNode(node)) {
        const nodeLevel = getHeadingDepth(node.attrs)

        loggers.foldCalculator.info('🔍 检查子标题', {
          pos,
          nodeType: node.type.name,
          nodeLevel,
          currentLevel,
          willStop: nodeLevel <= currentLevel,
          nodeAttrs: node.attrs,
        })

        // 🔧 核心判断：遇到 level <= currentLevel 的 heading，停止折叠
        if (nodeLevel <= currentLevel) {
          to = pos
          foundStopPoint = true  // 🔧 标记已找到停止点
          loggers.foldCalculator.info('🛑 遇到同级或更高级标题，停止折叠', {
            stopAt: pos,
            nodeLevel,
            currentLevel,
          })
          return false
        }
      }
    })

    if (from >= to) {
      loggers.foldCalculator.debug('折叠范围为空（from >= to）', { from, to })
      return null
    }

    const range = { from, to }
    loggers.foldCalculator.info('✅ 计算出折叠范围', range)
    return range
  }
}

export function calculateFoldRange(headingPos: number, headingDepth: number, doc: Node): FoldRange | null {
  const calculator = new HierarchicalFoldRangeCalculator()
  return calculator.calculate(headingPos, headingDepth, doc)
}
