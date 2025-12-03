import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
  },
  resolve: {
    alias: {
      '@nova/infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@nova/domain-editor': path.resolve(__dirname, 'src/domain-editor'),
      '@nova/shared': path.resolve(__dirname, 'src/shared'),
    },
  },
})
