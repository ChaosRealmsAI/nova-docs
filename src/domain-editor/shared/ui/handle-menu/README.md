# HandleMenu 组件

基于 `handle-menu-complete.html` 一比一复刻的句柄右键菜单组件。

## 功能特性

- ✅ Turn into 子菜单 - 转换块类型（Text, H1-H3, 列表, Code, Quote 等）
- ✅ Color 子菜单 - 文字颜色和背景色选择
- ✅ Duplicate - 复制块
- ✅ Delete - 删除块（红色图标）
- ✅ 支持暗黑模式
- ✅ 子菜单自动定位
- ✅ 鼠标悬停显示/隐藏

## 使用示例

```tsx
import { HandleMenu } from '@/domain-editor/shared/ui'

function MyEditor() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setMenuOpen(true)
  }

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        右键点击打开菜单
      </div>

      <HandleMenu
        open={menuOpen}
        position={menuPosition}
        onClose={() => setMenuOpen(false)}
        onTurnInto={(type) => {
          console.log('转换为:', type)
          // 执行块类型转换逻辑
        }}
        onColorChange={(color, isBackground) => {
          console.log('颜色改变:', color, isBackground ? '背景' : '文字')
          // 执行颜色修改逻辑
        }}
        onDuplicate={() => {
          console.log('复制块')
          // 执行复制逻辑
        }}
        onDelete={() => {
          console.log('删除块')
          // 执行删除逻辑
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
| `onTurnInto` | `(type: string) => void` | - | Turn into 选项点击回调 |
| `onColorChange` | `(color: string, isBackground: boolean) => void` | - | Color 选项点击回调 |
| `onDuplicate` | `() => void` | - | Duplicate 点击回调 |
| `onDelete` | `() => void` | - | Delete 点击回调 |

## 块类型

Turn into 支持的块类型：

- `text` - 文本
- `heading1` - 标题 1
- `heading2` - 标题 2
- `heading3` - 标题 3
- `bulletList` - 无序列表
- `numberedList` - 有序列表
- `todoList` - 待办列表
- `code` - 代码块
- `quote` - 引用

## 颜色选项

文字颜色和背景色：
- `default`, `gray`, `brown`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `red`

## 样式

组件样式文件 `handle-menu.css` 会自动导入。支持暗黑模式（通过 `.dark` 类名）。
