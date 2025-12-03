/**
 * useSelectionToolbar Hook
 *
 * 监听编辑器选区变化，控制工具栏显示和位置
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Editor } from '@tiptap/core'
import type { FormatType } from './SelectionToolbar'

export interface SelectionToolbarState {
  /** 是否显示工具栏 */
  open: boolean
  /** 工具栏位置 */
  position: { x: number; y: number }
  /** 当前激活的格式 */
  activeFormats: FormatType[]
}

export interface UseSelectionToolbarOptions {
  /** TipTap 编辑器实例 */
  editor: Editor | null
  /** 工具栏距离选区顶部的偏移量 */
  offsetY?: number
}

export interface UseSelectionToolbarReturn extends SelectionToolbarState {
  /** 关闭工具栏 */
  close: () => void
  /** 格式化文本 */
  format: (type: FormatType) => void
  /** 设置颜色 */
  setColor: (color: string, isBackground: boolean) => void
}

/**
 * 检测当前选区的激活格式
 */
function detectActiveFormats(editor: Editor): FormatType[] {
  const formats: FormatType[] = []

  if (editor.isActive('bold')) formats.push('bold')
  if (editor.isActive('italic')) formats.push('italic')
  if (editor.isActive('underline')) formats.push('underline')
  if (editor.isActive('strike')) formats.push('strike')
  if (editor.isActive('code')) formats.push('code')

  return formats
}

/**
 * 计算工具栏位置（居中于选区上方）
 */
function calculatePosition(
  editor: Editor,
  offsetY: number
): { x: number; y: number } | null {
  const { view, state } = editor
  const { selection } = state

  // 空选区不显示
  if (selection.empty) return null

  // 获取选区的 DOM 坐标
  const { from, to } = selection
  const start = view.coordsAtPos(from)
  const end = view.coordsAtPos(to)

  // 计算选区中心
  const centerX = (start.left + end.right) / 2

  // 工具栏显示在选区上方
  const topY = Math.min(start.top, end.top) - offsetY

  return {
    x: centerX,
    y: topY + window.scrollY, // 加上滚动偏移
  }
}

/**
 * 检查选区是否为有效的文本选区
 */
function isValidTextSelection(editor: Editor): boolean {
  const { state } = editor
  const { selection } = state

  // 空选区
  if (selection.empty) return false

  // 检查是否是 NodeSelection（整个节点被选中）
  // 这种情况下不应该显示文本格式工具栏
  if (selection.node) return false

  // 检查选区内容是否有文本
  const { from, to } = selection
  let hasText = false
  state.doc.nodesBetween(from, to, (node) => {
    if (node.isText) {
      hasText = true
      return false // 停止遍历
    }
  })

  return hasText
}

export function useSelectionToolbar({
  editor,
  offsetY = 50,
}: UseSelectionToolbarOptions): UseSelectionToolbarReturn {
  const [state, setState] = useState<SelectionToolbarState>({
    open: false,
    position: { x: 0, y: 0 },
    activeFormats: [],
  })

  // 防止闪烁的延迟关闭
  const closeTimeoutRef = useRef<number | null>(null)

  // 关闭工具栏
  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }))
  }, [])

  // 更新工具栏状态
  const updateToolbar = useCallback(() => {
    if (!editor) return

    // 清除延迟关闭
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    // 检查是否有有效的文本选区
    if (!isValidTextSelection(editor)) {
      // 延迟关闭，避免点击工具栏时闪烁
      closeTimeoutRef.current = window.setTimeout(() => {
        setState((prev) => ({ ...prev, open: false }))
      }, 100)
      return
    }

    // 计算位置
    const position = calculatePosition(editor, offsetY)
    if (!position) {
      setState((prev) => ({ ...prev, open: false }))
      return
    }

    // 检测激活格式
    const activeFormats = detectActiveFormats(editor)

    setState({
      open: true,
      position,
      activeFormats,
    })
  }, [editor, offsetY])

  // 格式化文本
  const format = useCallback(
    (type: FormatType) => {
      if (!editor) return

      editor.chain().focus()

      switch (type) {
        case 'bold':
          editor.chain().toggleBold().run()
          break
        case 'italic':
          editor.chain().toggleItalic().run()
          break
        case 'underline':
          editor.chain().toggleUnderline().run()
          break
        case 'strike':
          editor.chain().toggleStrike().run()
          break
        case 'code':
          editor.chain().toggleCode().run()
          break
      }

      // 更新激活状态
      setTimeout(() => {
        if (editor) {
          setState((prev) => ({
            ...prev,
            activeFormats: detectActiveFormats(editor),
          }))
        }
      }, 0)
    },
    [editor]
  )

  // 设置颜色
  const setColor = useCallback(
    (color: string, isBackground: boolean) => {
      if (!editor) return

      if (isBackground) {
        // 背景色使用 highlight mark
        if (color === 'transparent') {
          editor.chain().focus().unsetHighlight().run()
        } else {
          editor.chain().focus().setHighlight({ color }).run()
        }
      } else {
        // 文字颜色使用 textStyle
        if (color === '#37352f') {
          editor.chain().focus().unsetColor().run()
        } else {
          editor.chain().focus().setColor(color).run()
        }
      }
    },
    [editor]
  )

  // 监听编辑器选区变化
  useEffect(() => {
    if (!editor) return

    // 初始更新
    updateToolbar()

    // 监听选区变化
    const handleSelectionUpdate = () => {
      updateToolbar()
    }

    // 监听事务（包括选区变化）
    const handleTransaction = () => {
      updateToolbar()
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('transaction', handleTransaction)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      editor.off('transaction', handleTransaction)

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [editor, updateToolbar])

  return {
    ...state,
    close,
    format,
    setColor,
  }
}
