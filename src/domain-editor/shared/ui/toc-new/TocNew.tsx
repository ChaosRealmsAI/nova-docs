import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { HeadingItem } from './types'
import './toc-new.css'

// TOC 宽度常量
const EXPANDED_WIDTH = 280
const COLLAPSED_WIDTH = 48

interface TocNewProps {
  headings: HeadingItem[]
  topOffset?: number
  onWidthChange?: (width: number) => void
  /** 外部传入的折叠状态（受控模式） */
  collapsedIds?: Set<string>
  /** 折叠切换回调，返回标题 ID */
  onToggleFold?: (id: string) => void
  /** 滚动到标题的回调，传入标题在文档中的位置和 ID */
  onScrollToHeading?: (pos: number, id: string) => void
  /** 外部传入的活跃标题 ID 列表（用于高亮当前可见的标题） */
  activeIds?: string[]
}

export const TocNew: React.FC<TocNewProps> = ({
  headings,
  topOffset = 64,
  onWidthChange,
  collapsedIds: externalCollapsedIds,
  onToggleFold: externalOnToggleFold,
  onScrollToHeading: externalOnScrollToHeading,
  activeIds: externalActiveIds,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [internalVisibleIds, setInternalVisibleIds] = useState<string[]>([])
  const [internalFoldedIds, setInternalFoldedIds] = useState<Set<string>>(new Set())

  // 使用外部状态（受控模式）或内部状态（非受控模式）
  const foldedIds = externalCollapsedIds ?? internalFoldedIds
  const isControlled = externalCollapsedIds !== undefined
  // 使用外部活跃 ID 或内部检测的
  const visibleIds = externalActiveIds ?? internalVisibleIds
  const hasExternalActiveIds = externalActiveIds !== undefined

  // 计算因父级折叠而需要隐藏的子标题
  const hiddenByParentIds = useMemo(() => {
    const hidden = new Set<string>()
    let skipUntilLevel = Infinity

    for (const heading of headings) {
      // 遇到同级或更高级标题时，重置跳过状态
      if (heading.level <= skipUntilLevel) {
        skipUntilLevel = Infinity
      }

      // 如果当前标题级别大于跳过阈值，标记为隐藏
      if (heading.level > skipUntilLevel) {
        hidden.add(heading.id)
        continue
      }

      // 如果这个标题被折叠，设置跳过其子标题
      if (foldedIds.has(heading.id)) {
        skipUntilLevel = heading.level
      }
    }

    return hidden
  }, [headings, foldedIds])

  const containerRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const tickingRef = useRef(false)
  const highlightTimeoutRef = useRef<number | null>(null)

  // 切换收起/展开
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  // 通知父组件宽度变化
  useEffect(() => {
    const hasHeadings = headings.length > 0
    const width = hasHeadings
      ? (isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH)
      : 0
    onWidthChange?.(width)
  }, [headings.length, isCollapsed, onWidthChange])

  // 切换标题折叠
  const toggleFold = useCallback((e: React.MouseEvent, headingId: string) => {
    e.preventDefault()

    // 受控模式：调用外部回调
    if (isControlled) {
      externalOnToggleFold?.(headingId)
      return
    }

    // 非受控模式：更新内部状态
    setInternalFoldedIds(prev => {
      const next = new Set(prev)
      if (next.has(headingId)) {
        next.delete(headingId)
      } else {
        next.add(headingId)
      }
      return next
    })
  }, [isControlled, externalOnToggleFold])

  // 更新活跃标题（仅在没有外部 activeIds 时使用）
  const updateActiveHeading = useCallback(() => {
    // 如果有外部 activeIds，跳过内部检测
    if (hasExternalActiveIds) {
      tickingRef.current = false
      return
    }

    const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const viewportTop = window.scrollY
    const viewportBottom = viewportTop + window.innerHeight

    const visible: string[] = []
    allHeadings.forEach(heading => {
      const id = heading.id
      if (!id) return

      const headingTop = (heading as HTMLElement).offsetTop
      const headingBottom = headingTop + (heading as HTMLElement).offsetHeight

      if (headingBottom >= viewportTop - 100 && headingTop <= viewportBottom + 100) {
        visible.push(id)
      }
    })

    setInternalVisibleIds(visible)
    tickingRef.current = false
  }, [hasExternalActiveIds])

  // 更新指示器位置
  const updateIndicator = useCallback(() => {
    if (!containerRef.current || !indicatorRef.current) return

    const activeLinks = containerRef.current.querySelectorAll('.toc-link.active')

    if (activeLinks.length === 0) {
      if (indicatorRef.current) {
        indicatorRef.current.style.setProperty('--toc-height', '0px')
        indicatorRef.current.classList.add('hidden')
      }
      return
    }

    const firstLink = activeLinks[0] as HTMLElement
    const lastLink = activeLinks[activeLinks.length - 1] as HTMLElement
    const containerRect = containerRef.current.getBoundingClientRect()
    const firstRect = firstLink.getBoundingClientRect()
    const lastRect = lastLink.getBoundingClientRect()

    const top = firstRect.top - containerRect.top
    const height = lastRect.bottom - firstRect.top

    if (indicatorRef.current) {
      indicatorRef.current.style.setProperty('--toc-top', `${top}px`)
      indicatorRef.current.style.setProperty('--toc-height', `${height}px`)
      indicatorRef.current.classList.remove('hidden')
    }
  }, [])

  // 滚动到标题
  const scrollToHeading = useCallback((e: React.MouseEvent, heading: HeadingItem) => {
    e.preventDefault()

    // 优先使用外部回调（通过 editor 定位）
    if (externalOnScrollToHeading && heading.pos !== undefined) {
      externalOnScrollToHeading(heading.pos, heading.id)
      return
    }

    // 降级：通过 DOM id 查找
    const target = document.getElementById(heading.id)
    if (!target) return

    const targetPos = (target as HTMLElement).offsetTop - topOffset - 16
    window.scrollTo({
      top: targetPos,
      behavior: 'smooth'
    })

    // 触发高亮动画
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current)
    }

    setTimeout(() => {
      target.classList.add('toc-heading-highlight')
      highlightTimeoutRef.current = window.setTimeout(() => {
        target.classList.remove('toc-heading-highlight')
      }, 1000)
    }, 300)
  }, [topOffset, externalOnScrollToHeading])

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(updateActiveHeading)
        tickingRef.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateActiveHeading()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [updateActiveHeading])

  // 更新指示器
  useEffect(() => {
    updateIndicator()
  }, [visibleIds, updateIndicator])

  if (headings.length === 0) {
    return null
  }

  return (
    <aside
      className={`toc-container ${isCollapsed ? 'collapsed' : 'expanded'} thin-scrollbar`}
      aria-label="Page sections"
      style={{
        '--toc-top-offset': `${topOffset}px`,
        '--header-height': `${topOffset}px`,
      } as React.CSSProperties}
    >
      <div className="toc-inner" ref={containerRef}>
        {/* 活动指示器 */}
        <div
          className="toc-indicator"
          ref={indicatorRef}
          style={{
            '--toc-top': '0px',
            '--toc-height': '0px',
          } as React.CSSProperties}
        />

        {/* 收起/展开按钮 */}
        <div className="toc-header">
          <button
            className="toc-toggle-btn"
            onClick={toggleCollapse}
            title={isCollapsed ? '展开目录' : '收起目录'}
          >
            {/* 展开状态图标（双左箭头） */}
            <svg
              className="icon-expanded"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ display: isCollapsed ? 'none' : 'block' }}
            >
              <path d="M16 5L11 10L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 5L6 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* 收起状态图标（双右箭头） */}
            <svg
              className="icon-collapsed"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ display: isCollapsed ? 'block' : 'none' }}
            >
              <path d="M4 5L9 10L4 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 5L14 10L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 迷你导航条（收起状态） */}
        <div className="toc-mini-nav thin-scrollbar">
          {headings.map(heading => {
            const isHiddenByParent = hiddenByParentIds.has(heading.id)
            return (
              <button
                key={`mini-${heading.id}`}
                className={`toc-mini-item level-${heading.level} ${visibleIds.includes(heading.id) ? 'active' : ''} ${isHiddenByParent ? 'toc-mini-item-hidden' : ''}`}
                data-id={heading.id}
                title={heading.text}
                onClick={(e) => scrollToHeading(e, heading)}
              />
            )
          })}
        </div>

        {/* 完整目录（展开状态） */}
        <div className="toc-content">
          <div className="toc-scroll-area">
            <div className="toc-scroll-viewport" data-radix-scroll-area-viewport="">
              <div className="toc-scroll-inner">
                <ul className="toc-list">
                  {headings.map(heading => {
                    const isActive = visibleIds.includes(heading.id)
                    const indent = 0.75 + (heading.level - 1) * 0.75
                    const isFolded = foldedIds.has(heading.id)
                    const isHiddenByParent = hiddenByParentIds.has(heading.id)

                    return (
                      <li className={`toc-item ${isHiddenByParent ? 'toc-item-hidden' : ''}`} key={heading.id}>
                        {heading.hasChildren ? (
                          <button
                            className={`toc-fold-btn ${isFolded ? '' : 'expanded'}`}
                            style={{ marginLeft: `${indent}rem` }}
                            onClick={(e) => toggleFold(e, heading.id)}
                            type="button"
                            aria-label={`切换 ${heading.text} 子标题`}
                          >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M7.712 11.351L3.34 5.9a.45.45 0 010-.538.278.278 0 01.215-.112h8.89c.168 0 .305.17.305.381a.432.432 0 01-.09.269l-4.372 5.451c-.159.199-.417.199-.576 0z"
                                fill="currentColor"
                                style={{ opacity: 0.6 }}
                              />
                            </svg>
                          </button>
                        ) : (
                          <div className="toc-spacer" style={{ marginLeft: `${indent}rem` }} />
                        )}
                        <a
                          href={`#${heading.id}`}
                          className={`toc-link ${isActive ? 'active' : ''}`}
                          data-id={heading.id}
                          onClick={(e) => scrollToHeading(e, heading)}
                        >
                          {heading.text}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

TocNew.displayName = 'TocNew'
