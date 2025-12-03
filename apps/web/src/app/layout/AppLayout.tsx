import { Outlet } from 'react-router-dom'
import { useTheme } from '@nova/infrastructure/theme'
import { useI18n, LANGUAGES } from '@nova/shared/i18n'
import { Button } from '@nova/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, Palette, Languages } from 'lucide-react'

import type { MessageKey } from '@nova/shared/i18n/messages'

const COLOR_SCHEME_KEYS: Record<string, MessageKey> = {
  blue: 'schemeBlue',
  green: 'schemeGreen',
  violet: 'schemeViolet',
  orange: 'schemeOrange',
  teal: 'schemeTeal',
  rose: 'schemeRose',
  indigo: 'schemeIndigo',
  amber: 'schemeAmber',
}

const getSchemeLabel = (scheme: string, t: (key: MessageKey) => string): string => {
  const key = COLOR_SCHEME_KEYS[scheme]
  return key ? t(key) : scheme
}

// 各配色方案的 primary 颜色预览
const COLOR_SCHEME_PREVIEW: Record<string, string> = {
  blue: 'oklch(0.488 0.243 264.376)',
  green: 'oklch(0.532 0.16 162.48)',
  violet: 'oklch(0.558 0.228 293.415)',
  orange: 'oklch(0.646 0.222 41.116)',
  teal: 'oklch(0.627 0.194 180.426)',
  rose: 'oklch(0.645 0.246 16.439)',
  indigo: 'oklch(0.585 0.233 277.117)',
  amber: 'oklch(0.769 0.188 70.08)',
}

export function AppLayout() {
  const { config, toggleMode, setColorScheme, availableColorSchemes } = useTheme()
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Nova Docs</h1>

          <div className="flex items-center gap-4">
            {/* 语言切换 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Languages className="size-4" />
                  <span>{LANGUAGES.find((l) => l.code === locale)?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={locale === lang.code ? 'bg-accent' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 颜色方案 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Palette className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('colorScheme')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableColorSchemes.map((scheme) => (
                  <DropdownMenuItem
                    key={scheme}
                    onClick={() => setColorScheme(scheme)}
                    className={config.colorScheme === scheme ? 'bg-accent' : ''}
                  >
                    <span
                      className="mr-2 size-4 rounded-full border"
                      style={{ backgroundColor: COLOR_SCHEME_PREVIEW[scheme] }}
                    />
                    {getSchemeLabel(scheme, t)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 深色模式 */}
            <Button variant="ghost" size="icon" onClick={toggleMode}>
              {config.mode === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
