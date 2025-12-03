import { useState } from 'react'
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useI18n } from '@nova/shared/i18n'
import { cn } from '@nova/shared/utils'
import { Button } from '@nova/shared/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nova/shared/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@nova/shared/ui/command'
import { Copy, Check, ChevronDown } from 'lucide-react'

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Plain Text' },
]

export const CodeBlockComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  extension,
}) => {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { language } = node.attrs

  const copyToClipboard = () => {
    const content = node.textContent
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const currentLanguage = LANGUAGES.find((lang) => lang.value === language)?.label || 'Plain Text'

  return (
    <NodeViewWrapper className="code-block-wrapper relative group rounded-lg border bg-muted/40 my-4">
      {/* 代码块头部 */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20 rounded-t-lg">
        {/* 语言选择器 - Notion 风格徽章 */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              role="combobox"
              aria-expanded={open}
              className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1 rounded transition-colors flex items-center gap-1"
            >
              {currentLanguage}
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("opacity-50 transition-transform", open && "rotate-180")}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t('codeSearchLanguage')} />
              <CommandEmpty>{t('codeNoLanguageFound')}</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {LANGUAGES.map((lang) => (
                  <CommandItem
                    key={lang.value}
                    value={lang.value}
                    onSelect={(currentValue) => {
                      updateAttributes({ language: currentValue })
                      setOpen(false)
                    }}
                    className="flex items-center justify-between"
                  >
                    {lang.label}
                    {language === lang.value && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-auto opacity-100"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* 复制按钮 */}
        <button
          onClick={copyToClipboard}
          className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1 rounded transition-colors"
          title={copied ? t('codeCopied') : t('codeCopy')}
        >
          {copied ? (
            <span className="flex items-center gap-1 text-green-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('codeCopied')}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              {t('codeCopy')}
            </span>
          )}
        </button>
      </div>

      {/* 代码内容 */}
      <pre className="p-4 m-0 overflow-x-auto rounded-b-lg">
        <NodeViewContent as="code" className={`language-${language}`} />
      </pre>
    </NodeViewWrapper>
  )
}
