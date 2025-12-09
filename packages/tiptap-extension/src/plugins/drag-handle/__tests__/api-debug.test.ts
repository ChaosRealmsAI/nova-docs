/**
 * API 调试测试
 * 用于单独测试和调试外部 API 的行为
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { EditorView } from '@tiptap/pm/view'
import { EditorState } from '@tiptap/pm/state'
import { DOMParser as ProseMirrorDOMParser } from '@tiptap/pm/model'
import { schema as baseSchema } from '@tiptap/pm/schema-basic'

describe('API Debug Tests', () => {
  let container: HTMLElement
  let editorView: EditorView

  beforeEach(() => {
    container = document.createElement('div')
    container.style.position = 'relative'
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)

    const content = `
      <h1>Test Document</h1>
      <p>First paragraph</p>
      <p>Second paragraph</p>
    `

    const doc = ProseMirrorDOMParser.fromSchema(baseSchema).parse(
      new window.DOMParser().parseFromString(content, 'text/html').body
    )

    const state = EditorState.create({
      doc,
      schema: baseSchema
    })

    editorView = new EditorView(container, {
      state,
      editable: () => true
    })
  })

  it('调试 posAtCoords API', () => {
    // 测试不同坐标点
    const coords = [
      { left: 100, top: 50 },
      { left: 200, top: 100 },
      { left: 300, top: 150 }
    ]

    coords.forEach(coord => {
      const result = editorView.posAtCoords(coord)
      console.log('posAtCoords 测试:', {
        input: coord,
        output: result,
        pos: result?.pos,
        inside: result?.inside
      })
    })
  })

  it('调试 resolve API', () => {
    // 测试不同的文档位置
    const positions = [0, 5, 10, 15, 20]

    positions.forEach(pos => {
      try {
        const $pos = editorView.state.doc.resolve(pos)
        console.log(`resolve(${pos}) 结果:`, {
          depth: $pos.depth,
          pos: $pos.pos,
          parentOffset: $pos.parentOffset,
          nodeBefore: $pos.nodeBefore?.type.name,
          nodeAfter: $pos.nodeAfter?.type.name,
          parent: $pos.parent.type.name,
          // 打印每一层的节点
          nodes: Array.from({ length: $pos.depth + 1 }, (_, i) => ({
            depth: i,
            type: $pos.node(i).type.name,
            pos: i > 0 ? $pos.before(i) : 0
          }))
        })
      } catch (error) {
        console.log(`resolve(${pos}) 出错:`, error)
      }
    })
  })

  it('调试节点遍历', () => {
    // 遍历文档中的所有节点
    editorView.state.doc.descendants((node, pos) => {
      console.log('节点遍历:', {
        type: node.type.name,
        pos,
        size: node.nodeSize,
        content: node.textContent || '(无文本)',
        attrs: node.attrs
      })
    })
  })

  it('调试 DOM 坐标系统', () => {
    // 获取编辑器 DOM 节点
    const editorDOM = editorView.dom

    console.log('编辑器 DOM 信息:', {
      boundingRect: editorDOM.getBoundingClientRect(),
      offsetParent: editorDOM.offsetParent,
      scrollTop: editorDOM.scrollTop,
      scrollLeft: editorDOM.scrollLeft
    })

    // 测试 coordsAtPos（反向查询）
    const positions = [0, 5, 10]
    positions.forEach(pos => {
      try {
        const coords = editorView.coordsAtPos(pos)
        console.log(`coordsAtPos(${pos}):`, {
          left: coords.left,
          right: coords.right,
          top: coords.top,
          bottom: coords.bottom
        })
      } catch (error) {
        console.log(`coordsAtPos(${pos}) 出错:`, error)
      }
    })
  })

  it('调试节点 DOM 映射', () => {
    // 测试 domAtPos
    const positions = [0, 5, 10]

    positions.forEach(pos => {
      try {
        const domPos = editorView.domAtPos(pos)
        console.log(`domAtPos(${pos}):`, {
          node: domPos.node,
          offset: domPos.offset,
          nodeType: domPos.node.nodeType,
          nodeName: domPos.node.nodeName,
          textContent: domPos.node.textContent?.substring(0, 20)
        })
      } catch (error) {
        console.log(`domAtPos(${pos}) 出错:`, error)
      }
    })
  })
})
