/**
 * Full Preset
 * 完整预设 - 包含所有可用功能
 */

import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { common, createLowlight } from 'lowlight'
import { ReactNodeViewRenderer } from '@tiptap/react'
import type { AnyExtension } from '@tiptap/core'

import { createUniqueIdExtension } from '../plugins/unique-id'
import { HeadingStructureExtension } from '../nodes/heading-structure'
import { CalloutExtension } from '../nodes/callout'
import { MermaidExtension } from '../nodes/mermaid'
import { ColumnsExtension, ColumnExtension } from '../nodes/multi-column'
import { createTableExtensions } from '../nodes/table'
import { CodeBlockComponent } from '../shared/code-block'
import {
  HandleDisplayExtension,
  DRAGGABLE_NODE_TYPES
} from '../plugins/drag-handle'
import { HorizontalDragGuidelineV1Extension } from '../plugins/drag-guideline-horizontal'
import { VerticalDragGuidelineExtension } from '../plugins/drag-guideline-vertical'

// 创建 lowlight 实例
const lowlight = createLowlight(common)

/**
 * 创建完整预设
 * 包含所有可用的编辑功能
 */
export function createFullPreset(enableUniversalId = true): AnyExtension[] {
  const extensions: AnyExtension[] = [
    StarterKit.configure({
      codeBlock: false, // 使用带语法高亮的 CodeBlockLowlight
      heading: false, // 使用自定义的 HeadingStructureExtension
      dropcursor: false, // 禁用原生 dropcursor，使用自定义引导线系统
    }),
    CodeBlockLowlight.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          language: {
            default: 'javascript',
            parseHTML: (element: HTMLElement) => element.getAttribute('data-language'),
            renderHTML: (attributes: { language: string }) => ({
              'data-language': attributes.language,
              class: `language-${attributes.language}`,
            }),
          },
        }
      },
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent, {
          contentDOMElementTag: 'code',
        })
      },
    }).configure({
      lowlight,
      defaultLanguage: 'javascript',
    }),
    Placeholder.configure({
      placeholder: '输入 / 唤起命令菜单...',
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
    }),
    // 文本格式扩展
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
  ]

  // UniqueID 配置 - 为所有可拖拽节点添加 ID
  if (enableUniversalId) {
    extensions.push(
      createUniqueIdExtension({
        types: DRAGGABLE_NODE_TYPES,
      })
    )
  } else {
    extensions.push(
      createUniqueIdExtension({
        types: ['heading'],
      })
    )
  }

  // 节点扩展
  extensions.push(
    HeadingStructureExtension.configure({
      levels: [1, 2, 3, 4, 5, 6],
    }),
    ColumnsExtension,
    ColumnExtension,
    CalloutExtension,
    MermaidExtension,
    ...createTableExtensions(),
    // 任务列表
    TaskList.configure({
      HTMLAttributes: {
        class: 'task-list',
      },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: 'task-item',
      },
    })
  )

  // 拖拽系统
  extensions.push(
    HandleDisplayExtension.configure({
      visibilityMode: 'default-hidden',
      enableHover: true,
      offset: 50,
    }),
    HorizontalDragGuidelineV1Extension.configure({
      thickness: 2,
      debug: false,
    }),
    VerticalDragGuidelineExtension.configure({
      enableColumnGuideline: true,
      enableEditorBorderGuideline: true,
      columnHotzoneThreshold: 24,
      editorBorderHorizontalThreshold: 1000,
      editorBorderVerticalTolerance: 50,
      debug: false,
    })
  )

  return extensions
}
