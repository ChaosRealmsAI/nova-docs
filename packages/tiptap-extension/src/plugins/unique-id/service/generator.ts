/**
 * 检查环境是否支持原生 crypto.randomUUID
 */
const hasNativeRandomUUID = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'

/**
 * 生成唯一 ID
 * 优先使用原生 crypto.randomUUID()，否则使用 timestamp + random 组合
 *
 * @returns 唯一 ID 字符串
 *
 * @example
 * const id = generateUniqueId()
 * // 支持 crypto.randomUUID: "550e8400-e29b-41d4-a716-446655440000"
 * // 不支持时: "node-lq2x9z8c-abc123"
 */
export function generateUniqueId(): string {
  if (hasNativeRandomUUID) {
    return crypto.randomUUID()
  }

  // 降级方案：使用 timestamp + random
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 10)
  return `node-${timestamp}-${random}`
}
