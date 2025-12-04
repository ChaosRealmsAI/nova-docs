import { useEffect, useState, useCallback, useMemo } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEditorSetup } from '@nova/domain-editor/mod-editor-core/feat-full-editor'
import { TocNew, type HeadingItem } from '@nova/domain-editor/shared/ui/toc-new'
import { SelectionToolbar, useSelectionToolbar } from '@nova/domain-editor/shared/ui/selection-toolbar'
import { EmptyNodeMenu } from '@nova/domain-editor/shared/ui/empty-node-menu'
import { useSlashMenu } from '@nova/domain-editor/mod-editor-node/feat-slash-command'
import { useI18n } from '@nova/shared/i18n'
import type { MessageKey } from '@nova/shared/i18n/messages'
import './editor.css'
import '@nova/domain-editor/shared/ui/editor-styles/base-nodes.css'
import '@nova/domain-editor/mod-editor-node/feat-heading-structure/style/heading-structure.css'
import '@nova/domain-editor/shared/ui/callout/callout.css'
import '@nova/domain-editor/shared/ui/multi-column/multi-column.css'
import '@nova/domain-editor/shared/ui/toc-new/toc-new.css'
import '@nova/domain-editor/shared/ui/handle-menu/handle-menu.css'
import '@nova/domain-editor/shared/ui/selection-toolbar/selection-toolbar.css'
import '@nova/domain-editor/shared/ui/empty-node-menu/empty-node-menu.css'

/** Generate initial content with i18n */
function createInitialContent(t: (key: MessageKey) => string): string {
  return `
<h1>${t('editorWelcomeTitle')}</h1>
<p>${t('editorWelcomeDesc')}</p>

<h2 data-numbered="true" data-manual-number="1.">${t('editorCalloutTitle')}</h2>
<p>${t('editorCalloutDesc')}</p>

<div data-type="callout" data-theme="blue" data-emoji="💡">
  <p>${t('editorCalloutInfo')}</p>
</div>

<div data-type="callout" data-theme="green" data-emoji="✅">
  <p>${t('editorCalloutSuccess')}</p>
</div>

<div data-type="callout" data-theme="yellow" data-emoji="⚠️">
  <p>${t('editorCalloutWarning')}</p>
</div>

<div data-type="callout" data-theme="red" data-emoji="🚨">
  <p>${t('editorCalloutDanger')}</p>
</div>

<h2 data-numbered="true" data-manual-number="2.">${t('editorColumnsTitle')}</h2>
<p>${t('editorColumnsDesc')}</p>

<div data-type="columns" data-columns="2" data-column-widths="[50,50]">
  <div data-type="column">
    <p><strong>${t('editorLeftColumn')}</strong></p>
    <p>${t('editorLeftColumnContent')}</p>
    <ul>
      <li>${t('editorListItem1')}</li>
      <li>${t('editorListItem2')}</li>
    </ul>
  </div>
  <div data-type="column">
    <p><strong>${t('editorRightColumn')}</strong></p>
    <p>${t('editorRightColumnContent')}</p>
    <p>${t('editorRightColumnTip')}</p>
  </div>
</div>

<div data-type="columns" data-columns="3" data-column-widths="[33.33,33.33,33.34]">
  <div data-type="column">
    <p><strong>${t('editorFirstColumn')}</strong></p>
    <p>${t('editorThreeColumnExample')}</p>
  </div>
  <div data-type="column">
    <p><strong>${t('editorSecondColumn')}</strong></p>
    <p>${t('editorMiddleColumnContent')}</p>
  </div>
  <div data-type="column">
    <p><strong>${t('editorThirdColumn')}</strong></p>
    <p>${t('editorRightmostColumn')}</p>
  </div>
</div>

<h2 data-numbered="true" data-manual-number="3.">${t('editorCodeBlockTitle')}</h2>
<p>${t('editorCodeBlockDesc')}</p>

<pre data-language="typescript"><code class="language-typescript">// TypeScript Example
interface User {
  id: number
  name: string
  email: string
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`
}

const user: User = {
  id: 1,
  name: 'Syllo',
  email: 'hello@nova.dev'
}

console.log(greet(user))</code></pre>

<pre data-language="python"><code class="language-python"># Python Example
def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence"""
    if n <= 0:
        return []

    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])

    return sequence[:n]

print(fibonacci(10))</code></pre>

<h2 data-numbered="true" data-manual-number="4.">${t('editorMermaidTitle')}</h2>
<p>${t('editorMermaidDesc')}</p>

<div data-type="mermaid"></div>

<h2 data-numbered="true" data-manual-number="5.">${t('editorTableTitle')}</h2>
<p>${t('editorTableDesc')}</p>

<table>
  <tbody>
    <tr>
      <th>${t('editorTableHeader1')}</th>
      <th>${t('editorTableHeader2')}</th>
      <th>${t('editorTableHeader3')}</th>
    </tr>
    <tr>
      <td>${t('editorTableCell1_1')}</td>
      <td>${t('editorTableCell1_2')}</td>
      <td>${t('editorTableCell1_3')}</td>
    </tr>
    <tr>
      <td>${t('editorTableCell2_1')}</td>
      <td>${t('editorTableCell2_2')}</td>
      <td>${t('editorTableCell2_3')}</td>
    </tr>
  </tbody>
</table>

<h2 data-numbered="true" data-manual-number="6.">${t('editorNumberedHeadingTitle')}</h2>
<p>${t('editorNumberedHeadingDesc')}</p>

<h2 data-indent="0">${t('editorChapter1')}</h2>
<p>${t('editorChapter1Content')}</p>

<h3 data-indent="1">${t('editorSection1_1')}</h3>
<p>${t('editorSection1_1Content')}</p>

<h3 data-indent="1">${t('editorSection1_2')}</h3>
<p>${t('editorSection1_2Content')}</p>

<h4 data-indent="2">${t('editorSection1_2_1')}</h4>
<p>${t('editorSection1_2_1Content')}</p>

<h2 data-indent="0">${t('editorChapter2')}</h2>
<p>${t('editorChapter2Content')}</p>

<h2 data-numbered="true" data-manual-number="7.">${t('editorBasicFormatTitle')}</h2>
<p>${t('editorBasicFormatDesc')}</p>
<ul>
  <li>${t('editorBold')}</li>
  <li>${t('editorItalic')}</li>
  <li>${t('editorStrikethrough')}</li>
  <li>${t('editorInlineCode')}</li>
</ul>

<blockquote>
  <p>${t('editorBlockquote')}</p>
</blockquote>

<h2 data-numbered="true" data-manual-number="8.">${t('editorListTitle')}</h2>
<p>${t('editorListDesc')}</p>

<ol>
  <li>${t('editorOrderedItem')} 1</li>
  <li>${t('editorOrderedItem')} 2</li>
  <li>${t('editorOrderedItem')} 3</li>
</ol>

<ul>
  <li>${t('editorUnorderedItem')}</li>
  <li>${t('editorUnorderedItem')}</li>
  <li>${t('editorUnorderedItem')}</li>
</ul>

<h2 data-numbered="true" data-manual-number="9.">${t('editorTaskListTitle')}</h2>
<p>${t('editorTaskListDesc')}</p>

<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><p>${t('editorTaskItem1')}</p></li>
  <li data-type="taskItem" data-checked="true"><p>${t('editorTaskItem2')}</p></li>
  <li data-type="taskItem" data-checked="false"><p>${t('editorTaskItem3')}</p></li>
  <li data-type="taskItem" data-checked="false"><p>${t('editorTaskItem4')}</p></li>
</ul>

<h2>${t('editorStartCreating')}</h2>
<p>${t('editorStartCreatingDesc')}</p>
`
}

// 从编辑器中提取折叠状态
function extractCollapsedIds(editor: ReturnType<typeof useEditor>): Set<string> {
  if (!editor) return new Set()

  const collapsed = new Set<string>()
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'heading' && node.attrs.collapsed && node.attrs.id) {
      collapsed.add(node.attrs.id)
    }
  })
  return collapsed
}

// 从编辑器中提取标题
function extractHeadings(editor: ReturnType<typeof useEditor>): HeadingItem[] {
  if (!editor) return []

  const headings: HeadingItem[] = []
  const doc = editor.state.doc

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const id = node.attrs.id || `heading-${pos}`
      const level = node.attrs.level || 1
      let text = node.textContent

      // 如果有手动编号，拼接到文本前面
      if (node.attrs.numbered && node.attrs.manualNumber) {
        text = `${node.attrs.manualNumber} ${text}`
      }

      headings.push({ id, level, text, pos })
    }
  })

  // 计算 hasChildren
  return headings.map((heading, index) => {
    let hasChildren = false
    for (let i = index + 1; i < headings.length; i++) {
      if (headings[i].level > heading.level) {
        hasChildren = true
        break
      }
      if (headings[i].level <= heading.level) {
        break
      }
    }
    return { ...heading, hasChildren }
  })
}

export default function EditorPage() {
  const { t } = useI18n()
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [tocWidth, setTocWidth] = useState(280)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())
  const [activeIds, setActiveIds] = useState<string[]>([])

  // Generate initial content with i18n (memoized to prevent unnecessary re-renders)
  const initialContent = useMemo(() => createInitialContent(t), [t])

  const config = useEditorSetup({
    preset: 'full',
    enableUniversalId: true,
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[calc(100vh-120px)] p-8',
      },
    },
  })

  const editor = useEditor(config)

  // 选中文字工具栏
  const selectionToolbar = useSelectionToolbar({ editor })

  // 斜杠命令菜单
  const slashMenu = useSlashMenu({ editor })

  // 更新标题列表和折叠状态
  const updateHeadingsAndCollapsed = useCallback(() => {
    if (!editor) return
    setHeadings(extractHeadings(editor))
    setCollapsedIds(extractCollapsedIds(editor))
  }, [editor])

  // 语言切换时更新编辑器内容
  useEffect(() => {
    if (!editor) return
    editor.commands.setContent(initialContent)
  }, [editor, initialContent])

  // 监听编辑器变化
  useEffect(() => {
    if (!editor) return

    updateHeadingsAndCollapsed()

    const handleUpdate = ({ transaction }: { transaction: { getMeta: (key: string) => unknown } }) => {
      // 文档变化或折叠状态变化时更新
      updateHeadingsAndCollapsed()
    }

    editor.on('update', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, updateHeadingsAndCollapsed])

  // 检测可见标题
  const detectVisibleHeadings = useCallback(() => {
    if (!editor || headings.length === 0) return

    const viewportTop = window.scrollY
    const viewportBottom = viewportTop + window.innerHeight
    const headerHeight = 80

    const visible: string[] = []

    for (const heading of headings) {
      // 通过 nodeDOM 获取元素位置
      const nodeDom = editor.view.nodeDOM(heading.pos)
      let element: HTMLElement | null = null

      if (nodeDom instanceof HTMLElement) {
        element = nodeDom
      } else if (nodeDom instanceof Text && nodeDom.parentElement) {
        element = nodeDom.parentElement
      }

      if (element) {
        const rect = element.getBoundingClientRect()
        const elementTop = rect.top + window.scrollY
        const elementBottom = elementTop + rect.height

        // 检查是否在视口范围内（考虑 header 高度）
        if (elementBottom >= viewportTop + headerHeight - 50 && elementTop <= viewportBottom + 50) {
          visible.push(heading.id)
        }
      }
    }

    setActiveIds(visible)
  }, [editor, headings])

  // 监听滚动事件检测可见标题
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          detectVisibleHeadings()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // 初始检测
    detectVisibleHeadings()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [detectVisibleHeadings])

  // TOC 宽度变化回调
  const handleTocWidthChange = useCallback((width: number) => {
    setTocWidth(width)
  }, [])

  // 解析标题 DOM 元素（三层回退策略）
  const resolveHeadingElement = useCallback((pos: number, id?: string): HTMLElement | null => {
    if (!editor) return null

    // 1. 首选：通过 pos 使用 nodeDOM 定位
    const nodeDom = editor.view.nodeDOM(pos)

    if (nodeDom instanceof HTMLElement) {
      return nodeDom
    }

    if (nodeDom instanceof Element) {
      return nodeDom as unknown as HTMLElement
    }

    if (nodeDom instanceof Text) {
      const parent = nodeDom.parentElement
      if (parent instanceof HTMLElement) {
        return parent
      }
    }

    // 2. 备选：通过 id 查找
    if (id) {
      const fallback = document.getElementById(id)
      if (fallback instanceof HTMLElement) {
        return fallback
      }
    }

    // 3. 兜底：DOM 扫描 + 位置验证
    const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    for (const element of Array.from(allHeadings)) {
      if (element instanceof HTMLElement) {
        try {
          const elementPos = editor.view.posAtDOM(element, 0)
          const positionDelta = Math.abs(elementPos - pos)
          if (positionDelta <= 2) {
            return element
          }
        } catch {
          // 忽略无法获取位置的元素
        }
      }
    }

    return null
  }, [editor])

  // 触发标题高亮效果
  const triggerHeadingHighlight = useCallback((element: HTMLElement) => {
    // 移除旧动画，强制重排以重新触发动画
    element.classList.remove('toc-heading-highlight')
    void element.offsetWidth // 强制重排
    element.classList.add('toc-heading-highlight')

    // 1 秒后移除样式
    setTimeout(() => {
      element.classList.remove('toc-heading-highlight')
    }, 1000)
  }, [])

  // TOC 滚动到标题回调
  const handleScrollToHeading = useCallback((pos: number, id?: string) => {
    if (!editor) return

    const targetElement = resolveHeadingElement(pos, id)
    if (!targetElement) return

    // 计算滚动位置（考虑 header 高度）
    const headerHeight = 80
    const targetPosition = targetElement.offsetTop - headerHeight - 32

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    })

    // 触发高亮效果
    requestAnimationFrame(() => triggerHeadingHighlight(targetElement))
  }, [editor, resolveHeadingElement, triggerHeadingHighlight])

  // TOC 折叠切换回调 → 同步到编辑器
  const handleToggleFold = useCallback((headingId: string) => {
    if (!editor) return

    // 遍历文档找到对应的 heading 节点
    let targetPos: number | null = null
    let targetNode: typeof editor.state.doc.firstChild | null = null

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading' && node.attrs.id === headingId) {
        targetPos = pos
        targetNode = node
        return false // 停止遍历
      }
    })

    if (targetPos !== null && targetNode) {
      // 切换 collapsed 属性
      const tr = editor.state.tr
      tr.setNodeMarkup(targetPos, undefined, {
        ...targetNode.attrs,
        collapsed: !targetNode.attrs.collapsed,
      })
      tr.setMeta('fold-changed', true)
      editor.view.dispatch(tr)
    }
  }, [editor])

  // 计算有效的 TOC 宽度（用于编辑器边距）
  const effectiveTocWidth = tocWidth === 0 ? 0 : Math.max(tocWidth, 48)

  // 计算编辑器左边距：24px + TOC宽度 + 24px
  const editorMarginLeft = 24 + effectiveTocWidth + 24

  return (
    <div className="editor-layout">
      {/* 左侧间隙 + TOC */}
      <div className="toc-wrapper" style={{ paddingLeft: '24px' }}>
        <TocNew
          headings={headings}
          topOffset={80}
          onWidthChange={handleTocWidthChange}
          collapsedIds={collapsedIds}
          onToggleFold={handleToggleFold}
          onScrollToHeading={handleScrollToHeading}
          activeIds={activeIds}
        />
      </div>

      {/* 编辑器主体 */}
      <main
        className="editor-main"
        style={{
          marginLeft: `${editorMarginLeft}px`,
          marginRight: '120px',
        }}
      >
        <EditorContent editor={editor} />
      </main>

      {/* 选中文字工具栏 */}
      <SelectionToolbar
        open={selectionToolbar.open}
        position={selectionToolbar.position}
        activeFormats={selectionToolbar.activeFormats}
        onClose={selectionToolbar.close}
        onFormat={selectionToolbar.format}
        onColorChange={selectionToolbar.setColor}
      />

      {/* 斜杠命令菜单 */}
      {slashMenu.open && (
        <div
          style={{
            position: 'fixed',
            left: `${slashMenu.position.x}px`,
            top: `${slashMenu.position.y}px`,
            zIndex: 1000,
          }}
        >
          <EmptyNodeMenu
            open={slashMenu.open}
            onClose={slashMenu.close}
            onSelect={slashMenu.selectBlockType}
            onMouseEnter={slashMenu.onMouseEnter}
            onMouseLeave={slashMenu.onMouseLeave}
          />
        </div>
      )}
    </div>
  )
}
