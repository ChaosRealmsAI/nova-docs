/**
 * Editor Presets
 * 编辑器预设配置
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

import { createUniqueIdExtension } from '@nova/domain-editor/mod-editor-node/feat-unique-id'
import { HeadingStructureExtension } from '@nova/domain-editor/mod-editor-node/feat-heading-structure'
import { CalloutExtension } from '@nova/domain-editor/mod-editor-node/feat-callout-node'
import { MermaidExtension } from '@nova/domain-editor/mod-editor-node/feat-mermaid-node'
import { ColumnsExtension, ColumnExtension } from '@nova/domain-editor/mod-editor-node/feat-multi-column-node'
import { createTableExtensions } from '@nova/domain-editor/mod-editor-node/feat-table-node'
import { CodeBlockComponent } from '@nova/domain-editor/shared/ui/code-block'
import {
  HandleDisplayExtension,
  DRAGGABLE_NODE_TYPES
} from '@nova/domain-editor/mod-drag-system/feat-handle-display'
import { HorizontalDragGuidelineV1Extension } from '@nova/domain-editor/mod-drag-system/feat-drag-guideline-horizontal'
import { VerticalDragGuidelineExtension } from '@nova/domain-editor/mod-drag-system/feat-drag-guideline-vertical'

// 创建 lowlight 实例（共享）
const lowlight = createLowlight(common)

/**
 * 基础预设
 * 最小化配置，只包含必要的编辑功能
 */
export function createBasicPreset(enableUniversalId = false): AnyExtension[] {
  const extensions: AnyExtension[] = [
    StarterKit.configure({
      heading: false, // 使用自定义的 HeadingStructureExtension
      dropcursor: false, // 禁用原生 dropcursor，使用自定义引导线系统
    }),
    Placeholder.configure({
      placeholder: '开始输入...',
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

/**
 * 完整预设
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
      placeholder: '开始输入...',
    }),
    // 文本格式扩展（用于选中工具栏）
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true, // 支持多种高亮颜色
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
      nested: true, // 支持嵌套任务
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

/**
 * 演示预设
 * 用于功能演示页面的简化配置
 */
export function createDemoPreset(): AnyExtension[] {
  return [
    StarterKit.configure({
      heading: false,
      dropcursor: false, // 禁用原生 dropcursor
    }),
    createUniqueIdExtension({
      types: ['heading'],
    }),
    HeadingStructureExtension.configure({
      levels: [1, 2, 3, 4, 5, 6],
    }),
  ]
}
