/**
 * Basic Preset
 * 基础预设 - 最小化配置
 */

import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { AnyExtension } from '@tiptap/core'

import { createUniqueIdExtension } from '../plugins/unique-id'
import { HeadingStructureExtension } from '../nodes/heading-structure'

/**
 * 创建基础预设
 * 只包含必要的编辑功能
 */
export function createBasicPreset(enableUniversalId = false): AnyExtension[] {
  const extensions: AnyExtension[] = [
    StarterKit.configure({
      heading: false, // 使用自定义的 HeadingStructureExtension
      dropcursor: false,
    }),
    Placeholder.configure({
      placeholder: '输入 / 唤起命令菜单...',
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
    }),
  ]

  // UniqueID 配置
  if (enableUniversalId) {
    extensions.push(
      createUniqueIdExtension({
        types: ['heading', 'paragraph'],
      })
    )
  } else {
    extensions.push(
      createUniqueIdExtension({
        types: ['heading'],
      })
    )
  }

  // Heading 扩展
  extensions.push(
    HeadingStructureExtension.configure({
      levels: [1, 2, 3, 4, 5, 6],
    })
  )

  return extensions
}
