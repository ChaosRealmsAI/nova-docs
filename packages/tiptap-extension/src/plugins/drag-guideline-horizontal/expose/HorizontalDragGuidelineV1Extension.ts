import { Extension } from '@tiptap/core'
import { loggers } from '@/infrastructure/logger'
import {
  DEFAULT_HORIZONTAL_GUIDELINE_OPTIONS,
  type HorizontalGuidelineOptions,
  type HorizontalGuidelineStorage,
} from '../model'
import { createHorizontalGuidelinePlugin } from '../view'

/**
 * HorizontalDragGuidelineV1Extension
 *
 * 基于历史实现的横向拖拽引导线（只做视觉，不做 drop）。
 */
export const HorizontalDragGuidelineV1Extension = Extension.create<
  HorizontalGuidelineOptions,
  HorizontalGuidelineStorage
>({
  name: 'horizontalDragGuidelineV1',

  addOptions() {
    return DEFAULT_HORIZONTAL_GUIDELINE_OPTIONS
  },

  addStorage(): HorizontalGuidelineStorage {
    return {
      view: null,
    }
  },

  addProseMirrorPlugins() {
    const options = { ...DEFAULT_HORIZONTAL_GUIDELINE_OPTIONS, ...this.options }
    const storage = this.storage

    loggers.dragGuideline.debug('HorizontalDragGuidelineV1Extension loaded', { options })

    return [createHorizontalGuidelinePlugin(options, storage)]
  },
})

