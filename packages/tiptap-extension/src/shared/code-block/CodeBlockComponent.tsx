/**
 * CodeBlockComponent
 * 简化版代码块组件，不依赖外部 UI 库
 */

import { useState } from 'react'
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react'

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
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Plain Text' },
]

export const CodeBlockComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
}) => {
  const [copied, setCopied] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
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
    <NodeViewWrapper className="code-block-wrapper">
      {/* 代码块头部 */}
      <div className="code-block-header">
        {/* 语言选择器 */}
        <div className="code-block-language-select">
          <button
            className="code-block-language-btn"
            onClick={() => setShowLanguages(!showLanguages)}
          >
            {currentLanguage}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transform: showLanguages ? 'rotate(180deg)' : 'none' }}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          {showLanguages && (
            <div className="code-block-language-dropdown">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  className={`code-block-language-option ${language === lang.value ? 'active' : ''}`}
                  onClick={() => {
                    updateAttributes({ language: lang.value })
                    setShowLanguages(false)
                  }}
                >
                  {lang.label}
                  {language === lang.value && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 复制按钮 */}
        <button
          onClick={copyToClipboard}
          className="code-block-copy-btn"
        >
          {copied ? (
            <span className="code-block-copied">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied
            </span>
          ) : (
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy
            </span>
          )}
        </button>
      </div>

      {/* 代码内容 */}
      <pre className="code-block-pre">
        <NodeViewContent as={"code" as any} className={`language-${language}`} />
      </pre>
    </NodeViewWrapper>
  )
}
