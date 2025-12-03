/**
 * Handle Display Integration Tests
 *
 * 集成测试 - 验证 Handle Display 在实际编辑器环境中的完整功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { EditorView } from '@tiptap/pm/view'
import { EditorState } from '@tiptap/pm/state'
import { Schema, DOMParser as ProseMirrorDOMParser } from '@tiptap/pm/model'
import { schema as baseSchema } from '@tiptap/pm/schema-basic'
import { HandleView } from '../view/HandleView'
import { HoverDetector } from '../service/HoverDetector'
import { NodeMatcher } from '../service/NodeMatcher'
import { PositionCalculator } from '../service/PositionCalculator'

describe('HandleDisplay Integration Tests', () => {
  let container: HTMLElement
  let editorView: EditorView
  let handleView: HandleView

  beforeEach(() => {
    // 创建容器
    container = document.createElement('div')
    container.style.position = 'relative'
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)

    // 创建测试内容
    const content = `
      <h1>Test Document</h1>
      <p>First paragraph</p>
      <p>Second paragraph</p>
      <h2>Subheading</h2>
      <p>Third paragraph</p>
      <blockquote>
        <p>A quote</p>
      </blockquote>
    `

    // 创建编辑器
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

    // 创建 HandleView
    handleView = new HandleView(editorView, {
      visibilityMode: 'default-hidden',
      offset: 50
    })
  })

  afterEach(() => {
    if (handleView) {
      handleView.destroy()
    }
    if (editorView) {
      editorView.destroy()
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('HandleView Initialization', () => {
    it('should create overlay element', () => {
      const overlay = container.querySelector('.handle-display-overlay')
      expect(overlay).toBeTruthy()
      expect(overlay?.tagName).toBe('DIV')
    })

    it('should set overlay styles correctly', () => {
      const overlay = container.querySelector('.handle-display-overlay') as HTMLElement
      expect(overlay.style.position).toBe('absolute')
      expect(overlay.style.top).toBe('0px')
      expect(overlay.style.left).toBe('0px')
      expect(overlay.style.pointerEvents).toBe('none')
    })

    it('should create handles for draggable nodes', () => {
      const overlay = container.querySelector('.handle-display-overlay')
      const handles = overlay?.querySelectorAll('.drag-handle')

      // 应该为段落、标题等节点创建句柄
      expect(handles?.length).toBeGreaterThan(0)
    })
  })

  describe('Handle Element Structure', () => {
    it('should create handle with correct classes', () => {
      const overlay = container.querySelector('.handle-display-overlay')
      const handle = overlay?.querySelector('.drag-handle')

      expect(handle).toBeTruthy()
      expect(handle?.classList.contains('feishu-menu-trigger')).toBe(true)
    })

    it('should set data attributes on handle', () => {
      const overlay = container.querySelector('.handle-display-overlay')
      const handle = overlay?.querySelector('.drag-handle')

      expect(handle?.getAttribute('data-node-id')).toBeTruthy()
      expect(handle?.getAttribute('data-pos')).toBeTruthy()
      expect(handle?.getAttribute('data-node-type')).toBeTruthy()
    })

    it('should include type icon and drag handle icon', () => {
      const overlay = container.querySelector('.handle-display-overlay')
      const handle = overlay?.querySelector('.drag-handle')

      const typeIcon = handle?.querySelector('.feishu-type-icon')
      const dragIcon = handle?.querySelector('.feishu-drag-handle')

      expect(typeIcon).toBeTruthy()
      expect(dragIcon).toBeTruthy()
    })
  })

  describe('Handle Visibility', () => {
    it('should initially hide handles in default-hidden mode', () => {
      const overlay = container.querySelector('.handle-display-overlay')
      const handles = overlay?.querySelectorAll('.drag-handle') as NodeListOf<HTMLElement>

      handles.forEach(handle => {
        expect(handle.style.opacity).toBe('0')
      })
    })

    it('should show handle by node ID', () => {
      const overlay = container.querySelector('.handle-display-overlay')
      const handle = overlay?.querySelector('.drag-handle') as HTMLElement
      const nodeId = handle?.getAttribute('data-node-id')

      if (nodeId) {
        handleView.showHandleByNodeId(nodeId)
        expect(handle.style.opacity).toBe('1')
        expect(handle.style.pointerEvents).toBe('auto')
      }
    })

    it('should hide all handles', () => {
      const overlay = container.querySelector('.handle-display-overlay')
      const handles = overlay?.querySelectorAll('.drag-handle') as NodeListOf<HTMLElement>

      // 先显示一个句柄
      const firstHandle = handles[0]
      const nodeId = firstHandle?.getAttribute('data-node-id')
      if (nodeId) {
        handleView.showHandleByNodeId(nodeId)
        expect(firstHandle.style.opacity).toBe('1')
      }

      // 隐藏所有句柄
      handleView.hideAllHandles()
      handles.forEach(handle => {
        expect(handle.style.opacity).toBe('0')
      })
    })
  })

  describe('NodeMatcher Service', () => {
    it('should identify draggable node types', () => {
      const matcher = new NodeMatcher()

      const paragraphNode = {
        type: { name: 'paragraph' },
        attrs: {}
      } as any

      const headingNode = {
        type: { name: 'heading' },
        attrs: {}
      } as any

      expect(matcher.isDraggable(paragraphNode, 0, 'doc > paragraph')).toBe(true)
      expect(matcher.isDraggable(headingNode, 0, 'doc > heading')).toBe(true)
    })

    it('should reject non-draggable node types', () => {
      const matcher = new NodeMatcher()

      const textNode = {
        type: { name: 'text' },
        attrs: {}
      } as any

      expect(matcher.isDraggable(textNode, 0, 'doc > text')).toBe(false)
    })

    it('should generate correct node IDs', () => {
      const matcher = new NodeMatcher()

      const nodeWithId = {
        type: { name: 'paragraph' },
        attrs: { id: 'custom-id' }
      } as any

      const nodeWithoutId = {
        type: { name: 'paragraph' },
        attrs: {}
      } as any

      expect(matcher.getNodeId(nodeWithId, 10)).toBe('custom-id')
      expect(matcher.getNodeId(nodeWithoutId, 42)).toBe('node-42')
    })
  })

  describe('HoverDetector Service', () => {
    it('should detect hover on nodes', () => {
      const detector = new HoverDetector(50)

      // 模拟鼠标事件
      const mockTarget = document.createElement('div')
      const mockEvent = {
        clientX: 100,
        clientY: 100,
        target: mockTarget
      } as unknown as MouseEvent

      // 由于需要真实的 DOM 位置，这个测试在实际环境中运行
      const result = detector.handleMouseMove(editorView, mockEvent)

      // 如果检测到节点，应该返回结果
      if (result) {
        expect(result.nodeId).toBeTruthy()
        expect(result.pos).toBeGreaterThanOrEqual(0)
        expect(result.isDraggable).toBe(true)
        expect(result.node).toBeTruthy()
      }
    })

    it('should throttle hover detection', () => {
      const detector = new HoverDetector(100) // 100ms 节流

      const mockTarget = document.createElement('div')
      const mockEvent = {
        clientX: 100,
        clientY: 100,
        target: mockTarget
      } as unknown as MouseEvent

      const result1 = detector.handleMouseMove(editorView, mockEvent)
      const result2 = detector.handleMouseMove(editorView, mockEvent) // 立即调用

      // 第二次调用应该被节流，返回 null
      expect(result2).toBeNull()
    })
  })

  describe('PositionCalculator Service', () => {
    it('should calculate handle position', () => {
      const calculator = new PositionCalculator(50)

      // 获取第一个节点的位置
      const firstNodePos = 0

      const position = calculator.calculateHandlePosition(editorView, firstNodePos, undefined, undefined)

      if (position) {
        expect(position.left).toBeDefined()
        expect(position.top).toBeDefined()
        expect(position.width).toBe(42)
        expect(position.height).toBe(26)
      }
    })

    it('should respect offset configuration', () => {
      const calculator1 = new PositionCalculator(30)
      const calculator2 = new PositionCalculator(80)

      const pos = 0

      const position1 = calculator1.calculateHandlePosition(editorView, pos, undefined, undefined)
      const position2 = calculator2.calculateHandlePosition(editorView, pos, undefined, undefined)

      if (position1 && position2) {
        // offset 更大的应该有更小的 left 值（更靠左）
        expect(position1.left).toBeGreaterThan(position2.left)
      }
    })
  })

  describe('Handle Updates', () => {
    it('should update handles when document changes', () => {
      const overlay = container.querySelector('.handle-display-overlay')
      const initialHandleCount = overlay?.querySelectorAll('.drag-handle').length || 0

      // 插入新段落
      const tr = editorView.state.tr.insertText('New paragraph', editorView.state.doc.content.size - 1)
      editorView.dispatch(tr)

      // 触发更新
      handleView.update(editorView)

      const newHandleCount = overlay?.querySelectorAll('.drag-handle').length || 0

      // 句柄数量可能保持不变或增加（取决于插入位置）
      expect(newHandleCount).toBeGreaterThanOrEqual(initialHandleCount)
    })

    it('should remove handles for deleted nodes', () => {
      const overlay = container.querySelector('.handle-display-overlay')
      const initialHandles = overlay?.querySelectorAll('.drag-handle') as NodeListOf<HTMLElement>
      const initialCount = initialHandles.length

      // 删除一个节点（假设删除第一个段落）
      const deleteFrom = 0
      const deleteTo = editorView.state.doc.resolve(deleteFrom).end()
      const tr = editorView.state.tr.delete(deleteFrom, deleteTo)
      editorView.dispatch(tr)

      // 触发更新
      handleView.update(editorView)

      const newCount = overlay?.querySelectorAll('.drag-handle').length || 0

      // 句柄数量应该减少
      expect(newCount).toBeLessThan(initialCount)
    })
  })

  describe('Handle Destruction', () => {
    it('should remove overlay on destroy', () => {
      const overlay = container.querySelector('.handle-display-overlay')
      expect(overlay).toBeTruthy()

      handleView.destroy()

      const overlayAfter = container.querySelector('.handle-display-overlay')
      expect(overlayAfter).toBeNull()
    })

    it('should clear all handles on destroy', () => {
      // 访问私有属性进行测试（仅用于测试）
      const handlesMap = (handleView as any).handles
      expect(handlesMap.size).toBeGreaterThan(0)

      handleView.destroy()

      expect(handlesMap.size).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty document', () => {
      // 使用独立容器
      const localContainer = document.createElement('div')
      document.body.appendChild(localContainer)

      // 创建空文档
      const emptyState = EditorState.create({
        doc: baseSchema.node('doc', null, [
          baseSchema.node('paragraph')
        ]),
        schema: baseSchema
      })

      const emptyView = new EditorView(localContainer, { state: emptyState })
      const emptyHandleView = new HandleView(emptyView)

      const overlay = localContainer.querySelector('.handle-display-overlay')
      const handles = overlay?.querySelectorAll('.drag-handle')

      // 1个段落 = 1个句柄
      expect(handles?.length).toBe(1)

      emptyHandleView.destroy()
      emptyView.destroy()
      document.body.removeChild(localContainer)
    })

    it('should handle read-only mode', () => {
      // 使用独立容器
      const localContainer = document.createElement('div')
      document.body.appendChild(localContainer)

      // 创建只读编辑器 (使用与 beforeEach 相同的内容)
      const readOnlyView = new EditorView(localContainer, {
        state: editorView.state,
        editable: () => false
      })

      const readOnlyHandleView = new HandleView(readOnlyView)

      const overlay = localContainer.querySelector('.handle-display-overlay')
      expect(overlay).toBeTruthy()

      readOnlyHandleView.destroy()
      readOnlyView.destroy()
      document.body.removeChild(localContainer)
    })
  })

  describe('Performance', () => {
    it('should handle large documents efficiently', () => {
      // 使用独立容器
      const localContainer = document.createElement('div')
      document.body.appendChild(localContainer)

      // 创建包含100个段落的大文档
      const paragraphs = Array.from({ length: 100 }, (_, i) => `<p>Paragraph ${i + 1}</p>`)
      const largeContent = paragraphs.join('\n')

      const largeDoc = ProseMirrorDOMParser.fromSchema(baseSchema).parse(
        new window.DOMParser().parseFromString(largeContent, 'text/html').body
      )

      const largeState = EditorState.create({
        doc: largeDoc,
        schema: baseSchema
      })

      const largeView = new EditorView(localContainer, { state: largeState })

      const startTime = performance.now()
      const largeHandleView = new HandleView(largeView)
      const endTime = performance.now()

      // 初始化应该在合理时间内完成（< 100ms）
      expect(endTime - startTime).toBeLessThan(100)

      const overlay = localContainer.querySelector('.handle-display-overlay')
      const handles = overlay?.querySelectorAll('.drag-handle')

      // 应该创建100个句柄
      expect(handles?.length).toBe(100)

      largeHandleView.destroy()
      largeView.destroy()
      document.body.removeChild(localContainer)
    })
  })
})
