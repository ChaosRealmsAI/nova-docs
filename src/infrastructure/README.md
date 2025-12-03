# Infrastructure 基础设施层使用指南

全局技术基石，提供跨模块共享的核心能力。

---

## Logger 日志系统

### 基本用法

```typescript
import { loggers } from '@syllo/infrastructure/logger'

// 使用预注册的 logger
loggers.editorInit.info('编辑器初始化成功')
loggers.editorInit.debug('加载配置', { theme: 'dark' })
loggers.uiButton.warn('点击次数过多')
loggers.appInit.error('请求失败', { code: 500 })
```

### 配置管理

**位置**: `logger.config.json` (项目根目录)

```json
{
  "globalLevel": "info",
  "features": {
    "feature-editor-init": {
      "enabled": true,
      "level": "debug",
      "description": "编辑器初始化"
    },
    "feature-ui-button": {
      "enabled": false,
      "level": "info",
      "description": "UI按钮交互"
    }
  }
}
```

### 日志级别

- `debug` - 详细调试信息
- `info` - 一般信息（默认）
- `warn` - 警告信息
- `error` - 错误信息

### 最佳实践

```typescript
// ✅ 使用预注册的 logger
loggers.editorInit.info('保存文档')

// ✅ 携带上下文数据
loggers.appInit.error('请求失败', {
  url,
  status,
  timestamp
})

// ✅ 类型安全，自动补全
loggers.theme.debug('主题切换', { mode: 'dark' })
```

---

## Theme 主题系统

### 基本用法

```typescript
import { useTheme } from '@syllo/infrastructure/theme'

function MyComponent() {
  const { config, toggleMode, setColorScheme } = useTheme()

  return (
    <div>
      <p>当前: {config.colorScheme} / {config.mode}</p>
      <button onClick={toggleMode}>切换明暗</button>
      <button onClick={() => setColorScheme('zinc')}>切换配色</button>
    </div>
  )
}
```

### 使用主题颜色

```tsx
// 使用 Tailwind 语义化类名
<div className="bg-background text-foreground">
  <div className="bg-card border rounded-lg p-4">
    <h1 className="text-primary">标题</h1>
    <p className="text-muted-foreground">描述</p>
    <Button className="bg-primary text-primary-foreground">
      操作按钮
    </Button>
  </div>
</div>
```

### 内置配色方案

- `neutral` - 中性灰
- `stone` - 石灰色
- `zinc` - 锌灰色
- `gray` - 灰色
- `slate` - 板岩色

### 可用主题变量

**背景色**
- `bg-background` - 页面背景
- `bg-card` - 卡片背景
- `bg-popover` - 弹出层背景

**主要颜色**
- `bg-primary / text-primary` - 主色调
- `bg-secondary / text-secondary` - 次要色
- `bg-accent / text-accent` - 强调色
- `bg-destructive / text-destructive` - 危险色

**文字色**
- `text-foreground` - 主文字
- `text-muted-foreground` - 次要文字

**边框**
- `border` - 边框色
- `ring` - 聚焦环

### 添加自定义配色

**1. 定义预设** (`infrastructure/theme/service/theme-presets.ts`)

```typescript
export const THEME_PRESETS = {
  // ... 现有方案

  blue: {
    name: 'blue',
    light: {
      '--primary': 'oklch(0.5 0.2 250)',  // 蓝色
      '--primary-foreground': 'oklch(1 0 0)',
      // ... 其他变量
    },
    dark: { /* ... */ }
  }
}
```

**2. 更新类型** (`infrastructure/theme/model/theme.types.ts`)

```typescript
export type ColorScheme = 'neutral' | 'stone' | 'zinc' | 'gray' | 'slate' | 'blue'
```

### 直接访问CSS变量

```tsx
<div style={{
  backgroundColor: 'var(--primary)',
  color: 'var(--primary-foreground)'
}}>
  自定义样式
</div>
```

### 特性

- ✅ 主题自动持久化 (localStorage)
- ✅ 刷新页面保持主题
- ✅ 类型安全的 API
- ✅ 支持扩展自定义配色

---

## API 参考

### Logger

```typescript
// 所有可用的 loggers（见 src/infrastructure/logger/src/registry.ts）
loggers.appInit.info(message: string, data?: unknown)
loggers.appInit.debug(message: string, data?: unknown)
loggers.appInit.warn(message: string, data?: unknown)
loggers.appInit.error(message: string, data?: unknown)

// 其他可用的 loggers:
// loggers.theme, loggers.editorInit, loggers.multiColumn, 等
```

### Theme

```typescript
interface ThemeContextValue {
  config: ThemeConfig                    // 当前配置
  toggleMode: () => void                 // 切换明暗模式
  setColorScheme: (scheme) => void       // 切换配色方案
  availableColorSchemes: ColorScheme[]   // 可用方案列表
}
```
