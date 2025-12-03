import { beforeEach, describe, expect, it } from 'vitest'
import { Window } from 'happy-dom'
import { ColumnHotzoneDetector } from '../service/ColumnHotzoneDetector'

describe('Vertical ColumnHotzoneDetector', () => {
  let windowInstance: Window

  beforeEach(() => {
    windowInstance = new Window()
    globalThis.window = windowInstance as unknown as Window & typeof globalThis.window
    globalThis.document = windowInstance.document as unknown as Document
  })

  const createContainer = () => {
    const container = document.createElement('div')
    container.className = 'columns-container-grid'
    container.getBoundingClientRect = () => new windowInstance.DOMRect(0, 0, 600, 400)

    const columnA = document.createElement('div')
    columnA.setAttribute('data-type', 'column')
    columnA.getBoundingClientRect = () => new windowInstance.DOMRect(0, 0, 200, 400)

    const columnB = document.createElement('div')
    columnB.setAttribute('data-type', 'column')
    columnB.getBoundingClientRect = () => new windowInstance.DOMRect(200, 0, 200, 400)

    const columnC = document.createElement('div')
    columnC.setAttribute('data-type', 'column')
    columnC.getBoundingClientRect = () => new windowInstance.DOMRect(400, 0, 200, 400)

    container.append(columnA, columnB, columnC)
    document.body.appendChild(container)
    return container
  }

  it('does NOT detect left edge hotzone (handled by editor border)', () => {
    createContainer()
    const detector = new ColumnHotzoneDetector({ columnHotzoneThreshold: 30 })
    const result = detector.detect(5, 200, document.body as HTMLElement)
    // 左边缘由编辑器边缘拖拽处理，不在此检测
    expect(result).toBeNull()
  })

  it('does NOT detect right edge hotzone (handled by editor border)', () => {
    createContainer()
    const detector = new ColumnHotzoneDetector({ columnHotzoneThreshold: 30 })
    const result = detector.detect(595, 200, document.body as HTMLElement)
    // 右边缘由编辑器边缘拖拽处理，不在此检测
    expect(result).toBeNull()
  })

  it('detects gap hotzone between column A and B', () => {
    createContainer()
    const detector = new ColumnHotzoneDetector({ columnHotzoneThreshold: 30 })
    // 列 A (0-200) 和列 B (200-400) 之间的 gap 中心是 200
    const result = detector.detect(200, 200, document.body as HTMLElement)
    expect(result).toMatchObject({
      type: 'gap',
      columnIndex: 0,
    })
  })

  it('detects gap hotzone between column B and C', () => {
    createContainer()
    const detector = new ColumnHotzoneDetector({ columnHotzoneThreshold: 30 })
    // 列 B (200-400) 和列 C (400-600) 之间的 gap 中心是 400
    const result = detector.detect(400, 200, document.body as HTMLElement)
    expect(result).toMatchObject({
      type: 'gap',
      columnIndex: 1,
    })
  })

  it('returns null when mouse is inside column (not in gap)', () => {
    createContainer()
    const detector = new ColumnHotzoneDetector({ columnHotzoneThreshold: 30 })
    // 鼠标在列 B 的中间，不在任何热区内
    const result = detector.detect(300, 200, document.body as HTMLElement)
    expect(result).toBeNull()
  })
})

