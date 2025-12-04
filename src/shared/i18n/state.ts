/**
 * Global i18n State
 *
 * 用于在 React 组件树之外（如 ProseMirror 插件、detached roots）共享语言状态
 */

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './config'

/**
 * 从浏览器检测用户语言
 */
function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE

  const browserLang = navigator.language

  // 精确匹配
  if (SUPPORTED_LOCALES.includes(browserLang as Locale)) {
    return browserLang as Locale
  }

  // 中文特殊处理
  if (browserLang === 'zh-CN' || browserLang === 'zh-SG') return 'zh-Hans'
  if (browserLang.startsWith('zh')) return 'zh-Hant'

  // 语言前缀匹配
  const langPrefix = browserLang.split('-')[0]
  const matched = SUPPORTED_LOCALES.find((locale) => locale.startsWith(langPrefix))
  if (matched) return matched

  return DEFAULT_LOCALE
}

// 全局语言状态
let globalLocale: Locale = detectLocale()

// 监听器集合
const listeners = new Set<(locale: Locale) => void>()

/**
 * 获取当前全局语言
 */
export const getGlobalLocale = (): Locale => {
  return globalLocale
}

/**
 * 设置全局语言并通知所有监听器
 */
export const setGlobalLocale = (locale: Locale) => {
  if (globalLocale !== locale) {
    globalLocale = locale
    listeners.forEach((listener) => listener(locale))
  }
}

/**
 * 订阅语言变化
 * 返回取消订阅函数
 */
export const subscribeToLocale = (listener: (locale: Locale) => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
