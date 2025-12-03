import type { Node } from '@tiptap/pm/model'
import type { NumberingMap } from '../../model'
import { loggers } from '@nova/infrastructure/logger'

export interface INumberingCalculator {
  calculate(doc: Node): NumberingMap
}

export class StackBasedNumberingCalculator implements INumberingCalculator {
  calculate(doc: Node): NumberingMap {
    const numberingMap: NumberingMap = new Map()
    const stack: number[] = []

    loggers.numbering.debug('开始计算编号', { size: doc.content.size })

    doc.descendants((node, pos) => {
      if (node.type.name !== 'heading') {
        return
      }

      if (!node.attrs.numbered) {
        return
      }

      const indent = (node.attrs.indent as number) ?? 0

      loggers.numbering.debug('处理编号标题', {
        pos,
        indent,
        level: node.attrs.level,
      })

      while (stack.length > indent + 1) {
        stack.pop()
      }

      while (stack.length < indent + 1) {
        stack.push(0)
      }

      stack[indent] += 1
      const number = stack.slice(0, indent + 1).join('.')
      numberingMap.set(pos, number)
    })

    loggers.numbering.debug('编号计算完成', { count: numberingMap.size })
    return numberingMap
  }
}

export function calculateNumbering(doc: Node): NumberingMap {
  const calculator = new StackBasedNumberingCalculator()
  return calculator.calculate(doc)
}
