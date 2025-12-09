import { InputRule } from '@tiptap/core'
import { Selection } from '@tiptap/pm/state'
import type { NodeType } from '@tiptap/pm/model'
import { loggers } from '@/infrastructure/logger'

export function createNumberFirstRule(type: NodeType): InputRule {
  return new InputRule({
    find: /^((?:\d+\.)+)\s+(#{1,6})\s$/,
    handler: ({ range, match, commands }) => {
      const level = match[2].length as 1 | 2 | 3 | 4 | 5 | 6
      loggers.numbering.debug('匹配模式: 数字在前', { text: match[0], level })
      commands.deleteRange({ from: range.from, to: range.to })
      commands.setNode(type.name, { level, numbered: true, indent: 0 })
      commands.command(({ tr, dispatch }) => {
        if (!dispatch) return false
        const pos = tr.mapping.map(range.from)
        const resolved = tr.doc.resolve(pos)
        const selection = Selection.near(resolved, 1)
        dispatch(tr.setSelection(selection))
        return true
      })
    },
  })
}

export function createHeadingFirstRule(type: NodeType): InputRule {
  return new InputRule({
    find: /^(#{1,6})\s+((?:\d+\.)+)\s$/,
    handler: ({ range, match, commands }) => {
      const level = match[1].length as 1 | 2 | 3 | 4 | 5 | 6
      loggers.numbering.debug('匹配模式: 标题在前', { text: match[0], level })
      commands.deleteRange({ from: range.from, to: range.to })
      commands.setNode(type.name, { level, numbered: true, indent: 0 })
      commands.command(({ tr, dispatch }) => {
        if (!dispatch) return false
        const pos = tr.mapping.map(range.from)
        const resolved = tr.doc.resolve(pos)
        const selection = Selection.near(resolved, 1)
        dispatch(tr.setSelection(selection))
        return true
      })
    },
  })
}

export function createHeadingToNumberedRule(_type: NodeType): InputRule {
  return new InputRule({
    find: /((?:\d+\.)+)\s$/,
    handler: ({ state, range, commands }) => {
      const $pos = state.doc.resolve(range.from)
      const node = $pos.parent
      if (node.type.name !== 'heading') {
        return null
      }

      loggers.numbering.debug('在标题内部转换为编号模式', {
        level: node.attrs.level,
        pos: range.from,
      })

      commands.deleteRange({ from: range.from, to: range.to })
      commands.updateAttributes('heading', { numbered: true, indent: 0 })
      commands.command(({ tr, dispatch }) => {
        if (!dispatch) return false
        const pos = tr.mapping.map(range.from)
        const resolved = tr.doc.resolve(pos)
        const selection = Selection.near(resolved, 1)
        dispatch(tr.setSelection(selection))
        return true
      })
    },
  })
}

export function createListToNumberedRule(type: NodeType): InputRule {
  return new InputRule({
    find: /^(#{1,6})\s$/,
    handler: ({ state, range, match, commands }) => {
      const $pos = state.doc.resolve(range.from)
      const node = $pos.parent
      if (node.type.name !== 'listItem') {
        return null
      }

      const level = match[1].length as 1 | 2 | 3 | 4 | 5 | 6
      loggers.numbering.debug('列表项转换为编号标题', { level })

      commands.deleteRange({ from: range.from, to: range.to })
      commands.setNode(type.name, { level, numbered: true, indent: 0 })
      commands.command(({ tr, dispatch }) => {
        if (!dispatch) return false
        const pos = tr.mapping.map(range.from)
        const resolved = tr.doc.resolve(pos)
        const selection = Selection.near(resolved, 1)
        dispatch(tr.setSelection(selection))
        return true
      })
    },
  })
}

export function createNumberingInputRules(type: NodeType): InputRule[] {
  return [
    createNumberFirstRule(type),
    createHeadingFirstRule(type),
    createHeadingToNumberedRule(type),
    createListToNumberedRule(type),
  ]
}
