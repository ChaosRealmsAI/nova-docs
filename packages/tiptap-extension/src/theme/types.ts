/**
 * Theme Types for @nova/tiptap-extension
 */

/**
 * 主题模式：亮色/暗色
 */
export type ThemeMode = 'light' | 'dark'

/**
 * 颜色方案：彩色主题
 */
export type ColorScheme =
  | 'blue'
  | 'green'
  | 'violet'
  | 'orange'
  | 'teal'
  | 'rose'
  | 'indigo'
  | 'amber'

/**
 * CSS变量配置
 */
export interface ThemeVariables {
  '--radius': string
  '--background': string
  '--foreground': string
  '--card': string
  '--card-foreground': string
  '--popover': string
  '--popover-foreground': string
  '--primary': string
  '--primary-foreground': string
  '--secondary': string
  '--secondary-foreground': string
  '--muted': string
  '--muted-foreground': string
  '--accent': string
  '--accent-foreground': string
  '--destructive': string
  '--border': string
  '--input': string
  '--ring': string
  '--chart-1': string
  '--chart-2': string
  '--chart-3': string
  '--chart-4': string
  '--chart-5': string
  '--sidebar': string
  '--sidebar-foreground': string
  '--sidebar-primary': string
  '--sidebar-primary-foreground': string
  '--sidebar-accent': string
  '--sidebar-accent-foreground': string
  '--sidebar-border': string
  '--sidebar-ring': string
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  colorScheme: ColorScheme
  mode: ThemeMode
}

/**
 * 完整主题预设（包含light和dark两套变量）
 */
export interface ThemePreset {
  name: ColorScheme
  light: ThemeVariables
  dark: ThemeVariables
}
