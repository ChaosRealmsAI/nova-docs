import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@nova/infrastructure/logger': resolve(__dirname, '../../src/infrastructure/logger/src'),
      '@nova/infrastructure': resolve(__dirname, '../../src/infrastructure'),
      '@nova/shared': resolve(__dirname, '../../src/shared'),
      '@nova/domain-editor': resolve(__dirname, '../../src/domain-editor'),
    },
    dedupe: ['react', 'react-dom', '@tiptap/core', '@tiptap/pm'],
  },
  server: {
    fs: {
      allow: [resolve(__dirname, '..', '..')],
    },
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
})
