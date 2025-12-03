/**
 * Callout Extension
 *
 * 对外导出的 TipTap Extension
 */

import { CalloutNode } from '../view'

/**
 * Callout Extension
 *
 * 使用示例：
 * ```typescript
 * import { CalloutExtension } from '@/domain-editor/mod-editor-node/feat-callout-node'
 *
 * const editor = new Editor({
 *   extensions: [
 *     StarterKit,
 *     CalloutExtension,
 *   ]
 * })
 *
 * // 插入 Callout
 * editor.commands.insertCallout({ theme: 'blue', emoji: '💡' })
 *
 * // 更新属性
 * editor.commands.updateCalloutAttrs({ theme: 'green', emoji: '✅' })
 * ```
 */
export const CalloutExtension = CalloutNode
