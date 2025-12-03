import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom', // 使用 happy-dom 提供浏览器环境
  },
  resolve: {
    alias: {
      '@nova/infrastructure': path.resolve(__dirname, '../../../../../infrastructure'),
      '@nova/domain-editor': path.resolve(__dirname, '../../..'),
      '@nova/shared': path.resolve(__dirname, '../../../../../shared'),
    },
  },
})
