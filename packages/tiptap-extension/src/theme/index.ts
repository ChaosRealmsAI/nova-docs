/**
 * Nova Theme System
 *
 * 提供全局主题管理能力：
 * - 多颜色方案切换（blue/green/violet/orange/teal/rose/indigo/amber）
 * - 暗黑模式切换（light/dark）
 * - 主题持久化（localStorage）
 * - React集成（ThemeProvider + useTheme hook）
 * - 配色选择器组件（ColorSchemePicker）
 */

export * from './types'
export * from './presets'
export * from './service'
export * from './provider'
export { ColorSchemePicker } from './ColorSchemePicker'
