import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Node } from '@tiptap/pm/model'
import { calculateNumbering } from './NumberingCalculator'
import { loggers } from '@nova/infrastructure/logger'

export const numberingPluginKey = new PluginKey('heading-numbering')

// 根据 heading 级别获取 placeholder 文字
function getPlaceholderText(level: number): string {
  const placeholders: Record<number, string> = {
    1: '标题 1',
    2: '标题 2',
    3: '标题 3',
    4: '标题 4',
    5: '标题 5',
    6: '标题 6',
  }
  return placeholders[level] || '标题'
}

function createDecorations(doc: Node): DecorationSet {
  const decorations: Decoration[] = []

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading' && node.attrs.numbered && node.attrs.manualNumber) {
      const number = node.attrs.manualNumber
      const isEmpty = node.content.size === 0
      const level = node.attrs.level || 1

      decorations.push(
        Decoration.widget(
          pos + 1,
          () => {
            // 创建容器
            const container = document.createElement('span')
            container.className = 'numbered-heading-number'
            container.contentEditable = 'false'
            container.setAttribute('aria-hidden', 'true')
            container.setAttribute('data-heading-number', number)

            // 序号文字
            container.textContent = number

            // 如果 heading 为空，添加 placeholder
            if (isEmpty) {
              const placeholder = document.createElement('span')
              placeholder.className = 'numbered-heading-placeholder'
              placeholder.textContent = getPlaceholderText(level)
              container.appendChild(placeholder)
            }

            container.addEventListener('mousedown', event => event.preventDefault())
            container.addEventListener('click', event => event.preventDefault())
            return container
          },
          { side: -1, key: `heading-number-${pos}-${isEmpty}` }
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
