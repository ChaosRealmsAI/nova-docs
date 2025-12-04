import type { EditorView } from '@tiptap/pm/view'
import { loggers } from '@nova/infrastructure/logger'
import type {
  VerticalGuidelineOptions,
  VerticalGuidelineSide,
  VerticalGuidelineState,
} from '../model'
import { createTwoColumnLayoutAt } from './vertical-drop/createTwoColumnLayout'

/**
 * VerticalDropExecutor
 *
 * 最小实现版：仅处理「编辑器边缘竖线 + 非多列容器」场景，
 * 即把拖拽源与目标块合并为一个两列布局。
 *
 * 后续可以按 DropExecutor 的模式扩展：
 * - 支持在 columns 内添加新列
 * - 支持更多安全校验和日志
 */
export class VerticalDropExecutor {
  constructor(private readonly options: Required<VerticalGuidelineOptions>) {}

  execute(
    view: EditorView,
    event: DragEvent,
    getState: () => VerticalGuidelineState | undefined,
  ): boolean {
    const state = getState()
    loggers.dragGuideline.debug('[VerticalDropExecutor] executing with state:', state)

    // 支持两种模式：editor-border 和 columns-edge
    if (!state || !state.isVisible) {
      loggers.dragGuideline.debug('[VerticalDropExecutor] Failed: state empty or not visible')
      return false
    }

    if (state.mode !== 'editor-border' && state.mode !== 'columns-edge') {
      loggers.dragGuideline.debug('[VerticalDropExecutor] Failed: mode mismatch', state.mode)
      return false
    }

    if (!view.dragging) {
      loggers.dragGuideline.debug('[VerticalDropExecutor] skip: no dragging data on view')
      return false
    }

    const { debug } = this.options

    if (debug) {
      loggers.dragGuideline.debug('VerticalDropExecutor: drop with state', {
        mode: state.mode,
        side: state.side,
        targetNodePos: state.targetNodePos,
        targetColumnIndex: state.targetColumnIndex,
        isInsideColumns: state.isInsideColumns,
      })
    }

    if (state.targetNodePos == null || !state.side) {
      loggers.dragGuideline.debug('[VerticalDropExecutor] skip: missing targetNodePos or side', {
        targetNodePos: state.targetNodePos,
        side: state.side,
      })
      return false
    }

    try {
      const side: VerticalGuidelineSide = state.side
      const insertAfterIndex = state.targetColumnIndex
      const handled = createTwoColumnLayoutAt(view, state.targetNodePos, side, insertAfterIndex)

      if (handled) {
        // 成功处理后清除 dragging 状态，阻止默认 drop
        view.dragging = null
        event.preventDefault()
        event.stopPropagation()
        if (debug) {
          loggers.dragGuideline.debug('VerticalDropExecutor: created two-column layout')
        }
        return true
      }
    } catch (error) {
      loggers.dragGuideline.error('VerticalDropExecutor: failed to handle drop', { error })
    }

    loggers.dragGuideline.debug('[VerticalDropExecutor] finished: drop not handled, fallback to default')
    return false
  }
}
