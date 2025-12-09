/**
 * 场景6：内部嵌套节点支持
 *
 * 测试 Callout 内部可以包含多种节点类型
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { CalloutExtension } from '../expose'

describe('场景6：内部嵌套节点', () => {
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

  it('Callout 内部支持标题节点', () => {
    editor.commands.insertContent({
      type: 'callout',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '这是标题' }]
        }
      ]
    })

    const json = editor.getJSON()
    const callout = json.content?.[0]

    expect(callout?.type).toBe('callout')
    expect(callout?.content?.[0]?.type).toBe('heading')
    expect(callout?.content?.[0]?.attrs?.level).toBe(2)
    expect(callout?.content?.[0]?.content?.[0]?.text).toBe('这是标题')
  })

  it('Callout 内部支持段落和富文本', () => {
    editor.commands.insertContent({
      type: 'callout',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '这是' },
            { type: 'text', marks: [{ type: 'bold' }], text: '粗体' },
            { type: 'text', text: '和' },
            { type: 'text', marks: [{ type: 'italic' }], text: '斜体' },
          ]
        }
      ]
    })

    const json = editor.getJSON()
    const callout = json.content?.[0]
    const paragraph = callout?.content?.[0]

    expect(paragraph?.type).toBe('paragraph')
    expect(paragraph?.content).toHaveLength(4)
    expect(paragraph?.content?.[1]?.marks?.[0]?.type).toBe('bold')
    expect(paragraph?.content?.[3]?.marks?.[0]?.type).toBe('italic')
  })

  it('Callout 内部支持无序列表', () => {
    editor.commands.insertContent({
      type: 'callout',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '项目1' }] }
              ]
            },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '项目2' }] }
              ]
            }
          ]
        }
      ]
    })

    const json = editor.getJSON()
    const callout = json.content?.[0]

    expect(callout?.content?.[0]?.type).toBe('bulletList')
    expect(callout?.content?.[0]?.content).toHaveLength(2)
  })

  it('Callout 内部支持有序列表', () => {
    editor.commands.insertContent({
      type: 'callout',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '第一步' }] }
              ]
            },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '第二步' }] }
              ]
            }
          ]
        }
      ]
    })

    const json = editor.getJSON()
    const callout = json.content?.[0]

    expect(callout?.content?.[0]?.type).toBe('orderedList')
    expect(callout?.content?.[0]?.content).toHaveLength(2)
  })

  // 注意：待办列表需要 TaskList 和 TaskItem 扩展
  // 这里暂时跳过，因为 StarterKit 不包含这些扩展
  it.skip('Callout 内部支持待办列表（需要额外扩展）', () => {
    // 需要安装 @tiptap/extension-task-list 和 @tiptap/extension-task-item
  })

  it('Callout 内部支持引用块', () => {
    editor.commands.insertContent({
      type: 'callout',
      content: [
        {
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: '这是引用内容' }] }
          ]
        }
      ]
    })

    const json = editor.getJSON()
    const callout = json.content?.[0]

    expect(callout?.content?.[0]?.type).toBe('blockquote')
    expect(callout?.content?.[0]?.content?.[0]?.content?.[0]?.text).toBe('这是引用内容')
  })

  it('Callout 内部支持代码块', () => {
    editor.commands.insertContent({
      type: 'callout',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'javascript' },
          content: [
            { type: 'text', text: 'console.log("Hello");' }
          ]
        }
      ]
    })

    const json = editor.getJSON()
    const callout = json.content?.[0]

    expect(callout?.content?.[0]?.type).toBe('codeBlock')
    expect(callout?.content?.[0]?.attrs?.language).toBe('javascript')
    expect(callout?.content?.[0]?.content?.[0]?.text).toBe('console.log("Hello");')
  })

  it('Callout 内部支持水平分割线', () => {
    editor.commands.insertContent({
      type: 'callout',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '上方内容' }] },
        { type: 'horizontalRule' },
        { type: 'paragraph', content: [{ type: 'text', text: '下方内容' }] }
      ]
    })

    const json = editor.getJSON()
    const callout = json.content?.[0]

    expect(callout?.content).toHaveLength(3)
    expect(callout?.content?.[0]?.type).toBe('paragraph')
    expect(callout?.content?.[1]?.type).toBe('horizontalRule')
    expect(callout?.content?.[2]?.type).toBe('paragraph')
  })

  it('Callout 内部支持混合多种节点类型', () => {
    editor.commands.insertContent({
      type: 'callout',
      attrs: { theme: 'blue', emoji: '📦' },
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: '功能清单' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '本功能包含：' }]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '标题支持' }] }
              ]
            },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '列表支持' }] }
              ]
            }
          ]
        },
        {
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: '提示：可自由组合' }] }
          ]
        }
      ]
    })

    const json = editor.getJSON()
    const callout = json.content?.[0]

    expect(callout?.type).toBe('callout')
    expect(callout?.content).toHaveLength(4)
    expect(callout?.content?.[0]?.type).toBe('heading')
    expect(callout?.content?.[1]?.type).toBe('paragraph')
    expect(callout?.content?.[2]?.type).toBe('bulletList')
    expect(callout?.content?.[3]?.type).toBe('blockquote')
  })
})
