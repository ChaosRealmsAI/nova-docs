import type { Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { MAX_HEADING_LEVEL, MIN_HEADING_LEVEL, MAX_INDENT_LEVEL } from '../../model'
import { loggers } from '@/infrastructure/logger'

// 扩展编辑器命令类型
interface EditorCommands {
  indentHeading: () => boolean
  outdentHeading: () => boolean
}

export function createNumberingShortcuts(editor: Editor) {
  return {
    Tab: () => {
      const { state } = editor
      const { $from } = state.selection
      const node = $from.parent

      if (node.type.name !== 'heading' || !node.attrs.numbered) {
        return false
      }

      const indent = node.attrs.indent as number
      const level = node.attrs.level as number
      if (indent >= MAX_INDENT_LEVEL || level >= MAX_HEADING_LEVEL) {
        return true
      }

      loggers.headingShortcut.debug('快捷键: Tab 增加缩进', { indent, level })
      return (editor.commands as unknown as EditorCommands).indentHeading()
    },
    'Shift-Tab': () => {
      const { state } = editor
      const { $from } = state.selection
      const node = $from.parent

      if (node.type.name !== 'heading' || !node.attrs.numbered) {
        return false
      }

      const indent = node.attrs.indent as number
      if (indent === 0) {
        return true
      }

      loggers.headingShortcut.debug('快捷键: Shift+Tab 减少缩进', { indent })
      return (editor.commands as unknown as EditorCommands).outdentHeading()
    },
    Enter: () => {
      const { state, view } = editor
      const { $from, $to } = state.selection
      const node = $from.parent

      if (node.type.name !== 'heading' || !node.attrs.numbered) {
        return false
      }

      const textContent = node.textContent ?? ''
      if (textContent.length === 0) {
        const paragraphType = state.schema.nodes.paragraph
        if (!paragraphType) {
          return false
        }
        const { tr } = state
        loggers.headingShortcut.debug('快捷键: Enter 退出编号模式 (空节点)')
        tr.replaceWith($from.before(), $from.after(), paragraphType.create())
        tr.setSelection(TextSelection.create(tr.doc, $from.before() + 1))
        view.dispatch(tr)
        return true
      }

      loggers.headingShortcut.debug('快捷键: Enter 创建同级编号标题', {
        level: node.attrs.level,
        indent: node.attrs.indent,
      })

      const newNode = state.schema.nodes.heading?.create({
        level: node.attrs.level,
        numbered: true,
        indent: node.attrs.indent,
        id: null,
        collapsed: false,
      })

      if (!newNode) {
        return false
      }

      const insertPos = $to.after()
      const { tr } = state
      tr.insert(insertPos, newNode)
      tr.setSelection(TextSelection.create(tr.doc, insertPos + 1))
      view.dispatch(tr)
      return true
    },
    Backspace: () => {
      const { state, view } = editor
      const { $from, empty } = state.selection
      const node = $from.parent

      if (node.type.name !== 'heading' || !node.attrs.numbered) {
        return false
      }

      if (!empty || $from.parentOffset !== 0) {
        return false
      }

      loggers.headingShortcut.debug('快捷键: Backspace 退出编号模式', {
        level: node.attrs.level,
      })

      const { tr } = state
      tr.setNodeMarkup($from.before(), undefined, {
        ...node.attrs,
        numbered: false,
        indent: 0,
        level: Math.max(node.attrs.level ?? MIN_HEADING_LEVEL, MIN_HEADING_LEVEL),
      })
      view.dispatch(tr)
      return true
    },
  }
}
