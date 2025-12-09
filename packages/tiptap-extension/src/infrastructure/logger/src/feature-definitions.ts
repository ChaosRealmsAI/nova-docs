/**
 * Feature 配置定义（独立文件，避免循环依赖）
 *
 * 这个文件只包含配置定义，不导入任何其他 logger 模块
 */

import type { LogLevel } from './types'

/**
 * Feature 配置定义接口
 */
export interface FeatureDefinition {
  /** Feature 描述 */
  description: string
  /** 默认日志级别 */
  defaultLevel: LogLevel
  /** 默认是否启用 */
  defaultEnabled: boolean
  /** 默认是否显示代码位置 */
  defaultShowLocation: boolean
  /** 所属模块 */
  module: 'domain-editor' | 'infrastructure' | 'shared' | 'apps'
}

/**
 * 所有 Feature 配置定义（单一数据源）
 */
export const FEATURE_CONFIGS = {
  // ========== 基础设施 ==========
  'test-feature-enabled': {
    description: '测试功能-启用',
    defaultLevel: 'debug',
    defaultEnabled: true,
    defaultShowLocation: true,
    module: 'infrastructure',
  },
  'test-feature-disabled': {
    description: '测试功能-禁用',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'infrastructure',
  },
  'test-feature-multi-1': {
    description: '测试功能-多选1',
    defaultLevel: 'debug',
    defaultEnabled: true,
    defaultShowLocation: true,
    module: 'infrastructure',
  },
  'test-feature-multi-2': {
    description: '测试功能-多选2',
    defaultLevel: 'debug',
    defaultEnabled: true,
    defaultShowLocation: true,
    module: 'infrastructure',
  },
  'feature-logger-test': {
    description: '日志测试功能 - 用于测试日志开关',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'infrastructure',
  },
  'feature-app-init': {
    description: '应用初始化',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'apps',
  },
  'feature-theme': {
    description: '主题系统',
    defaultLevel: 'info',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'infrastructure',
  },

  // ========== 编辑器核心 ==========
  'feature-editor-init': {
    description: '编辑器初始化',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },
  'feature-markdown-input': {
    description: 'Markdown输入规则',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },

  // ========== 编辑器节点功能 ==========
  'feature-multi-column': {
    description: '多列容器',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },
  'feature-code-block': {
    description: '代码块高亮',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },
  'feature-drag-handle': {
    description: '拖拽手柄',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },
  'feature-handle-display': {
    description: 'Handle Display - 句柄展示功能（Hover检测与渲染）',
    defaultLevel: 'debug',
    defaultEnabled: false,  // 关闭日志以调试性能
    defaultShowLocation: true,
    module: 'domain-editor',
  },
  'feature-drag-guideline': {
    description: '拖拽辅助引导线',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },

  // ========== 标题结构功能 ==========
  'feat-heading-structure': {
    description: '标题结构系统',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },
  'numbering-plugin': {
    description: '编号插件',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },
  'fold-calculator': {
    description: '折叠范围计算器',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },
  'fold-button': {
    description: '折叠按钮',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },
  'heading-extension': {
    description: 'Heading 扩展',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },
  'heading-id-manager': {
    description: 'Heading ID 管理',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },
  'heading-shortcut': {
    description: 'Heading 快捷键',
    defaultLevel: 'debug',
    defaultEnabled: false,
    defaultShowLocation: true,
    module: 'domain-editor',
  },

  // ========== UI 组件 ==========
  'feature-ui-button': {
    description: 'UI按钮组件',
    defaultLevel: 'info',
    defaultEnabled: false,
    defaultShowLocation: false,
    module: 'shared',
  },
} as const satisfies Record<string, FeatureDefinition>

/**
 * Feature ID 类型（从配置自动推导）
 */
export type FeatureId = keyof typeof FEATURE_CONFIGS
