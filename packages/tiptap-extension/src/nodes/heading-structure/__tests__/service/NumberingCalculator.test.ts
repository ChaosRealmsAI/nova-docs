import { describe, it, expect } from 'vitest'
import { Schema } from '@tiptap/pm/model'
import { calculateNumbering } from '../../service/numbering'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    text: { group: 'inline' },
    paragraph: { group: 'block', content: 'inline*' },
    heading: {
      group: 'block',
      content: 'inline*',
      attrs: {
        level: { default: 1 },
        numbered: { default: false },
        indent: { default: 0 },
        collapsed: { default: false },
        id: { default: null },
      },
      parseDOM: [],
      toDOM: node => [`h${node.attrs.level}`, 0],
    },
  },
  marks: {},
})

describe('StackBasedNumberingCalculator', () => {
  it('calculates nested numbering correctly', () => {
    const { doc, heading } = schema.nodes
    const sample = doc.create(null, [
      heading.create({ level: 1, numbered: true, indent: 0 }, schema.text('Intro')),
      heading.create({ level: 2, numbered: true, indent: 1 }, schema.text('Child 1')),
      heading.create({ level: 3, numbered: true, indent: 2 }, schema.text('Grand child')),
      heading.create({ level: 2, numbered: true, indent: 1 }, schema.text('Child 2')),
      heading.create({ level: 1, numbered: true, indent: 0 }, schema.text('Outro')),
    ])

    const map = calculateNumbering(sample)
    const numberingList: string[] = []
    sample.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        numberingList.push(map.get(pos) ?? '')
      }
    })

    expect(numberingList).toEqual(['1', '1.1', '1.1.1', '1.2', '2'])
  })
})
