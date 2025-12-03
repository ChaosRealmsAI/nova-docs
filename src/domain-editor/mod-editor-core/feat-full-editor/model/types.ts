/**
 * Editor Setup Types
 * 编辑器配置类型定义
 */

import type { AnyExtension } from '@tiptap/core'
import type { EditorOptions } from '@tiptap/react'

/**
 * 编辑器预设类型
 */
export type EditorPreset = 'basic' | 'full' | 'demo'

/**
 * 编辑器配置选项
 */
export interface EditorSetupOptions {
  /**
   * 使用的预设配置
   * @default 'full'
   */
  preset?: EditorPreset

  /**
   * 额外的扩展（会添加到预设扩展之后）
   */
  additionalExtensions?: AnyExtension[]

  /**
   * 是否启用所有节点的唯一 ID
   * @default true
   */
  enableUniversalId?: boolean

  /**
   * 初始内容
   */
  content?: string

  /**
   * 是否可编辑
   * @default true
   */
  editable?: boolean

  /**
   * 编辑器属性
   */
  editorProps?: EditorOptions['editorProps']
}

/**
 * 扩展配置
 */
export interface ExtensionConfig {
  /** 扩展名称 */
  name: string
  /** 扩展实例 */
  extension: AnyExtension
  /** 是否默认启用 */
  enabled: boolean
  /** 依赖的其他扩展 */
  dependencies?: string[]
}
