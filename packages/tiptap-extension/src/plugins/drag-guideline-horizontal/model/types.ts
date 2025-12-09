import type { EditorView } from '@tiptap/pm/view'

/**
 * 横向拖拽引导线配置
 */
export interface HorizontalGuidelineOptions {
  /** 横线厚度（px） */
  thickness?: number
  /** 是否输出调试日志 */
  debug?: boolean
}

/**
 * 横向拖拽引导线插件状态
 */
export interface HorizontalGuidelineState {
  /** 是否显示横线 */
  isVisible: boolean
  /** 线条左边界（viewport 坐标） */
  left: number | null
  /** 线条右边界（viewport 坐标） */
  right: number | null
  /** 线条顶部（viewport 坐标） */
  top: number | null
  /** 线条底部（viewport 坐标） */
  bottom: number | null
  /** 调试信息（可选） */
  reason?: string
}

export interface HorizontalGuidelineStorage {
  view: EditorView | null
}

