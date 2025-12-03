# EmojiPicker 组件

基于 emoji-picker-element 库的表情选择器组件，深色主题定制。

## 功能特性

- ✅ 深色主题，适配 syllo 设计风格
- ✅ 固定尺寸 400×450px
- ✅ 表情选择回调
- ✅ 自动从 CDN 加载 emoji-picker-element（无需安装依赖）
- ✅ 数据存储在 IndexedDB（内存占用低）

## 使用示例

```tsx
import { EmojiPicker } from '@syllo/domain-editor/shared/ui'

function MyComponent() {
  const handleEmojiSelect = (emoji: string) => {
    console.log('Selected emoji:', emoji)
  }

  return (
    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
  )
}
```

## Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| onEmojiSelect | `(emoji: string) => void` | 否 | - | 表情选择回调 |
| className | `string` | 否 | - | 自定义类名 |

## 样式定制

组件使用 CSS 变量进行主题定制，所有变量定义在 `emoji-picker.css` 中：

```css
emoji-picker {
  --background: rgb(41, 41, 41);
  --border-color: rgb(95, 95, 95);
  --indicator-color: rgb(76, 136, 255);
  /* ... 更多变量 */
}
```

## 技术说明

- 使用 [emoji-picker-element](https://github.com/nolanlawson/emoji-picker-element)
- 通过 CDN 动态加载，无需 npm 依赖
- 首次加载会将表情数据存入 IndexedDB
- 后续访问速度极快
