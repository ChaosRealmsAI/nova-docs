import { Extension } from '@tiptap/core'
import { loggers } from '@nova/infrastructure/logger'
import {
  DEFAULT_VERTICAL_GUIDELINE_OPTIONS,
  type VerticalGuidelineOptions,
  type VerticalGuidelineStorage,
} from '../model'
import { createVerticalGuidelinePlugin } from '../view'

import '../style/vertical-drag-guideline.css'

/**
 * VerticalDragGuidelineExtension
 *
 * 仅负责竖向拖拽引导线（列边缘 + 编辑器边缘），
 * 与现有横线逻辑完全独立，可随时从配置中移除。
 */
export const VerticalDragGuidelineExtension = Extension.create<
  VerticalGuidelineOptions,
  VerticalGuidelineStorage
>({
  name: 'verticalDragGuideline',

  addOptions() {
    return DEFAULT_VERTICAL_GUIDELINE_OPTIONS
  },

  addStorage(): VerticalGuidelineStorage {
    return {
      view: null,
    }
  },

  addProseMirrorPlugins() {
    const options = { ...DEFAULT_VERTICAL_GUIDELINE_OPTIONS, ...this.options }
    const storage = this.storage

    loggers.dragGuideline.debug('VerticalDragGuidelineExtension loaded', {
      options,
    })

    return [createVerticalGuidelinePlugin(options, storage)]
  },
})

