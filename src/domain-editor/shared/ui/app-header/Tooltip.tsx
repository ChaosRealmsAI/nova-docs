import React, { useState, useRef, useEffect } from 'react'
import './tooltip.css'

interface TooltipProps {
  content: string
  children: React.ReactElement
  disabled?: boolean
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, disabled = false }) => {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number; transform: string }>({
    top: 0,
    left: 0,
    transform: '',
  })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = triggerRect.bottom + 8
    let left = triggerRect.left + triggerRect.width / 2
    let transform = 'translateX(-50%)'

    // 检查右侧是否会超出
    const rightOverflow = left + tooltipRect.width / 2 > viewportWidth - 10
    // 检查左侧是否会超出
    const leftOverflow = left - tooltipRect.width / 2 < 10

    if (rightOverflow) {
      // 靠右对齐
      left = triggerRect.right
      transform = 'translateX(-100%)'
    } else if (leftOverflow) {
      // 靠左对齐
      left = triggerRect.left
      transform = 'translateX(0)'
    }

    // 检查底部是否会超出（如果超出，显示在上方）
    if (top + tooltipRect.height > viewportHeight - 10) {
      top = triggerRect.top - tooltipRect.height - 8
    }

    setPosition({ top, left, transform })
  }

  useEffect(() => {
    if (visible) {
      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)
      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition, true)
      }
    }
  }, [visible])

  const handleMouseEnter = () => {
    if (!disabled) {
      setVisible(true)
    }
  }

  const handleMouseLeave = () => {
    setVisible(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {visible && !disabled && (
        <div
          ref={tooltipRef}
          className="smart-tooltip"
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: position.transform,
            zIndex: 99999,
          }}
        >
          {content}
        </div>
      )}
    </>
  )
}
