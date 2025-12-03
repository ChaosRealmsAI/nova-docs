/**
 * i18n Context
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { DEFAULT_LOCALE, type Locale } from './config'
import { messages, type MessageKey } from './messages'
import { getGlobalLocale, setGlobalLocale, subscribeToLocale } from './state'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  // 初始化时从全局状态获取
  const [locale, setLocale] = useState<Locale>(getGlobalLocale())

  // 订阅全局状态变化
  useEffect(() => {
    const unsubscribe = subscribeToLocale((newLocale) => {
      setLocale(newLocale)
    })
    return unsubscribe
  }, [])

  // 更新语言时同步更新全局状态
  const updateLocale = useCallback((newLocale: Locale) => {
    setGlobalLocale(newLocale)
  }, [])

  const t = useCallback(
    (key: MessageKey): string => {
      return messages[key]?.[locale] ?? messages[key]?.[DEFAULT_LOCALE] ?? key
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale: updateLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
