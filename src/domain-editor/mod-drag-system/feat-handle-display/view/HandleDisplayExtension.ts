/**
 * Handle Display Extension
 *
 * TipTap 扩展 - 提供句柄展示功能
 */

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import type { HandleDisplayOptions, HoverResult } from '../model'
import { HOVER_THROTTLE_MS } from '../model'
import { HandleView } from './HandleView'
import { HoverDetector } from '../service'
import { loggers } from '@nova/infrastructure/logger'

export interface HandleDisplayStorage {
  /** Hover 状态 */
  hoverState: HoverResult | null
  /** HandleView 实例 */
  handleView: HandleView | null
}

export const HandleDisplay = Extension.create<HandleDisplayOptions, HandleDisplayStorage>({
  name: 'handleDisplay',

  addOptions() {
    return {
      enableHover: true,
      visibilityMode: 'default-hidden',
      offset: 50,
      draggableNodeTypes: undefined,
      draggableNodePaths: undefined
    }
  },

  addStorage(): HandleDisplayStorage {
    return {
      hoverState: null,
      handleView: null
    }
  },

  addProseMirrorPlugins() {
    loggers.handleDisplay.debug('🔌 Adding ProseMirror plugins', { options: this.options })

    const options = this.options
    const storage = this.storage

    // 🔧 创建单例 HoverDetector，避免每次 mousemove 都创建新实例
    const hoverDetector = new HoverDetector(
      HOVER_THROTTLE_MS,
      options.draggableNodeTypes,
      options.draggableNodePaths
    )
    loggers.handleDisplay.debug('✅ HoverDetector instance created (singleton)')

    // 辅助函数：检查状态是否变化
    const hasStateChanged = (oldState: HoverResult | null, newState: HoverResult | null): boolean => {
      if (!oldState && !newState) return false
      if (!oldState && newState) return true
      if (oldState && !newState) return true
      if (oldState && newState && oldState.nodeId !== newState.nodeId) return true
      return false
    }

    return [
      // 句柄渲染插件
      new Plugin({
        key: new PluginKey('handleDisplay'),

        view: (editorView: EditorView) => {
          loggers.handleDisplay.info('🎨 正在创建 HandleView 插件')

          const handleView = new HandleView(editorView, {
            visibilityMode: options.visibilityMode,
            offset: options.offset,
            draggableNodeTypes: options.draggableNodeTypes,
            draggableNodePaths: options.draggableNodePaths
          })

          // 保存到 storage 以便外部访问
          storage.handleView = handleView
          loggers.handleDisplay.info('✅ HandleView 已存储到 storage')

          return handleView
        }
      }),

      // Hover 检测插件
      // 性能优化：简化 mousemove 处理，移除冗余检查
      new Plugin({
        key: new PluginKey('handleDisplayHover'),

        props: {
          handleDOMEvents: {
            mousemove: (view: EditorView, event: MouseEvent) => {
              if (!options.enableHover || !view.editable) {
                return false
              }

              const handleView = storage.handleView
              if (!handleView) {
                return false
              }

              const target = event.target as HTMLElement | null

              // 鼠标直接在句柄上：保持当前状态
              const handleElement = target?.closest('.drag-handle') as HTMLElement | null
              if (handleElement) {
                const nodeId = handleElement.getAttribute('data-node-id')
                if (nodeId) {
                  handleView.showHandleByNodeId(nodeId)
                }
                return false
              }

              // 使用 HoverDetector 检测（内置节流）
              let result = hoverDetector.handleMouseMove(view, event)

              // 补救措施：如果探测器未检测到节点（例如鼠标在 Gutter 或 Margin 中），
              // 检查是否仍在当前激活的句柄或高亮区域附近
              if (!result) {
                const currentNodeId = handleView.getCurrentNodeId()
                if (currentNodeId && handleView.isPointerWithinActiveZone(event.clientX, event.clientY, 20)) {
                  // 保持当前状态，不隐藏
                  return false
                }
              }

              // 状态未变化时跳过
              const oldState = storage.hoverState
              if (!hasStateChanged(oldState, result)) {
                return false
              }

              storage.hoverState = result

              // 更新 UI
              if (result?.isDraggable) {
                handleView.showHandleByNodeId(result.nodeId)
              } else {
                handleView.hideAllHandles()
              }

              return false
            }
          }
        }
      })
    ]
  }
})
