import type { ThemeConfig, ThemeMode, ColorScheme, ThemeVariables } from './types'
import { THEME_PRESETS } from './presets'

const STORAGE_KEY = 'nova-theme-config'

/**
 * 主题服务 - 负责主题切换和持久化
 */
export class ThemeService {
  /**
   * 应用主题到DOM
   */
  static applyTheme(config: ThemeConfig): void {
    const { colorScheme, mode } = config
    const preset = THEME_PRESETS[colorScheme]

    if (!preset) {
      console.error(`[ThemeService] 未找到主题预设: ${colorScheme}`)
      return
    }

    const variables: ThemeVariables = mode === 'dark' ? preset.dark : preset.light

    // 应用CSS变量到:root
    const root = document.documentElement
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // 切换dark类
    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 持久化到localStorage
    this.saveTheme(config)
  }

  /**
   * 切换暗黑模式
   */
  static toggleMode(currentConfig: ThemeConfig): ThemeConfig {
    const newMode: ThemeMode = currentConfig.mode === 'dark' ? 'light' : 'dark'
    const newConfig: ThemeConfig = { ...currentConfig, mode: newMode }
    this.applyTheme(newConfig)
    return newConfig
  }

  /**
   * 切换颜色方案
   */
  static changeColorScheme(currentConfig: ThemeConfig, colorScheme: ColorScheme): ThemeConfig {
    const newConfig: ThemeConfig = { ...currentConfig, colorScheme }
    this.applyTheme(newConfig)
    return newConfig
  }

  /**
   * 从localStorage加载主题
   */
  static loadTheme(): ThemeConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('[ThemeService] 加载主题配置失败', error)
    }

    // 默认主题
    return {
      colorScheme: 'blue',
      mode: 'dark',
    }
  }

  /**
   * 保存主题到localStorage
   */
  static saveTheme(config: ThemeConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
      console.error('[ThemeService] 保存主题配置失败', error)
    }
  }

  /**
   * 获取所有可用的颜色方案
   */
  static getAvailableColorSchemes(): ColorScheme[] {
    return Object.keys(THEME_PRESETS) as ColorScheme[]
  }
}
