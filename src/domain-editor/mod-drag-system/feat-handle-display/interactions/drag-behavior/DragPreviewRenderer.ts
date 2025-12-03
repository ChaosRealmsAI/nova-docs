const CRITICAL_STYLES = [
  'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing',
  'text-align', 'text-decoration', 'text-transform', 'text-indent',
  'color', 'background', 'background-color', 'background-image', 'background-size',
  'background-position', 'background-repeat',
  'border', 'border-width', 'border-style', 'border-color', 'border-radius', 'outline',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap',
  'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
  'grid-template-columns', 'grid-template-rows', 'grid-gap',
  'list-style', 'list-style-type', 'list-style-position', 'list-style-image',
  'opacity', 'box-shadow', 'transform', 'overflow', 'overflow-x', 'overflow-y',
  'white-space', 'word-break', 'word-wrap',
  'position', 'top', 'right', 'bottom', 'left', 'z-index',
  'vertical-align', 'box-sizing'
]

export interface DragPreviewOptions {
  maxWidth?: number
  maxHeight?: number
  opacity?: number
}

export interface DragPreviewResult {
  element: HTMLElement
  cleanup: () => void
}

export class DragPreviewRenderer {
  create(source: HTMLElement, options: DragPreviewOptions = {}): DragPreviewResult {
    const clone = this.cloneElement(source)
    const rect = source.getBoundingClientRect()

    // 使用实际渲染尺寸，确保完整显示
    const width = Math.max(
      rect.width,
      source.offsetWidth,
      source.scrollWidth
    )
    const height = Math.max(
      rect.height,
      source.offsetHeight,
      source.scrollHeight
    )

    // 确保克隆元素保持原始尺寸和样式
    clone.style.width = `${width}px`
    clone.style.height = height > 0 ? `${height}px` : 'auto'
    clone.style.opacity = String(options.opacity ?? 1)
    clone.style.pointerEvents = 'none'
    clone.style.margin = '0'
    clone.style.boxSizing = 'border-box'
    clone.style.overflow = 'visible'
    // 强制显示为块级元素，保持布局
    clone.style.display = window.getComputedStyle(source).display || 'block'

    // 创建容器，确保能完整包含内容
    const container = document.createElement('div')
    container.dataset.dragPreview = 'true'
    container.style.position = 'fixed'
    container.style.top = '-10000px'
    container.style.left = '-10000px'
    container.style.width = `${width}px`
    container.style.height = `${height}px`
    container.style.pointerEvents = 'none'
    container.style.zIndex = '2147483647'
    container.style.boxSizing = 'border-box'
    container.style.overflow = 'visible'

    // 复制根元素的字体和主题变量到容器
    this.copyRootStyles(container)

    container.appendChild(clone)
    document.body.appendChild(container)

    return {
      element: container,
      cleanup: () => {
        container.remove()
      }
    }
  }

  /**
   * 复制根元素的全局样式到容器
   */
  private copyRootStyles(container: HTMLElement) {
    const rootStyles = window.getComputedStyle(document.documentElement)
    const bodyStyles = window.getComputedStyle(document.body)

    // 复制根元素的 CSS 变量
    for (let i = 0; i < rootStyles.length; i++) {
      const prop = rootStyles[i]
      if (prop.startsWith('--')) {
        const value = rootStyles.getPropertyValue(prop)
        if (value) {
          container.style.setProperty(prop, value)
        }
      }
    }

    // 复制 body 的字体设置
    const fontProps = ['font-family', 'font-size', 'line-height', 'color']
    fontProps.forEach(prop => {
      const value = bodyStyles.getPropertyValue(prop)
      if (value) {
        container.style.setProperty(prop, value)
      }
    })
  }

  private cloneElement(source: HTMLElement): HTMLElement {
    const clone = source.cloneNode(true) as HTMLElement

    // 移除交互元素，但保留它们的视觉样式
    const unwanted = clone.querySelectorAll('input, textarea, select')
    unwanted.forEach(el => {
      // 将交互元素替换为 div，保留视觉效果
      const replacement = document.createElement('div')
      const original = el as HTMLElement
      replacement.className = original.className
      replacement.textContent = original.textContent
      original.parentNode?.replaceChild(replacement, original)
    })

    // 禁用按钮，但保留视觉效果
    const buttons = clone.querySelectorAll('button')
    buttons.forEach(btn => {
      btn.disabled = true
      ;(btn as HTMLButtonElement).style.pointerEvents = 'none'
    })

    this.copyStyles(source, clone)
    return clone
  }

  private copyStyles(source: HTMLElement, target: HTMLElement) {
    const computed = window.getComputedStyle(source)

    // 复制标准样式
    CRITICAL_STYLES.forEach(prop => {
      const value = computed.getPropertyValue(prop)
      // 复制所有有意义的值
      if (value) {
        target.style.setProperty(prop, value)
      }
    })

    // 复制所有 CSS 变量（以 -- 开头）
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i]
      if (prop.startsWith('--')) {
        const value = computed.getPropertyValue(prop)
        if (value) {
          target.style.setProperty(prop, value)
        }
      }
    }

    // 复制 class 和 data 属性（保留样式钩子）
    if (source.className && !target.className) {
      target.className = source.className
    }
    Array.from(source.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && !target.hasAttribute(attr.name)) {
        target.setAttribute(attr.name, attr.value)
      }
    })

    // 特殊处理：确保 SVG 元素正确显示
    if (source instanceof SVGElement && target instanceof SVGElement) {
      this.copySVGAttributes(source, target)
    }

    // 递归复制子元素样式
    const sourceChildren = Array.from(source.children)
    const targetChildren = Array.from(target.children)
    sourceChildren.forEach((child, index) => {
      const targetChild = targetChildren[index]
      if (child instanceof HTMLElement && targetChild instanceof HTMLElement) {
        this.copyStyles(child, targetChild)
      } else if (child instanceof SVGElement && targetChild instanceof SVGElement) {
        this.copySVGAttributes(child, targetChild)
      }
    })
  }

  /**
   * 复制 SVG 元素的特殊属性
   */
  private copySVGAttributes(source: SVGElement, target: SVGElement) {
    const svgAttrs = ['fill', 'stroke', 'stroke-width', 'viewBox', 'width', 'height', 'xmlns']
    svgAttrs.forEach(attr => {
      const value = source.getAttribute(attr)
      if (value && !target.hasAttribute(attr)) {
        target.setAttribute(attr, value)
      }
    })

    // 复制 SVG 的计算样式
    const computed = window.getComputedStyle(source)
    const svgStyleProps = ['fill', 'stroke', 'stroke-width', 'opacity', 'color']
    svgStyleProps.forEach(prop => {
      const value = computed.getPropertyValue(prop)
      if (value) {
        target.style.setProperty(prop, value)
      }
    })
  }
}
