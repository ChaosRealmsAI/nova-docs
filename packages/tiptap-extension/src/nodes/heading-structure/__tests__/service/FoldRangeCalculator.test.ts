import { describe, it, expect } from 'vitest'
import { Schema } from '@tiptap/pm/model'
import { calculateFoldRange } from '../../service/fold'

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

describe('HierarchicalFoldRangeCalculator', () => {
  it('calculates fold range within sibling headings', () => {
    const { doc, heading, paragraph } = schema.nodes
    const sample = doc.create(null, [
      heading.create({ level: 1 }, schema.text('Chapter 1')),
      paragraph.create(null, schema.text('Content A')),
      heading.create({ level: 2 }, schema.text('Section 1.1')),
      paragraph.create(null, schema.text('Content B')),
      heading.create({ level: 1 }, schema.text('Chapter 2')),
      paragraph.create(null, schema.text('Content C')),
    ])

    const positions: number[] = []
    sample.descendants((node, pos) => {
      if (node.type.name === 'heading' && node.attrs.level === 1 && positions.length === 0) {
        positions.push(pos)
      }
    })

    const range = calculateFoldRange(positions[0], 1, sample)
    expect(range).not.toBeNull()
    if (!range) return

    expect(range.from).toBeGreaterThan(positions[0])
    expect(range.to).toBeLessThan(sample.content.size)
  })

  it('uses indent depth for numbered headings', () => {
    const { doc, heading } = schema.nodes
    const sample = doc.create(null, [
      heading.create({ level: 2, numbered: true, indent: 0 }, schema.text('Parent')),
      heading.create({ level: 2, numbered: true, indent: 1 }, schema.text('Child 1')),
      heading.create({ level: 2, numbered: true, indent: 1 }, schema.text('Child 2')),
      heading.create({ level: 2, numbered: true, indent: 0 }, schema.text('Next root')),
    ])

    const parentPos: number[] = []
    sample.descendants((node, pos) => {
      if (node.type.name === 'heading' && (node.attrs.indent as number) === 0) {
        parentPos.push(pos)
      }
    })

    const range = calculateFoldRange(parentPos[0], 1, sample)
    expect(range).not.toBeNull()
    if (!range) return

    // 折叠范围应该只包含 indent 为 1 的两个子项
    const hiddenHeadings: string[] = []
    sample.descendants((node, pos) => {
      if (pos >= range.from && pos < range.to && node.type.name === 'heading') {
        hiddenHeadings.push(node.textContent)
      }
    })

    expect(hiddenHeadings).toEqual(['Child 1', 'Child 2'])
  })

  it('includes paragraph nodes in fold range', () => {
    const { doc, heading, paragraph } = schema.nodes
    const sample = doc.create(null, [
      heading.create({ level: 1 }, schema.text('Chapter 1')),
      paragraph.create(null, schema.text('Intro paragraph')),
      heading.create({ level: 2 }, schema.text('Section 1.1')),
      paragraph.create(null, schema.text('Section content')),
      heading.create({ level: 1 }, schema.text('Chapter 2')),
    ])

    const h1Positions: number[] = []
    sample.descendants((node, pos) => {
      if (node.type.name === 'heading' && node.attrs.level === 1) {
        h1Positions.push(pos)
      }
    })

    const range = calculateFoldRange(h1Positions[0], 1, sample)
    expect(range).not.toBeNull()
    if (!range) return

    // 收集折叠范围内的所有节点（包括paragraph和heading）
    const hiddenNodes: { type: string; text: string }[] = []
    sample.descendants((node, pos) => {
      if (pos >= range.from && pos < range.to) {
        if (node.type.name === 'heading' || node.type.name === 'paragraph') {
          hiddenNodes.push({ type: node.type.name, text: node.textContent })
        }
      }
    })

    // 应该包含段落和子标题
    expect(hiddenNodes).toEqual([
      { type: 'paragraph', text: 'Intro paragraph' },
      { type: 'heading', text: 'Section 1.1' },
      { type: 'paragraph', text: 'Section content' },
    ])
  })
})
