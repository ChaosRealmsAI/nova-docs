import { describe, it, expect } from 'vitest'
import { generateUniqueId } from '../../service/generator'

describe('generateUniqueId', () => {
  it('should generate a unique ID', () => {
    const id = generateUniqueId()
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('should generate different IDs on multiple calls', () => {
    const id1 = generateUniqueId()
    const id2 = generateUniqueId()
    const id3 = generateUniqueId()

    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(id1).not.toBe(id3)
  })

  it('should generate valid UUID format if crypto.randomUUID is available', () => {
    const id = generateUniqueId()

    // UUID v4 格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // 或降级格式: node-{timestamp}-{random}
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const fallbackPattern = /^node-[a-z0-9]+-[a-z0-9]+$/i

    const isValidUUID = uuidPattern.test(id)
    const isValidFallback = fallbackPattern.test(id)

    expect(isValidUUID || isValidFallback).toBe(true)
  })
})
