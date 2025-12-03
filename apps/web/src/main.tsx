import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { ThemeProvider } from '@nova/infrastructure/theme'
import { I18nProvider } from '@nova/shared/i18n'

/**
 * 抑制 Tiptap + React 18 兼容性警告
 * 这是已知的第三方库问题，不影响功能
 * 相关 issue: https://github.com/ueberdosis/tiptap/issues/3764
 */
if (import.meta.env.DEV) {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      message.includes('flushSync was called from inside a lifecycle method')
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <I18nProvider>
      <App />
    </I18nProvider>
  </ThemeProvider>,
)
