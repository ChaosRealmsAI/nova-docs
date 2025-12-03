import { useState, useEffect } from 'react'
import { common, createLowlight } from 'lowlight'
import { loggers } from '@nova/infrastructure/logger'
import { Button } from '@nova/shared/ui/button'
import { Badge } from '@nova/shared/ui/badge'
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

const lowlight = createLowlight(common)

// 常用语言列表
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
]

interface CodeBlockWithLanguageProps {
  code: string
  defaultLanguage?: string
  title?: string
  showLineNumbers?: boolean
  editable?: boolean
  onChange?: (code: string, language: string) => void
}

export function CodeBlockWithLanguage({
  code,
  defaultLanguage = 'javascript',
  title,
  showLineNumbers: _showLineNumbers = false,
  editable: _editable = false,
  onChange,
}: CodeBlockWithLanguageProps) {
  const [language, setLanguage] = useState(defaultLanguage)
  const [highlightedCode, setHighlightedCode] = useState<Node[]>([])
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    try {
      const result = lowlight.highlight(language, code)

      // 递归构建高亮的 DOM 节点
      const buildNodes = (nodes: any[]): Node[] => {
        return nodes.map((node) => {
          if (node.type === 'text') {
            return document.createTextNode(node.value)
          } else if (node.type === 'element') {
            const el = document.createElement(node.tagName)
            if (node.properties?.className) {
              el.className = node.properties.className.join(' ')
            }
            if (node.children) {
              buildNodes(node.children).forEach((child) => el.appendChild(child))
            }
            return el
          }
          return document.createTextNode('')
        })
      }

      setHighlightedCode(buildNodes(result.children))
    } catch (e) {
      loggers.codeBlock.debug(`Failed to highlight ${language}:`, e)
      setHighlightedCode([document.createTextNode(code)])
    }
  }, [code, language])

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    setOpen(false)
    if (onChange) {
      onChange(code, newLanguage)
    }
  }

  const currentLanguage = LANGUAGES.find((lang) => lang.value === language)

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* 代码块头部 - Notion 风格 */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-3">
          {title && <span className="text-sm font-medium text-muted-foreground">{title}</span>}

          {/* 语言选择器 - Notion 风格徽章 */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 hover:bg-accent"
              >
                <Badge variant="secondary" className="font-normal">
                  {currentLanguage?.label || 'JavaScript'}
                </Badge>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="搜索语言..." />
                <CommandList>
                  <CommandEmpty>未找到语言</CommandEmpty>
                  <CommandGroup>
                    {LANGUAGES.map((lang) => (
                      <CommandItem
                        key={lang.value}
                        value={lang.value}
                        onSelect={() => handleLanguageChange(lang.value)}
                      >
                        {lang.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {code.split('\n').length} 行
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
            title={copied ? '已复制！' : '复制代码'}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* 代码内容 */}
      <div className="ProseMirror">
        <pre className="!mt-0 !mb-0 !rounded-none">
          <code
            ref={(el) => {
              if (el) {
                el.innerHTML = ''
                highlightedCode.forEach((node) => el.appendChild(node.cloneNode(true)))
              }
            }}
            className={`language-${language}`}
          >
            {/* 初始内容，会被 ref 回调替换 */}
          </code>
        </pre>
      </div>
    </div>
  )
}
