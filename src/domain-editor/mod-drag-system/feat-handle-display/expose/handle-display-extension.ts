/**
 * Handle Display Extension API
 *
 * 对外导出的 TipTap Extension
 *
 * 使用示例：
 * ```typescript
 * import { HandleDisplayExtension } from '@/domain-editor/mod-editor-node/feat-handle-display'
 *
 * const editor = new Editor({
 *   extensions: [
 *     StarterKit,
 *     HandleDisplayExtension.configure({
 *       visibilityMode: 'default-hidden',
 *       offset: 50,
 *       enableHover: true
 *     })
 *   ]
 * })
 * ```
 */

import { HandleDisplay } from '../view'

export const HandleDisplayExtension = HandleDisplay
