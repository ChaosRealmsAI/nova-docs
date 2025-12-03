import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, GripVertical, Plus, MoreVertical, Home, PanelLeftClose, ChevronRight, File, Trash2, Copy, Edit3 } from 'lucide-react'
import { Tooltip } from '../app-header/Tooltip'
import './sidebar.css'

interface TreeNode {
  id: string
  title: string
  icon?: string
  level: number
  hasChildren?: boolean
  expanded?: boolean
  children?: TreeNode[]
}

interface KnowledgeBase {
  id: string
  name: string
  icon: string
}

const mockKnowledgeBases: KnowledgeBase[] = [
  { id: '1', name: '我的知识库', icon: '📚' },
  { id: '2', name: '工作笔记', icon: '💼' },
  { id: '3', name: '个人项目', icon: '🚀' },
]

const mockTreeData: TreeNode[] = [
  {
    id: '1',
    title: '项目文档',
    icon: '📁',
    level: 0,
    hasChildren: true,
    expanded: true,
    children: [
      { id: '1-1', title: '需求文档', icon: '📄', level: 1 },
      { id: '1-2', title: '设计稿', icon: '📝', level: 1, hasChildren: true, expanded: false },
    ],
  },
  { id: '2', title: '想法笔记', icon: '💡', level: 0 },
  { id: '3', title: 'UI 设计', icon: '🎨', level: 0 },
  { id: '4', title: '技术规划', icon: '⚙️', level: 0 },
]

const iconOptions = ['📁', '📄', '📝', '💡', '🎨', '⚙️', '📚', '💼', '🚀', '✨', '🔥', '⭐', '🎯', '📊', '🔧', '🎵']

export const Sidebar: React.FC = () => {
  const [currentKb, setCurrentKb] = useState(mockKnowledgeBases[0])
  const [kbDropdownOpen, setKbDropdownOpen] = useState(false)
  const [treeData, setTreeData] = useState(mockTreeData)
  const [activeNodeId, setActiveNodeId] = useState('1')
  const [iconPickerNodeId, setIconPickerNodeId] = useState<string | null>(null)
  const [moreMenuNodeId, setMoreMenuNodeId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const kbSelectorRef = useRef<HTMLDivElement>(null)
  const iconPickerRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (kbSelectorRef.current && !kbSelectorRef.current.contains(e.target as Node)) {
        setKbDropdownOpen(false)
      }
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target as Node)) {
        setIconPickerNodeId(null)
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuNodeId(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const toggleKbDropdown = () => {
    setKbDropdownOpen(!kbDropdownOpen)
  }

  const selectKb = (kb: KnowledgeBase) => {
    setCurrentKb(kb)
    setKbDropdownOpen(false)
  }

  const toggleNodeExpand = (nodeId: string) => {
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded }
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) }
        }
        return node
      })
    }
    setTreeData(updateNode(treeData))
  }

  const changeNodeIcon = (nodeId: string, newIcon: string) => {
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, icon: newIcon }
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) }
        }
        return node
      })
    }
    setTreeData(updateNode(treeData))
    setIconPickerNodeId(null)
  }

  const handleAddChild = (nodeId: string) => {
    alert(`添加子项到: ${nodeId}`)
    // TODO: 实现添加子项功能
  }

  const handleRename = (nodeId: string) => {
    alert(`重命名节点: ${nodeId}`)
    // TODO: 实现重命名功能
  }

  const handleDuplicate = (nodeId: string) => {
    alert(`复制节点: ${nodeId}`)
    // TODO: 实现复制功能
  }

  const handleDelete = (nodeId: string) => {
    const confirmed = window.confirm('确定要删除这个项目吗？')
    if (confirmed) {
      const removeNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.filter(node => {
          if (node.id === nodeId) return false
          if (node.children) {
            node.children = removeNode(node.children)
          }
          return true
        })
      }
      setTreeData(removeNode(treeData))
      setMoreMenuNodeId(null)
    }
  }

  const renderTreeNode = (node: TreeNode) => {
    return (
      <React.Fragment key={node.id}>
        <div
          className={`tree-item tree-item-level-${node.level} ${activeNodeId === node.id ? 'active' : ''}`}
          onClick={() => setActiveNodeId(node.id)}
        >
          <Tooltip content="拖拽排序">
            <div className="tree-item-drag-handle">
              <GripVertical size={16} />
            </div>
          </Tooltip>

          {node.hasChildren ? (
            <Tooltip content={node.expanded ? '收起' : '展开'}>
              <button
                className={`tree-item-expand ${node.expanded ? 'expanded' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNodeExpand(node.id)
                }}
              >
                <ChevronRight size={12} />
              </button>
            </Tooltip>
          ) : (
            <div className="tree-item-spacer" />
          )}

          <div className="tree-item-icon-wrapper" ref={iconPickerNodeId === node.id ? iconPickerRef : null}>
            <Tooltip content="点击更换图标">
              <button
                className="tree-item-icon"
                onClick={(e) => {
                  e.stopPropagation()
                  setIconPickerNodeId(iconPickerNodeId === node.id ? null : node.id)
                }}
              >
                {node.icon || <File size={16} />}
              </button>
            </Tooltip>

            {/* 图标选择器 */}
            {iconPickerNodeId === node.id && (
              <div className="icon-picker">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    className="icon-option"
                    onClick={(e) => {
                      e.stopPropagation()
                      changeNodeIcon(node.id, icon)
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="tree-item-title">{node.title}</span>

          <div className="tree-item-actions">
            <Tooltip content="添加子项">
              <button
                className="tree-item-action-button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddChild(node.id)
                }}
              >
                <Plus size={16} />
              </button>
            </Tooltip>

            <div className="tree-item-more-wrapper" ref={moreMenuNodeId === node.id ? moreMenuRef : null}>
              <Tooltip content="更多操作">
                <button
                  className="tree-item-action-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMoreMenuNodeId(moreMenuNodeId === node.id ? null : node.id)
                  }}
                >
                  <MoreVertical size={16} />
                </button>
              </Tooltip>

              {/* 更多操作菜单 */}
              {moreMenuNodeId === node.id && (
                <div className="more-menu">
                  <button
                    className="more-menu-item"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRename(node.id)
                    }}
                  >
                    <Edit3 size={14} />
                    <span>重命名</span>
                  </button>
                  <button
                    className="more-menu-item"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDuplicate(node.id)
                    }}
                  >
                    <Copy size={14} />
                    <span>复制</span>
                  </button>
                  <div className="more-menu-divider" />
                  <button
                    className="more-menu-item danger"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(node.id)
                    }}
                  >
                    <Trash2 size={14} />
                    <span>删除</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {node.expanded && node.children?.map(child => renderTreeNode(child))}
      </React.Fragment>
    )
  }

  return (
    <div className={`sidebar-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* 顶部导航栏 */}
      <div className="sidebar-header">
        <div className="sidebar-header-buttons">
          <Tooltip content="收起侧边栏">
            <button
              className="header-button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <PanelLeftClose size={16} />
            </button>
          </Tooltip>
          <Tooltip content="返回首页">
            <button
              className="header-button"
              onClick={() => alert('返回首页')}
            >
              <Home size={16} />
            </button>
          </Tooltip>
        </div>
        <h1 className="sidebar-title">Syllo</h1>
      </div>

      {/* 知识库选择器 */}
      <div className="kb-selector-container">
        <div className="kb-selector" ref={kbSelectorRef}>
          <button
            className={`kb-selector-button ${kbDropdownOpen ? 'open' : ''}`}
            onClick={toggleKbDropdown}
          >
            <div className="kb-selector-content">
              <div className="kb-icon">{currentKb.icon}</div>
              <span className="kb-name">{currentKb.name}</span>
            </div>
            <ChevronDown className={`kb-chevron ${kbDropdownOpen ? 'open' : ''}`} size={16} />
          </button>

          {kbDropdownOpen && (
            <div className="kb-dropdown open">
              {mockKnowledgeBases.map(kb => (
                <button
                  key={kb.id}
                  className={`kb-dropdown-item ${currentKb.id === kb.id ? 'active' : ''}`}
                  onClick={() => selectKb(kb)}
                >
                  <div className="kb-icon">{kb.icon}</div>
                  <span className="kb-name">{kb.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 目录标题栏 */}
      <div className="directory-header">
        <div className="directory-header-inner">
          <div className="directory-label">
            <span className="directory-label-text">目录</span>
          </div>
          <Tooltip content="新建文档">
            <button
              className="directory-add-button"
              onClick={() => alert('新建文档')}
            >
              <Plus size={16} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 工作区树 */}
      <div className="workspace-tree">
        {treeData.map(node => renderTreeNode(node))}
      </div>
    </div>
  )
}
