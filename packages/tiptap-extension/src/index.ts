/**
 * @nova/tiptap-extension
 *
 * 完整的 Tiptap 扩展包，包含：
 * - 节点扩展 (Callout, Mermaid, Multi-column, Heading, Table)
 * - 插件扩展 (UniqueId, DragHandle, DragGuideline)
 * - 预设配置 (Basic, Full)
 *
 * @example
 * ```typescript
 * import { createFullPreset } from '@nova/tiptap-extension'
 * import '@nova/tiptap-extension/style.css'
 *
 * const editor = useEditor({
 *   extensions: createFullPreset()
 * })
 * ```
 */

// 导入所有样式，tsup 会将其打包到 dist/index.css
import './styles/index.css'

// ============ Presets ============
export { createBasicPreset, createFullPreset } from './presets'

// ============ Node Extensions ============

// Callout
export { CalloutExtension } from './nodes/callout'
export type { CalloutTheme, CalloutAttrs } from './nodes/callout/model'

// Mermaid
export { MermaidExtension } from './nodes/mermaid'

// Multi-column
export { ColumnsExtension, ColumnExtension } from './nodes/multi-column'
export type { ColumnsAttributes, ColumnAttributes } from './nodes/multi-column/model'

// Heading Structure
export { HeadingStructureExtension } from './nodes/heading-structure'

// Table
export { createTableExtensions } from './nodes/table'

// ============ Plugin Extensions ============

// Unique ID
export { createUniqueIdExtension } from './plugins/unique-id'

// Drag Handle
export {
  HandleDisplayExtension,
  DRAGGABLE_NODE_TYPES
} from './plugins/drag-handle'

// Drag Guidelines
export { HorizontalDragGuidelineV1Extension } from './plugins/drag-guideline-horizontal'
export { VerticalDragGuidelineExtension } from './plugins/drag-guideline-vertical'

// ============ Shared Components ============
export { CodeBlockComponent } from './shared/code-block'

// ============ Theme System ============
export {
  // Types
  type ThemeMode,
  type ColorScheme,
  type ThemeConfig,
  type ThemePreset,
  type ThemeVariables,
  // Presets
  THEME_PRESETS,
  // Service
  ThemeService,
  // React Integration
  ThemeProvider,
  useTheme,
  // Components
  ColorSchemePicker,
} from './theme'
