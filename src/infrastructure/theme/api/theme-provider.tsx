import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeConfig, ColorScheme } from '../model/theme.types'
import { ThemeService } from '../service/theme.service'

interface ThemeContextValue {
  config: ThemeConfig
  toggleMode: () => void
  setColorScheme: (scheme: ColorScheme) => void
  availableColorSchemes: ColorScheme[]
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * 主题Provider - 管理主题状态并提供给子组件
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [config, setConfig] = useState<ThemeConfig>(() => ThemeService.loadTheme())

  // 初始化时应用主题
  useEffect(() => {
    ThemeService.applyTheme(config)
  }, [config])

  const toggleMode = () => {
    setConfig((prev) => ThemeService.toggleMode(prev))
  }

  const setColorScheme = (scheme: ColorScheme) => {
    setConfig((prev) => ThemeService.changeColorScheme(prev, scheme))
  }

  const value: ThemeContextValue = {
    config,
    toggleMode,
    setColorScheme,
    availableColorSchemes: ThemeService.getAvailableColorSchemes(),
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * useTheme Hook - 获取主题上下文
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
