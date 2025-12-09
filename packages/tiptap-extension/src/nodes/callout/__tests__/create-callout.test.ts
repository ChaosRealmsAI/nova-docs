/**
 * 场景1：创建 Callout Block
 *
 * 测试创建 Callout 的基本功能：
 * 1. 创建默认 Callout（蓝色主题 + 💡图标）
 * 2. 创建指定主题的 Callout
 * 3. 验证 8 种颜色主题
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { CalloutExtension } from '../expose'

describe('场景1：创建 Callout Block', () => {
  let editor: Editor

  beforeEach(() => {
    editor = new Editor({
      extensions: [
        StarterKit,
        CalloutExtension,
      ],
      content: '<p></p>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('创建默认 Callout（蓝色主题 + 💡图标）', () => {
    // 使用 insertCallout 命令
    editor.commands.insertCallout()

    const json = editor.getJSON()
    const callout = json.content?.[0]

    // 验证节点类型
    expect(callout?.type).toBe('callout')

    // 验证默认属性
    expect(callout?.attrs?.theme).toBe('blue')
    expect(callout?.attrs?.emoji).toBe('💡')
  })

  it('创建指定主题的 Callout（绿色 + ✅）', () => {
    editor.commands.insertCallout({
      theme: 'green',
      emoji: '✅'
    })

    const json = editor.getJSON()
    const callout = json.content?.[0]

    expect(callout?.type).toBe('callout')
    expect(callout?.attrs?.theme).toBe('green')
    expect(callout?.attrs?.emoji).toBe('✅')
  })

  it('支持 8 种颜色主题', () => {
    const themes: any[] = ['blue', 'green', 'yellow', 'red', 'purple', 'gray', 'orange', 'cyan']
    const emojis = ['💡', '✅', '⚠️', '🚨', '🌟', '📝', '🔥', '🎯']

    themes.forEach((theme, index) => {
      // 清空内容
      editor.commands.setContent('<p></p>')

      // 插入对应主题的 Callout
      editor.commands.insertCallout({
        theme,
        emoji: emojis[index]
      })

      const json = editor.getJSON()
      const callout = json.content?.[0]

      expect(callout?.type).toBe('callout')
      expect(callout?.attrs?.theme).toBe(theme)
      expect(callout?.attrs?.emoji).toBe(emojis[index])
    })
  })

  it('Callout 包含初始段落内容', () => {
    editor.commands.insertContent({
      type: 'callout',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '这是内容' }]
        }
      ]
    })

    const json = editor.getJSON()
    const callout = json.content?.[0]

    expect(callout?.type).toBe('callout')
    expect(callout?.content).toBeDefined()
    expect(callout?.content?.[0]?.type).toBe('paragraph')
    expect(callout?.content?.[0]?.content?.[0]?.text).toBe('这是内容')
  })

  it('创建空 Callout 时自动添加空段落', () => {
    editor.commands.insertCallout()

    const json = editor.getJSON()
    const callout = json.content?.[0]

    // 应该包含一个空段落
    expect(callout?.content).toBeDefined()
    expect(callout?.content?.length).toBeGreaterThan(0)
    expect(callout?.content?.[0]?.type).toBe('paragraph')
  })
})
