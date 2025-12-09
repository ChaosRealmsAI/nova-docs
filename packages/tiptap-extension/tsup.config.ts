import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // 暂时禁用，有类型兼容问题
  clean: true,
  external: [
    // React
    'react',
    'react-dom',
    // Tiptap core
    '@tiptap/core',
    '@tiptap/react',
    '@tiptap/starter-kit',
    // ProseMirror (所有子模块)
    '@tiptap/pm',
    '@tiptap/pm/state',
    '@tiptap/pm/view',
    '@tiptap/pm/model',
    '@tiptap/pm/transform',
    '@tiptap/pm/commands',
    '@tiptap/pm/keymap',
    '@tiptap/pm/inputrules',
    '@tiptap/pm/gapcursor',
    '@tiptap/pm/schema-list',
    '@tiptap/pm/dropcursor',
    '@tiptap/pm/history',
    '@tiptap/pm/tables',
    // Tiptap 所有扩展 (必须 external 避免双重实例)
    /^@tiptap\/extension-.*/,
  ],
  noExternal: [],
  injectStyle: false,
  sourcemap: true,
})
