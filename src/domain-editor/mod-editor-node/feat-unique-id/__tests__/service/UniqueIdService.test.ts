import { describe, it, expect } from 'vitest'
import { UniqueIdService } from '../../service/UniqueIdService'

describe('UniqueIdService', () => {
  describe('create', () => {
    it('should create a UniqueID extension with default options', () => {
      const extension = UniqueIdService.create()
      expect(extension).toBeDefined()
      expect(extension.name).toBe('uniqueID')
    })

    it('should create a UniqueID extension with custom options', () => {
      const extension = UniqueIdService.create({
        types: ['heading', 'paragraph'],
        attributeName: 'nodeId',
      })
      expect(extension).toBeDefined()
      expect(extension.name).toBe('uniqueID')
      expect(extension.options.types).toEqual(['heading', 'paragraph'])
      expect(extension.options.attributeName).toBe('nodeId')
    })
  })

  describe('forHeading', () => {
    it('should create a UniqueID extension for heading nodes', () => {
      const extension = UniqueIdService.forHeading()
      expect(extension).toBeDefined()
      expect(extension.name).toBe('uniqueID')
      expect(extension.options.types).toEqual(['heading'])
      expect(extension.options.attributeName).toBe('id')
    })
  })

  describe('forTypes', () => {
    it('should create a UniqueID extension for specified node types', () => {
      const types = ['heading', 'paragraph', 'blockquote']
      const extension = UniqueIdService.forTypes(types)
      expect(extension).toBeDefined()
      expect(extension.name).toBe('uniqueID')
      expect(extension.options.types).toEqual(types)
      expect(extension.options.attributeName).toBe('id')
    })
  })
})
