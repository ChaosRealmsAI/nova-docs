import { NodeViewWrapper } from '@tiptap/react'
import mermaid from 'mermaid'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '@nova/shared/i18n'
import './styles.css'

export interface MermaidComponentProps {
  node: {
    attrs: Record<string, any>
  }
  updateAttributes: (attrs: Record<string, any>) => void
  extension: any
  editor: any
  getPos: () => number
}

/**
 * 获取节点 ID（与 HandleView 中的逻辑保持一致）
 */
function getNodeId(node: { attrs: Record<string, any> }, pos: number): string {
  return node.attrs.id || `node-${pos}`
}

type ViewMode = 'code' | 'split' | 'preview'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
})

export const MermaidComponent: React.FC<MermaidComponentProps> = ({
  node,
  updateAttributes,
  editor,
  getPos,
}) => {
  const { t } = useI18n()
  const [code, setCode] = useState(node.attrs.code || '')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [svg, setSvg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`).current

  /**
   * 处理鼠标进入容器 - 通知 HandleView 显示句柄
   */
  const handleMouseEnter = useCallback(() => {
    const handleView = editor?.storage?.handleDisplay?.handleView
    if (handleView) {
      const pos = getPos()
      const nodeId = getNodeId(node, pos)
      handleView.showHandleByNodeId(nodeId)
    }
  }, [editor, node, getPos])

  /**
   * 处理鼠标离开容器
   * 注意：不在这里隐藏句柄，让 HandleDisplayExtension 的 mousemove 处理器来决定
   * 这样可以避免鼠标移动到句柄时句柄消失的问题
   */
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    const handleView = editor?.storage?.handleDisplay?.handleView
    if (!handleView) return

    // 检查鼠标是否移动到了句柄区域
    const relatedTarget = e.relatedTarget as HTMLElement | null
    if (relatedTarget?.closest('.drag-handle')) {
      // 移动到句柄上，不隐藏
      return
    }

    // 延迟隐藏，给 HandleDisplayExtension 的逻辑一些时间来接管
    setTimeout(() => {
      const pos = getPos()
      const nodeId = getNodeId(node, pos)
      // 只有当当前显示的还是这个节点的句柄时才隐藏
      if (handleView.getCurrentNodeId() === nodeId) {
        handleView.hideAllHandles()
      }
    }, 50)
  }, [editor, node, getPos])

  // 渲染函数
  const renderDiagram = useCallback(async (codeToRender: string) => {
    if (!codeToRender) {
      setSvg('')
      return
    }
    try {
      const existingElement = document.getElementById(id)
      if (existingElement) existingElement.remove()

      const { svg } = await mermaid.render(id, codeToRender)
      setSvg(svg)
      setError(null)
    } catch (e) {
      console.error('Mermaid rendering error:', e)
      setError('Syntax Error')
    }
  }, [id])

  // 实时渲染 (带防抖)
  useEffect(() => {
    const timer = setTimeout(() => {
      renderDiagram(code)
      // 同时更新节点属性，保持数据同步
      if (code !== node.attrs.code) {
        updateAttributes({ code })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [code, renderDiagram, updateAttributes, node.attrs.code])

  return (
    <NodeViewWrapper className="mermaid-node-view" data-type="mermaid">
      <div
        className="mermaid-container"
        data-type="mermaid"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Toolbar */}
        <div className="mermaid-toolbar">
          <div className="mermaid-title">
            <span>📊</span> {t('editorMermaidTitle')}
          </div>
          <div className="mermaid-mode-group">
            <button 
              className={`mermaid-mode-btn ${viewMode === 'code' ? 'active' : ''}`}
              onClick={() => setViewMode('code')}
            >
              {t('editorMermaidCode')}
            </button>
            <button 
              className={`mermaid-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
            >
              {t('editorMermaidSplit')}
            </button>
            <button 
              className={`mermaid-mode-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
            >
              {t('editorMermaidPreview')}
            </button>
          </div>
        </div>

        {/* Content Area - Always Visible */}
        <div className={`mermaid-content-wrapper mode-${viewMode}`}>
          {/* Editor Pane */}
          <div className="mermaid-pane mermaid-editor-pane">
            <textarea
              className="mermaid-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              placeholder={t('editorMermaidPlaceholder')}
            />
          </div>

          {/* Preview Pane */}
          <div className="mermaid-pane mermaid-preview-pane">
            {error ? (
              <div className="text-red-500 text-sm p-4 text-center">
                <div className="font-bold mb-2">{t('editorMermaidRenderError')}</div>
                {error === 'Syntax Error' ? t('editorMermaidSyntaxError') : error}
              </div>
            ) : (
              <div 
                className="mermaid-svg-wrapper"
                dangerouslySetInnerHTML={{ __html: svg }} 
              />
            )}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
