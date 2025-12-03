/**
 * Theme Infrastructure - 主题管理基础设施层
 *
 * 提供全局主题管理能力：
 * - 多颜色方案切换（blue/green/violet/orange/teal/rose/indigo/amber）
 * - 暗黑模式切换（light/dark）
 * - 主题持久化（localStorage）
 * - React集成（ThemeProvider + useTheme hook）
 */

export * from './model/theme.types'
export * from './service/theme.service'
export * from './service/theme-presets'
export * from './api/theme-provider'
