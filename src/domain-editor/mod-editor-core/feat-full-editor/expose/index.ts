/**
 * feat-editor-setup 公共 API
 *
 * 提供编辑器配置和初始化功能
 */

export { useEditorSetup } from '../view'
export { EditorConfigBuilder } from '../service'
export {
  createBasicPreset,
  createFullPreset,
  createDemoPreset,
  DEFAULT_PRESET,
  DEFAULT_ENABLE_UNIVERSAL_ID,
  DEFAULT_EDITOR_PROPS,
} from '../model'
export type { EditorSetupOptions, EditorPreset, ExtensionConfig } from '../model'
