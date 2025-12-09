/**
 * feat-unique-id 模块
 *
 * 为 Tiptap 编辑器节点提供唯一 ID 管理功能
 * 基于 @tiptap/extension-unique-id 官方扩展封装
 *
 * @module feat-unique-id
 *
 * @example
 * ```typescript
 * import { createUniqueIdExtension } from '@/plugins/unique-id'
 *
 * const editor = new Editor({
 *   extensions: [
 *     createUniqueIdExtension({
 *       types: ['heading', 'paragraph'],
 *       attributeName: 'id'
 *     })
 *   ]
 * })
 * ```
 *
 * @example
 * ```typescript
 * import { createHeadingUniqueIdExtension } from '@/plugins/unique-id'
 *
 * const editor = new Editor({
 *   extensions: [
 *     createHeadingUniqueIdExtension()
 *   ]
 * })
 * ```
 */

export * from './expose'
