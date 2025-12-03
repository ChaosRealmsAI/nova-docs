/**
 * Logger 注册中心 - 统一管理所有 Feature Logger
 *
 * 所有功能配置在 feature-definitions.ts 中定义
 */

import { getLogger } from './logger'
import { FEATURE_CONFIGS } from './feature-definitions'
import type { FeatureId } from './feature-definitions'

// 重新导出类型和常量
export { FEATURE_CONFIGS, FeatureId }
export type { FeatureDefinition } from './feature-definitions'

/**
 * 创建带 Feature ID 的 Logger
 * 延迟获取 Logger 实例，确保在真正使用时才初始化
 */
function createFeatureLogger(featureId: FeatureId) {
  return {
    debug: (message: string, data?: unknown) =>
      getLogger().debug(featureId, message, data),
    info: (message: string, data?: unknown) =>
      getLogger().info(featureId, message, data),
    warn: (message: string, data?: unknown) =>
      getLogger().warn(featureId, message, data),
    error: (message: string, data?: unknown) =>
      getLogger().error(featureId, message, data),
  }
}

/**
 * 统一注册的 Logger 实例
 * 使用方式：loggers.multiColumn.debug('消息')
 */
export const loggers = {
  // 基础设施
  loggerTest: createFeatureLogger('feature-logger-test'),
  appInit: createFeatureLogger('feature-app-init'),
  theme: createFeatureLogger('feature-theme'),

  // 编辑器核心
  editorInit: createFeatureLogger('feature-editor-init'),
  markdownInput: createFeatureLogger('feature-markdown-input'),

  // 编辑器节点功能
  multiColumn: createFeatureLogger('feature-multi-column'),
  codeBlock: createFeatureLogger('feature-code-block'),
  dragHandle: createFeatureLogger('feature-drag-handle'),
  handleDisplay: createFeatureLogger('feature-handle-display'),
  dragGuideline: createFeatureLogger('feature-drag-guideline'),

  // 标题结构功能
  headingStructure: createFeatureLogger('feat-heading-structure'),
  numbering: createFeatureLogger('numbering-plugin'),
  foldCalculator: createFeatureLogger('fold-calculator'),
  foldButton: createFeatureLogger('fold-button'),
  headingExtension: createFeatureLogger('heading-extension'),
  headingIdManager: createFeatureLogger('heading-id-manager'),
  headingShortcut: createFeatureLogger('heading-shortcut'),

  // UI 组件
  uiButton: createFeatureLogger('feature-ui-button'),
} as const

/**
 * Logger 名称类型（用于类型检查）
 */
export type LoggerName = keyof typeof loggers
