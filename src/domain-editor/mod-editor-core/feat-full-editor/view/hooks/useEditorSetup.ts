/**
 * useEditorSetup Hook
 * 编辑器配置 Hook
 */

import type { EditorSetupOptions } from '../../model'
import { EditorConfigBuilder } from '../../service'

/**
 * 获取编辑器配置
 *
 * @param options - 配置选项
 * @returns Tiptap useEditor 的配置对象
 *
 * @example
 * ```typescript
 * import { useEditor } from '@tiptap/react'
 * import { useEditorSetup } from '@nova/domain-editor/mod-editor-core/feat-editor-setup'
 *
 * function MyEditor() {
 *   const config = useEditorSetup({ preset: 'full' })
 *   const editor = useEditor(config)
 *
 *   return <EditorContent editor={editor} />
 * }
 * ```
 */
export function useEditorSetup(options: EditorSetupOptions = {}) {
  return EditorConfigBuilder.build(options)
}
