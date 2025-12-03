/**
 * Global i18n State
 *
 * 用于在 React 组件树之外（如 ProseMirror 插件、detached roots）共享语言状态
 */

import { DEFAULT_LOCALE, type Locale } from './config'

// 全局语言状态
let globalLocale: Locale = DEFAULT_LOCALE

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
