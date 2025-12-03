import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Node } from '@tiptap/pm/model'
import { calculateNumbering } from './NumberingCalculator'
import { loggers } from '@nova/infrastructure/logger'

export const numberingPluginKey = new PluginKey('heading-numbering')

function createDecorations(doc: Node): DecorationSet {
  const decorations: Decoration[] = []
  
  doc.descendants((node, pos) => {
    if (node.type.name === 'heading' && node.attrs.numbered && node.attrs.manualNumber) {
      const number = node.attrs.manualNumber
      decorations.push(
        Decoration.widget(
          pos + 1,
          () => {
            const button = document.createElement('button')
            button.className = 'numbered-heading-number'
            button.textContent = number // 直接显示 manualNumber，不加点（因为输入时已经有点了）
            button.contentEditable = 'false'
            button.tabIndex = -1
            button.setAttribute('aria-hidden', 'true')
            button.setAttribute('data-heading-number', number)
            button.setAttribute('type', 'button')
            button.addEventListener('mousedown', event => event.preventDefault())
            button.addEventListener('click', event => event.preventDefault())
            return button
          },
          { side: -1, key: `heading-number-${pos}` }
        )
      )
    }
  })

  loggers.numbering.debug('创建编号装饰', { count: decorations.length })
  return DecorationSet.create(doc, decorations)
}

export function createNumberingPlugin() {
  return new Plugin({
    key: numberingPluginKey,
    state: {
      init(_, state) {
        loggers.numbering.debug('编号插件初始化')
        return createDecorations(state.doc)
      },
      apply(tr, decorationSet) {
        const docChanged = tr.docChanged
        const numberingChanged = tr.getMeta('numbering-changed')

        loggers.numbering.debug('NumberingPlugin.apply 调用', {
          docChanged,
          numberingChanged,
        })

        // 如果文档没有变化且没有标记编号需要更新，则映射现有装饰
        if (!docChanged && !numberingChanged) {
          loggers.numbering.debug('无需更新，映射现有装饰')
          return decorationSet.map(tr.mapping, tr.doc)
        }
        // 文档有变化或编号需要更新时，重新生成装饰
        loggers.numbering.debug('重新生成编号装饰', { docChanged, numberingChanged })
        return createDecorations(tr.doc)
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)
      },
    },
  })
}
