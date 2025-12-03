/**
 * Phase 4: 颜色选择器测试
 *
 * 测试颜色预设、自定义颜色功能
 */

import { describe, it, expect } from 'vitest'
import { getPresetColors, isValidHexColor } from '../service/color-manager'

describe('Phase 4: 颜色选择器功能', () => {
  describe('getPresetColors - 预设颜色', () => {
    it('应该返回 8 个预设颜色', () => {
      const presetColors = getPresetColors()
      expect(presetColors).toHaveLength(8)
    })

    it('每个预设颜色应包含 theme、nameKey 字段', () => {
      const presetColors = getPresetColors()
      presetColors.forEach((color) => {
        expect(color).toHaveProperty('theme')
        expect(color).toHaveProperty('nameKey')
        expect(typeof color.theme).toBe('string')
        expect(typeof color.nameKey).toBe('string')
      })
    })

    it('应该包含所有 8 个主题颜色', () => {
      const presetColors = getPresetColors()
      const themes = presetColors.map((color) => color.theme)

      expect(themes).toContain('blue')
      expect(themes).toContain('green')
      expect(themes).toContain('yellow')
      expect(themes).toContain('red')
      expect(themes).toContain('purple')
      expect(themes).toContain('gray')
      expect(themes).toContain('orange')
      expect(themes).toContain('cyan')
    })

    it('预设颜色顺序应该固定', () => {
      const presetColors = getPresetColors()
      expect(presetColors[0].theme).toBe('blue')
      expect(presetColors[1].theme).toBe('green')
      expect(presetColors[2].theme).toBe('yellow')
      expect(presetColors[3].theme).toBe('red')
    })
  })

  describe('isValidHexColor - 颜色验证', () => {
    it('应该接受标准 6 位十六进制颜色', () => {
      expect(isValidHexColor('#ff0000')).toBe(true)
      expect(isValidHexColor('#00FF00')).toBe(true)
      expect(isValidHexColor('#0000ff')).toBe(true)
      expect(isValidHexColor('#abc123')).toBe(true)
    })

    it('应该接受 3 位十六进制颜色', () => {
      expect(isValidHexColor('#fff')).toBe(true)
      expect(isValidHexColor('#000')).toBe(true)
      expect(isValidHexColor('#F0F')).toBe(true)
    })

    it('应该拒绝无效格式', () => {
      expect(isValidHexColor('ff0000')).toBe(false) // 缺少 #
      expect(isValidHexColor('#ff00')).toBe(false) // 长度错误
      expect(isValidHexColor('#ff00001')).toBe(false) // 长度错误
      expect(isValidHexColor('#gggggg')).toBe(false) // 非十六进制字符
      expect(isValidHexColor('')).toBe(false) // 空字符串
      expect(isValidHexColor('#')).toBe(false) // 只有 #
    })

    it('应该拒绝非字符串值', () => {
      expect(isValidHexColor(null as unknown as string)).toBe(false)
      expect(isValidHexColor(undefined as unknown as string)).toBe(false)
      expect(isValidHexColor(123 as unknown as string)).toBe(false)
    })
  })

  describe('ColorPreset 类型验证', () => {
    it('ColorPreset 应该有正确的类型结构', () => {
      const presetColors = getPresetColors()
      const firstColor = presetColors[0]

      expect(firstColor).toHaveProperty('theme')
      expect(firstColor).toHaveProperty('nameKey')
      expect(firstColor).toHaveProperty('bgColor')
      expect(firstColor).toHaveProperty('borderColor')

      expect(typeof firstColor.bgColor).toBe('string')
      expect(typeof firstColor.borderColor).toBe('string')
    })
  })
})
