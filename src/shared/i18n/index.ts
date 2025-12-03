/**
 * i18n 模块导出
 */

export { I18nProvider, useI18n } from './context'
export { getGlobalLocale, setGlobalLocale, subscribeToLocale } from './state'
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, LANGUAGES } from './config'
export type { Locale, MessageModule, LanguageMeta } from './config'
export type { MessageKey } from './messages'
