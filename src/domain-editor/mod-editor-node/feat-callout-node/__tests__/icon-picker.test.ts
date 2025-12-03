/**
 * Phase 3: 图标选择器测试
 *
 * 测试图标选择功能
 */

import { describe, it, expect } from 'vitest'
import { getCommonIcons } from '../service/icon-manager'

describe('Phase 3: 图标选择器功能', () => {
  describe('getCommonIcons - 常用图标', () => {
    it('应该返回 16 个常用图标', () => {
      const commonIcons = getCommonIcons()
      expect(commonIcons).toHaveLength(16)
    })

    it('每个图标应包含 emoji 和 nameKey 字段', () => {
      const commonIcons = getCommonIcons()
      commonIcons.forEach((icon) => {
        expect(icon).toHaveProperty('emoji')
        expect(icon).toHaveProperty('nameKey')
        expect(typeof icon.emoji).toBe('string')
        expect(typeof icon.nameKey).toBe('string')
      })
    })

    it('应该包含主题默认图标', () => {
      const commonIcons = getCommonIcons()
      const emojis = commonIcons.map((icon) => icon.emoji)

      // 验证 8 个主题的默认图标都在常用图标中
      expect(emojis).toContain('💡') // blue
      expect(emojis).toContain('✅') // green
      expect(emojis).toContain('⚠️') // yellow
      expect(emojis).toContain('🚨') // red
      expect(emojis).toContain('🌟') // purple
      expect(emojis).toContain('📝') // gray
      expect(emojis).toContain('🔥') // orange
      expect(emojis).toContain('🎯') // cyan
    })
  })

  describe('IconItem 类型验证', () => {
    it('IconItem 应该有正确的类型结构', () => {
      const icons = getCommonIcons()
      const firstIcon = icons[0]

      expect(firstIcon).toHaveProperty('emoji')
      expect(firstIcon).toHaveProperty('nameKey')
      expect(typeof firstIcon.emoji).toBe('string')
      expect(typeof firstIcon.nameKey).toBe('string')
    })
  })
})
