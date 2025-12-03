/**
 * feat-full-editor 模块
 *
 * 开箱即用的完整编辑器
 * 集成所有核心功能：拖拽、多列、折叠、代码高亮等
 *
 * @module feat-full-editor
 *
 * @example
 * ```typescript
 * import { useEditor } from '@tiptap/react'
 * import { useEditorSetup } from '@nova/domain-editor/mod-editor-core/feat-full-editor'
 *
 * function MyEditor() {
 *   const config = useEditorSetup({
 *     content: '<h1>开始编辑</h1>'
 *   })
 *   const editor = useEditor(config)
 *
 *   return <EditorContent editor={editor} />
 * }
 * ```
 */

// 导入所有必需的样式
import './style/index.css'

export * from './expose'
