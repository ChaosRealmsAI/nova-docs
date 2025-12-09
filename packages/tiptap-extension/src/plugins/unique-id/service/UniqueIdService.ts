import { UniqueID } from '@tiptap/extension-unique-id'
import type { PartialUniqueIDOptions } from '../model'
import { DEFAULT_ATTRIBUTE_NAME, DEFAULT_TYPES, DEFAULT_UPDATE_DOCUMENT } from '../model'
import { generateUniqueId } from './generator'

/**
 * UniqueID 服务
 * 封装 @tiptap/extension-unique-id，提供统一的配置和使用方式
 */
export class UniqueIdService {
  /**
   * 创建配置好的 UniqueID Extension
   *
   * @param options - 配置选项
   * @returns 配置好的 UniqueID Extension 实例
   *
   * @example
   * ```typescript
   * const uniqueIdExt = UniqueIdService.create({
   *   types: ['heading', 'paragraph'],
   *   attributeName: 'id'
   * })
   * ```
   */
  static create(options: PartialUniqueIDOptions = {}) {
    const config = {
      attributeName: options.attributeName ?? DEFAULT_ATTRIBUTE_NAME,
      types: options.types ?? DEFAULT_TYPES,
      generateID: options.generateID ?? (() => generateUniqueId()),
      filterTransaction: options.filterTransaction ?? null,
      updateDocument: options.updateDocument ?? DEFAULT_UPDATE_DOCUMENT,
    }

    return UniqueID.configure(config)
  }

  /**
   * 为 heading 节点创建 UniqueID Extension
   * 预配置的快捷方法
   *
   * @returns 配置好的 UniqueID Extension 实例
   *
   * @example
   * ```typescript
   * const headingUniqueId = UniqueIdService.forHeading()
   * ```
   */
  static forHeading() {
    return this.create({
      types: ['heading'],
      attributeName: 'id',
    })
  }

  /**
   * 为多种节点类型创建 UniqueID Extension
   *
   * @param types - 节点类型数组
   * @returns 配置好的 UniqueID Extension 实例
   *
   * @example
   * ```typescript
   * const multiTypeUniqueId = UniqueIdService.forTypes(['heading', 'paragraph', 'blockquote'])
   * ```
   */
  static forTypes(types: string[]) {
    return this.create({
      types,
      attributeName: 'id',
    })
  }
}
