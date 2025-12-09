import { UniqueIdService } from '../service'
import type { PartialUniqueIDOptions } from '../model'

/**
 * 创建 UniqueID Extension
 * 便捷函数，直接导出配置好的 extension
 *
 * @param options - 配置选项
 * @returns 配置好的 UniqueID Extension
 *
 * @example
 * ```typescript
 * import { createUniqueIdExtension } from './feat-unique-id'
 *
 * const editor = new Editor({
 *   extensions: [
 *     createUniqueIdExtension({ types: ['heading'] })
 *   ]
 * })
 * ```
 */
export function createUniqueIdExtension(options?: PartialUniqueIDOptions) {
  return UniqueIdService.create(options)
}

/**
 * 创建用于 Heading 的 UniqueID Extension
 * 预配置的快捷函数
 *
 * @returns 配置好的 UniqueID Extension
 *
 * @example
 * ```typescript
 * import { createHeadingUniqueIdExtension } from './feat-unique-id'
 *
 * const editor = new Editor({
 *   extensions: [
 *     createHeadingUniqueIdExtension()
 *   ]
 * })
 * ```
 */
export function createHeadingUniqueIdExtension() {
  return UniqueIdService.forHeading()
}
