import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'

/**
 * UniqueID 生成上下文
 */
export interface UniqueIDGenerationContext {
  /** ProseMirror 节点 */
  node: ProseMirrorNode
  /** 节点在文档中的位置 */
  pos: number
}

/**
 * UniqueID 配置选项
 */
export interface UniqueIDOptions {
  /**
   * 属性名称（会自动添加 data- 前缀）
   * @default "id"
   */
  attributeName: string

  /**
   * 需要添加唯一 ID 的节点类型列表
   * @default []
   * @example ['heading', 'paragraph', 'blockquote']
   */
  types: string[]

  /**
   * 自定义 ID 生成函数
   * @default () => crypto.randomUUID()
   */
  generateID: (ctx: UniqueIDGenerationContext) => string

  /**
   * 过滤某些事务，例如协作编辑中来自其他用户的事务
   * @default null
   */
  filterTransaction: ((transaction: Transaction) => boolean) | null

  /**
   * 是否更新文档以添加唯一 ID
   * 如果文档是只读模式或不可变的，设置为 false
   * @default true
   */
  updateDocument: boolean
}

/**
 * 部分 UniqueID 配置选项（用于配置函数）
 */
export type PartialUniqueIDOptions = Partial<UniqueIDOptions>
