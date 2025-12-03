/**
 * feat-unique-id 公共 API
 *
 * 提供节点唯一 ID 管理功能，基于 @tiptap/extension-unique-id
 */

export { createUniqueIdExtension, createHeadingUniqueIdExtension } from '../view'
export { UniqueIdService } from '../service'
export { generateUniqueId } from '../service'
export type { UniqueIDOptions, PartialUniqueIDOptions, UniqueIDGenerationContext } from '../model'
export { DEFAULT_ATTRIBUTE_NAME, DEFAULT_TYPES, DEFAULT_UPDATE_DOCUMENT } from '../model'
