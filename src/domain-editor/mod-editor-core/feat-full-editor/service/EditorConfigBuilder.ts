/**
 * Editor Config Builder
 * 编辑器配置构建器
 */

import type { AnyExtension } from '@tiptap/core'
import type { EditorSetupOptions, EditorPreset } from '../model'
import {
  createBasicPreset,
  createFullPreset,
  createDemoPreset,
  DEFAULT_PRESET,
  DEFAULT_ENABLE_UNIVERSAL_ID,
  DEFAULT_EDITOR_PROPS,
} from '../model'

export class EditorConfigBuilder {
  /**
   * 根据预设类型获取扩展列表
   */
  static getPresetExtensions(preset: EditorPreset, enableUniversalId: boolean): AnyExtension[] {
    switch (preset) {
      case 'basic':
        return createBasicPreset(enableUniversalId)
      case 'full':
        return createFullPreset(enableUniversalId)
      case 'demo':
        return createDemoPreset()
      default:
        return createFullPreset(enableUniversalId)
    }
  }

  /**
   * 构建完整的编辑器配置
   */
  static build(options: EditorSetupOptions = {}) {
    const {
      preset = DEFAULT_PRESET,
      additionalExtensions = [],
      enableUniversalId = DEFAULT_ENABLE_UNIVERSAL_ID,
      content,
      editable = true,
      editorProps = DEFAULT_EDITOR_PROPS,
    } = options

    // 获取预设扩展
    const presetExtensions = this.getPresetExtensions(preset, enableUniversalId)

    // 合并扩展
    const extensions = [...presetExtensions, ...additionalExtensions]

    // 构建配置对象
    return {
      extensions,
      content,
      editable,
      editorProps,
    }
  }
}
