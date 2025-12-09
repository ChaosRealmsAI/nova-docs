# EmptyNodeMenu 组件

基于 `empty-node-menu.html` 一比一复刻的空节点加号菜单组件。

## 功能特性

- ✅ 基础块 - 图标网格显示（H1-H3, 列表, Code, Quote 等）
- ✅ 常用块 - 列表显示（表格, 分栏, 高亮块）
- ✅ 支持暗黑模式
- ✅ 顶部和底部呼吸间距
- ✅ 点击选择块类型

## 使用示例

```tsx
import { EmptyNodeMenu } from '@/domain-editor/shared/ui'

function MyEditor() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const handlePlusClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({ x: rect.left, y: rect.bottom + 8 })
    setMenuOpen(true)
  }

  return (
    <>
      <button onClick={handlePlusClick}>
        + 添加块
      </button>

      <EmptyNodeMenu
        open={menuOpen}
        position={menuPosition}
        onClose={() => setMenuOpen(false)}
        onSelect={(type) => {
          console.log('选择块类型:', type)
          // 执行创建块逻辑
        }}
      />
    </>
  )
}
```

## Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `open` | `boolean` | `false` | 是否显示菜单 |
| `position` | `{ x: number; y: number }` | `{ x: 0, y: 0 }` | 菜单位置 |
| `onClose` | `() => void` | - | 关闭菜单回调 |
| `onSelect` | `(type: string) => void` | - | 块类型选择回调 |

## 块类型

### 基础块（图标网格）

- `heading1` - 标题 1
- `heading2` - 标题 2
- `heading3` - 标题 3
- `numberedList` - 有序列表
- `bulletList` - 无序列表
- `todoList` - 待办列表
- `code` - 代码块
- `quote` - 引用

### 常用块（列表）

- `table` - 表格
- `columns` - 分栏
- `callout` - 高亮块

## 样式

组件样式文件 `empty-node-menu.css` 会自动导入。支持暗黑模式（通过 `.dark` 类名）。

## 布局说明

- 基础块使用 6 列网格布局，每个图标 24x24px
- 常用块使用列表布局，每项高度 28px
- 顶部间距 12px，底部间距 8-12px
- 菜单宽度固定 265px
