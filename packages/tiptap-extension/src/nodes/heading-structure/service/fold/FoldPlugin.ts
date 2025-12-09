import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Node } from '@tiptap/pm/model'
import { calculateFoldRange, getHeadingDepth, isHeadingNode } from './RangeCalculator'
import { loggers } from '@/infrastructure/logger'
import { COLUMNS_NODE_NAME, COLUMN_NODE_NAME } from '../../../multi-column/model'

export const foldPluginKey = new PluginKey('heading-fold')

function createDecorations(doc: Node): DecorationSet {
  const decorations: Decoration[] = []

  doc.descendants((node, pos) => {
    if (!isHeadingNode(node)) {
      return
    }

    const collapsed = Boolean(node.attrs.collapsed)
    const depth = getHeadingDepth(node.attrs)
    const range = calculateFoldRange(pos, depth, doc)

    if (!range) {
      return
    }

    if (collapsed) {
      loggers.foldButton.info('📦 开始创建折叠装饰', {
        headingPos: pos,
        depth,
        rangeFrom: range.from,
        rangeTo: range.to,
        headingAttrs: node.attrs,
      })

      const currentLevel = typeof node.attrs.level === 'number'
        ? node.attrs.level
        : parseInt(String(node.attrs.level ?? 1), 10) || 1

      // 使用 nodesBetween 遍历折叠范围内的所有节点
      doc.nodesBetween(range.from, range.to, (childNode, nodePos, _parent, _index) => {
        // 只处理块级节点（跳过文本和内联节点）
        if (!childNode.isBlock) {
          return
        }

        // 检查是否是同级或更高级的 heading（理论上不应该出现，因为 range 已经排除了）
        if (isHeadingNode(childNode)) {
          const nodeLevel = typeof childNode.attrs.level === 'number'
            ? childNode.attrs.level
            : parseInt(String(childNode.attrs.level ?? 1), 10) || 1

          loggers.foldButton.debug('检查子标题', {
            nodePos,
            nodeLevel,
            currentLevel,
            nodeAttrs: childNode.attrs,
          })

          // 🔧 核心判断：level <= currentLevel 不应该被折叠
          if (nodeLevel <= currentLevel) {
            loggers.foldButton.warn('⚠️ 发现同级或更高级标题（不应该出现）', {
              nodePos,
              nodeLevel,
              currentLevel,
            })
            return false
          }
        }

        // 隐藏所有类型的块级节点（包括多列容器、子标题、段落等）
        // 不再跳过 COLUMNS_NODE_NAME
        loggers.foldButton.debug('✅ 添加折叠装饰', {
          nodePos,
          nodeType: childNode.type.name,
          nodeSize: childNode.nodeSize,
        })
        decorations.push(
          Decoration.node(nodePos, nodePos + childNode.nodeSize, {
            class: 'heading-folded-content',
          })
        )

        // 返回 false 阻止递归到子节点，只处理顶层节点
        return false
      })
    }
  })

  return DecorationSet.create(doc, decorations)
}

export function createFoldPlugin() {
  return new Plugin({
    key: foldPluginKey,
    state: {
      init(_, state) {
        return createDecorations(state.doc)
      },
      apply(tr, oldDecorationSet) {
        if (!tr.docChanged && !tr.getMeta('fold-changed')) {
          // 防空检查：如果 oldDecorationSet 为空，重新创建
          if (!oldDecorationSet) {
            return createDecorations(tr.doc)
          }
          return oldDecorationSet.map(tr.mapping, tr.doc)
        }
        return createDecorations(tr.doc)
      },
    },
    props: {
      decorations(state) {
        const decos = this.getState(state)
        // 防空检查：确保返回有效的 DecorationSet
        if (!decos) {
          return DecorationSet.empty
        }
        return decos
      },
      handleClick(view, pos, event) {
        const target = event.target as HTMLElement | null
        const button = target?.closest('.heading-fold-toggle-inline') as HTMLButtonElement | null

        if (!button) {
          return false
        }

        event.preventDefault()
        const headingPosAttr = button.getAttribute('data-heading-pos')
        if (!headingPosAttr) {
          return false
        }

        const headingPos = Number(headingPosAttr)
        const headingNode = view.state.doc.nodeAt(headingPos)
        if (!headingNode || !isHeadingNode(headingNode)) {
          return false
        }

        const collapsed = !headingNode.attrs.collapsed
        const tr = view.state.tr
        tr.setNodeMarkup(headingPos, undefined, {
          ...headingNode.attrs,
          collapsed,
        })
        tr.setMeta('fold-changed', true)
        view.dispatch(tr)
        return true
      },
    },
  })
}