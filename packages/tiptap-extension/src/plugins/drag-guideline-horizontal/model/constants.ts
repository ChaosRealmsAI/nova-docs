import { PluginKey } from '@tiptap/pm/state'
import type { HorizontalGuidelineOptions, HorizontalGuidelineState } from './types'

export const HORIZONTAL_GUIDELINE_PLUGIN_KEY =
  new PluginKey<HorizontalGuidelineState>('horizontal-drag-guideline-v1')

export const DEFAULT_HORIZONTAL_GUIDELINE_OPTIONS: Required<HorizontalGuidelineOptions> = {
  thickness: 2,
  debug: false,
}

export const INITIAL_HORIZONTAL_GUIDELINE_STATE: HorizontalGuidelineState = {
  isVisible: false,
  left: null,
  right: null,
  top: null,
  bottom: null,
  reason: 'idle',
}

// 复用共享 drop-cursor 样式，颜色/动画与历史实现保持一致
export const HORIZONTAL_GUIDELINE_BASE_CLASS = 'syllo-dropcursor'
export const HORIZONTAL_GUIDELINE_HORIZONTAL_CLASS = 'syllo-dropcursor--horizontal'

