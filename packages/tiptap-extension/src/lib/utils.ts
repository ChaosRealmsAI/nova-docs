/**
 * 工具函数
 */

/**
 * 合并 className
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
