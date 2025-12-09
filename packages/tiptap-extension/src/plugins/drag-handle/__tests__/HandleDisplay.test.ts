/**
 * Handle Display Tests
 *
 * 句柄展示功能的单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { NodeMatcher } from '../service/NodeMatcher'
import { DRAGGABLE_NODE_TYPES, DRAGGABLE_NODE_PATHS } from '../model/constants'

describe('HandleDisplay', () => {
  describe('NodeMatcher', () => {
    let nodeMatcher: NodeMatcher

    beforeEach(() => {
      nodeMatcher = new NodeMatcher()
    })

    it('should identify draggable node types', () => {
      const mockNode = {
        type: { name: 'paragraph' },
        attrs: { id: 'test-node' }
      } as any

      const result = nodeMatcher.isDraggable(mockNode, 0, 'doc > paragraph')
      expect(result).toBe(true)
    })

    it('should reject non-draggable node types', () => {
      const mockNode = {
        type: { name: 'text' },
        attrs: {}
      } as any

      const result = nodeMatcher.isDraggable(mockNode, 0, 'doc > text')
      expect(result).toBe(false)
    })

    it('should generate node ID from attrs.id', () => {
      const mockNode = {
        type: { name: 'paragraph' },
        attrs: { id: 'custom-id' }
      } as any

      const nodeId = nodeMatcher.getNodeId(mockNode, 10)
      expect(nodeId).toBe('custom-id')
    })

    it('should generate node ID from position if no attrs.id', () => {
      const mockNode = {
        type: { name: 'paragraph' },
        attrs: {}
      } as any

      const nodeId = nodeMatcher.getNodeId(mockNode, 42)
      expect(nodeId).toBe('node-42')
    })

    it('should support custom draggable types', () => {
      const customMatcher = new NodeMatcher(['customNode'])

      const mockNode = {
        type: { name: 'customNode' },
        attrs: {}
      } as any

      const result = customMatcher.isDraggable(mockNode, 0, 'doc > customNode')
      expect(result).toBe(true)
    })

    it('should support custom path whitelist', () => {
      const customMatcher = new NodeMatcher([], ['doc > specialContainer > paragraph'])

      const mockNode = {
        type: { name: 'paragraph' },
        attrs: {}
      } as any

      const allowed = customMatcher.isDraggable(mockNode, 0, 'doc > specialContainer > paragraph')
      const disallowed = customMatcher.isDraggable(mockNode, 0, 'doc > paragraph')

      expect(allowed).toBe(true)
      expect(disallowed).toBe(false)
    })
  })

  describe('Constants', () => {
    it('should export DRAGGABLE_NODE_TYPES', () => {
      expect(DRAGGABLE_NODE_TYPES).toBeDefined()
      expect(Array.isArray(DRAGGABLE_NODE_TYPES)).toBe(true)
      expect(DRAGGABLE_NODE_TYPES.length).toBeGreaterThan(0)
    })

    it('should include common node types', () => {
      expect(DRAGGABLE_NODE_TYPES).toContain('paragraph')
      expect(DRAGGABLE_NODE_TYPES).toContain('heading')
      expect(DRAGGABLE_NODE_TYPES).toContain('callout')
    })

    it('should export path whitelist', () => {
      expect(DRAGGABLE_NODE_PATHS).toBeDefined()
      expect(Array.isArray(DRAGGABLE_NODE_PATHS)).toBe(true)
      expect(DRAGGABLE_NODE_PATHS).toContain('doc > paragraph')
    })
  })
})
