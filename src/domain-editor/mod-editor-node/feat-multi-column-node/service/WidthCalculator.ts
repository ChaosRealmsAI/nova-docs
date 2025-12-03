/**
 * 列宽计算器
 *
 * 职责：计算拖拽时的列宽调整
 */

import {
  MIN_COLUMN_WIDTH,
  type ColumnWidths,
  type WidthCalculationParams,
  type WidthCalculationResult,
} from '../model'

export class WidthCalculator {
  /**
   * 计算调整后的列宽
   *
   * 规则：
   * 1. 只调整相邻两列
   * 2. 最小宽度不低于 MIN_COLUMN_WIDTH
   * 3. 总和保持 100%
   */
  static calculateResizedWidths(
    params: WidthCalculationParams
  ): WidthCalculationResult {
    const { deltaX, containerWidth, currentWidths, leftIndex, rightIndex } = params

    // 计算拖拽的百分比变化
    const deltaPercent = (deltaX / containerWidth) * 100

    // 获取原始宽度
    const leftWidth = currentWidths[leftIndex]
    const rightWidth = currentWidths[rightIndex]

    // 计算新宽度
    let newLeftWidth = leftWidth + deltaPercent
    let newRightWidth = rightWidth - deltaPercent

    // 应用最小宽度限制
    if (newLeftWidth < MIN_COLUMN_WIDTH) {
      newLeftWidth = MIN_COLUMN_WIDTH
      newRightWidth = leftWidth + rightWidth - MIN_COLUMN_WIDTH
    } else if (newRightWidth < MIN_COLUMN_WIDTH) {
      newRightWidth = MIN_COLUMN_WIDTH
      newLeftWidth = leftWidth + rightWidth - MIN_COLUMN_WIDTH
    }

    // 检查是否发生变化
    const changed =
      Math.abs(newLeftWidth - leftWidth) > 0.1 ||
      Math.abs(newRightWidth - rightWidth) > 0.1

    if (!changed) {
      return { changed: false, newWidths: currentWidths }
    }

    // 构建新的宽度数组
    const newWidths = [...currentWidths]
    newWidths[leftIndex] = newLeftWidth
    newWidths[rightIndex] = newRightWidth

    return { changed: true, newWidths }
  }

  /**
   * 初始化列宽数组
   *
   * @param columnCount - 列数
   * @returns 均分的列宽数组
   */
  static initializeWidths(columnCount: number): ColumnWidths {
    const width = 100 / columnCount
    return Array(columnCount).fill(width)
  }

  /**
   * 添加列后重新计算宽度（均分）
   *
   * @param newColumnCount - 新的列数
   * @returns 均分的列宽数组
   */
  static widthsAfterAddColumn(newColumnCount: number): ColumnWidths {
    return this.initializeWidths(newColumnCount)
  }

  /**
   * 删除列后重新计算宽度（均分）
   *
   * @param newColumnCount - 新的列数
   * @returns 均分的列宽数组
   */
  static widthsAfterRemoveColumn(newColumnCount: number): ColumnWidths {
    return this.initializeWidths(newColumnCount)
  }

  /**
   * 检查是否需要同步宽度
   *
   * @param nodeWidths - 节点中的宽度
   * @param stateWidths - 状态中的宽度
   * @returns 是否需要同步
   */
  static shouldSyncWidths(
    nodeWidths: ColumnWidths | undefined,
    stateWidths: ColumnWidths
  ): boolean {
    if (!nodeWidths || nodeWidths.length === 0) {
      return false
    }

    if (nodeWidths.length !== stateWidths.length) {
      return true
    }

    return nodeWidths.some(
      (width, index) => Math.abs(width - stateWidths[index]) > 0.1
    )
  }
}
