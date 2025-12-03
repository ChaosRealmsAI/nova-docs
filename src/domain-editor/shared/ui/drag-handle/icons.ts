/**
 * 拖拽句柄图标库（一比一复刻飞书风格）
 */

// 拖拽手柄图标（6个点）
export const DragHandleIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="feishu-drag-icon" d="M8.25 6.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Zm0 7.25a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Zm1.75 5.5a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0ZM14.753 6.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5ZM16.5 12a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Zm-1.747 9a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" fill="currentColor"></path>
  </svg>
`

// 文本图标（内部使用）
const DefaultTextIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V4h-7v16h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3V4H4v3a1 1 0 1 1-2 0V3Z" fill="currentColor"></path>
  </svg>
`

// H1-H6 标题图标
export const HeadingIcons = {
  h1: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3a1 1 0 0 0-1 1v16a1 1 0 1 0 2 0v-7h9v7a1 1 0 1 0 2 0V4a1 1 0 1 0-2 0v7H3V4a1 1 0 0 0-1-1Zm15.604 9.91a.4.4 0 0 1-.585-.355c0-.533 0-.774.004-1.582a.4.4 0 0 1 .203-.347l2.769-1.568A.39.39 0 0 1 20.197 9h1.404c.234 0 .423.21.423.468V19.95c0 .593-.483 1.073-1.075 1.073a1.07 1.07 0 0 1-1.07-1.073v-8.228l-2.275 1.19Z" fill="currentColor"></path>
    </svg>
  `,
  h2: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3a1 1 0 0 0-1 1v16a1 1 0 1 0 2 0v-7h9v7a1 1 0 1 0 2 0V4a1 1 0 1 0-2 0v7H3V4a1 1 0 0 0-1-1Zm20.993 16.872c0-.561-.455-1.015-1.017-1.015h-3.121l3.407-4.272a3.35 3.35 0 0 0 .731-2.126c-.01-.992-.347-1.816-1.005-2.464-.647-.651-1.492-.984-2.523-.995-.931.011-1.72.34-2.356.982-.37.386-.941 1.044-.941 1.602 0 .591.48 1.07 1.07 1.07.563 0 .769-.347.993-.726.06-.101.12-.204.19-.304a1.36 1.36 0 0 1 .186-.214c.262-.252.584-.376.982-.376.447.01.784.15 1.02.423.234.28.35.606.35.987 0 .146-.019.303-.057.471-.05.152-.156.341-.315.548l-4.402 5.506a.4.4 0 0 0-.087.25v1.022c0 .221.267.65.606.65h5.272c.562 0 1.017-.457 1.017-1.019Z" fill="currentColor"></path>
    </svg>
  `,
  h3: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3a1 1 0 0 0-1 1v16a1 1 0 1 0 2 0v-7h9v7a1 1 0 1 0 2 0V4a1 1 0 1 0-2 0v7H3V4a1 1 0 0 0-1-1Zm21 14.296c0-.51-.108-.998-.324-1.461a2.923 2.923 0 0 0-.877-1.044c.377-.297.65-.63.816-1.001.17-.44.252-.886.252-1.348a3.48 3.48 0 0 0-.943-2.385C21.274 9.363 20.398 9.01 19.31 9a3.179 3.179 0 0 0-2.251.932c-.349.336-.848.879-.848 1.384a1 1 0 0 0 1 1c.482 0 .767-.352 1.043-.692l.09-.11c.057-.07.121-.132.192-.185.256-.2.53-.296.834-.296.431.01.779.144 1.049.405.267.267.406.61.415 1.04 0 .417-.133.75-.4 1.008-.335.335-.766.387-1.212.387a.958.958 0 1 0 0 1.917h.088c.452-.002.824-.003 1.205.353.29.277.442.674.452 1.201-.01.51-.16.894-.451 1.162-.296.296-.65.44-1.076.44-.4 0-.712-.107-.944-.316l-.008-.008a8.055 8.055 0 0 1-.213-.207c-.1-.099-.178-.207-.254-.31-.193-.264-.366-.5-.81-.5a1 1 0 0 0-1 1c0 .574.543 1.19.954 1.533.635.53 1.35.84 2.174.84 1.057-.01 1.93-.35 2.609-1.018.69-.651 1.04-1.545 1.052-2.664Z" fill="currentColor"></path>
    </svg>
  `,
  h4: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3a1 1 0 0 0-1 1v16a1 1 0 1 0 2 0v-7h9v7a1 1 0 1 0 2 0V4a1 1 0 1 0-2 0v7H3V4a1 1 0 0 0-1-1Zm19.681 7.19c0-.658-.486-1.19-1.143-1.19-.402 0-.824.204-1.043.542l-4.428 6.821a.266.266 0 0 0-.043.145v1.62c0 .22.18.4.4.4h4.404v1.363c0 .512.43.927.941.927a.914.914 0 0 0 .912-.927v-1.363h.4a.954.954 0 0 0 .943-.956.934.934 0 0 0-.944-.932h-.399v-6.45Zm-4.53 6.45 2.677-4.177v4.177H17.15Z" fill="currentColor"></path>
    </svg>
  `,
  h5: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3a1 1 0 0 0-1 1v16a1 1 0 1 0 2 0v-7h9v7a1 1 0 1 0 2 0V4a1 1 0 1 0-2 0v7H3V4a1 1 0 0 0-1-1Zm17.758 9.728a2.98 2.98 0 0 0-1.252.258c-.264.108-.509.26-.735.457l.21-2.395h3.422c.566 0 1.024-.475 1.024-1.04A1.01 1.01 0 0 0 21.403 9h-4.666a.4.4 0 0 0-.398.366l-.5 5.867a.4.4 0 0 0 .398.434l1.228.002c.116 0 .22-.069.278-.17.16-.275.36-.479.61-.622.258-.154.582-.23.975-.23.57 0 .986.19 1.262.574.301.403.46.973.46 1.69 0 .648-.18 1.163-.526 1.547a1.698 1.698 0 0 1-1.29.558c-.468 0-.841-.123-1.105-.351-.176-.154-.34-.508-.444-.858l-.004.001a.973.973 0 1 0-1.829.653c.218.65.557 1.251.992 1.64.657.595 1.458.899 2.377.899 1.004 0 1.874-.355 2.61-1.064.796-.795 1.19-1.807 1.19-3.04 0-1.266-.303-2.29-.903-3.037-.601-.75-1.397-1.131-2.36-1.131Z" fill="currentColor"></path>
    </svg>
  `,
  h6: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3a1 1 0 0 0-1 1v16a1 1 0 1 0 2 0v-7h9v7a1 1 0 1 0 2 0V4a1 1 0 1 0-2 0v7H3V4a1 1 0 0 0-1-1Zm17.47 6.843c1.379 0 2.463.659 2.995 1.64l.001.003c.116.214.219.404.219.638 0 .506-.41.915-.915.915-.477 0-.69-.327-.909-.662a3.585 3.585 0 0 0-.212-.304c-.262-.33-.675-.527-1.18-.527-.586 0-1.055.348-1.402.977-.312.527-.483 1.181-.518 1.975.234-.28.509-.498.825-.657.39-.21.84-.309 1.364-.309.989 0 1.784.34 2.378 1.027.594.685.887 1.568.887 2.627 0 1.081-.344 1.986-1.027 2.691a3.391 3.391 0 0 1-2.52 1.064c-1.23 0-2.183-.487-2.834-1.448-.637-.925-.946-2.187-.946-3.812 0-1.732.332-3.125 1.008-4.195.675-1.09 1.612-1.643 2.785-1.643Zm-.068 5.426c-.55 0-.958.171-1.249.523-.298.335-.45.82-.45 1.452 0 .607.16 1.081.475 1.42.318.342.719.511 1.224.511.515 0 .915-.18 1.233-.55.32-.37.48-.847.48-1.44 0-.582-.155-1.048-.45-1.393-.315-.352-.727-.523-1.263-.523Z" fill="currentColor"></path>
    </svg>
  `
}

// 折叠按钮图标
export const FoldIcon = `
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`

export const UnfoldIcon = `
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`

// 加号图标（空节点）
export const PlusIcon = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
`

// Mermaid 图表图标
export const MermaidIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.5 10v4M17.5 10v4M10 6.5h4M10 17.5h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
`

// 代码块图标
export const CodeBlockIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 6L3 12l5 6M16 6l5 6-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`

// 引用块图标
export const BlockquoteIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 8H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H6v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h2Zm10 0h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-2v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h2Z" fill="currentColor"/>
  </svg>
`

// 无序列表图标
export const BulletListIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4" cy="6" r="2" fill="currentColor"/>
    <circle cx="4" cy="12" r="2" fill="currentColor"/>
    <circle cx="4" cy="18" r="2" fill="currentColor"/>
    <path d="M9 6h12M9 12h12M9 18h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
`

// 有序列表图标
export const OrderedListIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 5V4h1v3H4V5ZM9 6h12M9 12h12M9 18h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M3 10h2l-1.5 2H5v1H3v-1l1.5-2H3v-1ZM3 16h2v.5H4v.5h1v.5H3v.5h2v1H3v-3Z" fill="currentColor"/>
  </svg>
`

// 任务列表图标
export const TaskListIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="4" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
    <path d="M4.5 12.5l1 1 2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="3" y="16" width="4" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
    <path d="M10 6h11M10 12h11M10 18h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
`

// Callout 高亮块图标（简洁灯泡）
export const CalloutIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21h6M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`

// 图片图标
export const ImageIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
    <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`

// 表格图标
export const TableIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="currentColor" stroke-width="2"/>
  </svg>
`

// 分割线图标
export const HorizontalRuleIcon = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="6" cy="12" r="1" fill="currentColor"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
    <circle cx="18" cy="12" r="1" fill="currentColor"/>
  </svg>
`

// 段落/文本图标
export const ParagraphIcon = DefaultTextIcon

/**
 * 节点类型图标映射表
 */
const NodeTypeIconMap: Record<string, string> = {
  paragraph: ParagraphIcon,
  codeBlock: CodeBlockIcon,
  blockquote: BlockquoteIcon,
  bulletList: BulletListIcon,
  orderedList: OrderedListIcon,
  taskList: TaskListIcon,
  taskItem: TaskListIcon,
  callout: CalloutIcon,
  mermaid: MermaidIcon,
  image: ImageIcon,
  table: TableIcon,
  horizontalRule: HorizontalRuleIcon,
}

/**
 * 根据节点类型和属性获取对应的图标
 */
export function getNodeTypeIcon(nodeType: string, attrs?: Record<string, unknown>): string {
  // 标题特殊处理（H1-H6）
  if ((nodeType === 'heading' || nodeType === 'numberedHeading') && attrs?.level) {
    const level = attrs.level
    return (HeadingIcons as Record<string, string>)[`h${level}`] || HeadingIcons.h1
  }

  // 从映射表查找
  const icon = NodeTypeIconMap[nodeType]
  if (icon) {
    return icon
  }

  // 默认返回文本图标
  return DefaultTextIcon
}
