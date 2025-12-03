import { PluginKey } from '@tiptap/pm/state'
import type {
  VerticalGuidelineOptions,
  VerticalGuidelineState,
  VerticalGuidelineMode,
} from './types'

export const VERTICAL_DRAG_GUIDELINE_PLUGIN_KEY =
  new PluginKey<VerticalGuidelineState>('vertical-drag-guideline')

export const DEFAULT_VERTICAL_GUIDELINE_OPTIONS: Required<VerticalGuidelineOptions> = {
  columnContainerSelector: '.columns-container-grid',
  columnSelector: '[data-type="column"]',
  columnHotzoneThreshold: 24,
  // 默认不启用列容器内部的竖线，仅在编辑器边缘显示竖线
  enableColumnGuideline: false,
  enableEditorBorderGuideline: true,
  editorBorderHorizontalThreshold: 1000,
  editorBorderVerticalTolerance: 50,
  debug: false,
}

export const VERTICAL_GUIDELINE_CLASS = 'syllo-vert-guideline'
export const VERTICAL_GUIDELINE_COLUMN_EDGE_CLASS = 'syllo-vert-guideline--columns-edge'
export const VERTICAL_GUIDELINE_EDITOR_BORDER_CLASS = 'syllo-vert-guideline--editor-border'

export const INITIAL_VERTICAL_GUIDELINE_MODE: VerticalGuidelineMode = 'none'

export const INITIAL_VERTICAL_GUIDELINE_STATE: VerticalGuidelineState = {
  mode: INITIAL_VERTICAL_GUIDELINE_MODE,
  isVisible: false,
  edgeX: null,
  top: null,
  bottom: null,
  side: null,
  hotzoneType: null,
  targetColumnIndex: null,
  targetNodePos: null,
  isInsideColumns: false,
}
