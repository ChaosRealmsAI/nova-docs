import React, { useState, useRef, useEffect } from 'react'
import {
  Home,
  PanelLeftOpen,
  Palette,
  FileText,
  ChevronDown,
  Edit,
  Eye,
  Undo,
  Redo,
  Plus,
  Moon,
} from 'lucide-react'
import { Tooltip } from './Tooltip'
import './app-header.css'

interface Document {
  id: string
  name: string
}

const mockDocuments: Document[] = [
  { id: '1', name: '主文档' },
  { id: '2', name: '项目计划' },
  { id: '3', name: '会议记录' },
]

export const AppHeader: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentTab, setCurrentTab] = useState<'canvas' | 'document'>('canvas')
  const [currentDocument, setCurrentDocument] = useState(mockDocuments[0])
  const [docDropdownOpen, setDocDropdownOpen] = useState(false)
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<'edit' | 'read'>('edit')
  const [hotzoneVisible, setHotzoneVisible] = useState(false)

  const docDropdownRef = useRef<HTMLDivElement>(null)
  const modeDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (docDropdownRef.current && !docDropdownRef.current.contains(e.target as Node)) {
        setDocDropdownOpen(false)
      }
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setModeDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const switchTab = (tab: 'canvas' | 'document') => {
    setCurrentTab(tab)
  }

  const toggleDocDropdown = () => {
    setDocDropdownOpen(!docDropdownOpen)
  }

  const selectDocument = (doc: Document) => {
    setCurrentDocument(doc)
    setCurrentTab('document')
    setDocDropdownOpen(false)
  }

  const toggleModeDropdown = () => {
    setModeDropdownOpen(!modeDropdownOpen)
  }

  const selectMode = (mode: 'edit' | 'read') => {
    setCurrentMode(mode)
    setModeDropdownOpen(false)
  }

  const toggleHotzone = () => {
    setHotzoneVisible(!hotzoneVisible)
  }

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="app-header-container">
      <div className="app-header">
        <div className="app-header-inner">
          {/* Left Navigation */}
          <div className="left-nav">
            {!sidebarOpen && (
              <>
                <Tooltip content="展开侧边栏">
                  <button className="nav-button" onClick={toggleSidebar}>
                    <PanelLeftOpen size={16} />
                  </button>
                </Tooltip>
                <Tooltip content="首页">
                  <button className="nav-button" onClick={() => alert('返回首页')}>
                    <Home size={16} />
                  </button>
                </Tooltip>
              </>
            )}
          </div>

          {/* Workspace Navigation (Tabs) */}
          <div className="workspace-nav">
            {/* Canvas Tab */}
            <Tooltip content="主画布">
              <button
                className={`workspace-tab ${currentTab === 'canvas' ? 'active' : ''}`}
                onClick={() => switchTab('canvas')}
              >
                <Palette size={20} />
                {currentTab === 'canvas' && <div className="workspace-tab-indicator" />}
              </button>
            </Tooltip>

            {/* Document Tab Group */}
            <div className="workspace-tab-group">
              <Tooltip content="主文档">
                <button
                  className={`workspace-tab-left ${currentTab === 'document' ? 'active' : ''}`}
                  onClick={() => switchTab('document')}
                >
                  <FileText size={20} />
                  {currentTab === 'document' && <div className="workspace-tab-indicator" />}
                </button>
              </Tooltip>

              {/* Dropdown Button */}
              <div className="workspace-tab-dropdown" ref={docDropdownRef}>
                <Tooltip content="切换文档">
                  <button
                    className="workspace-tab-dropdown-trigger"
                    onClick={toggleDocDropdown}
                  >
                    <ChevronDown size={12} />
                  </button>
                </Tooltip>

                {/* Dropdown Menu */}
                {docDropdownOpen && (
                  <div className="workspace-dropdown-menu open">
                    {mockDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        className={`workspace-dropdown-item ${
                          currentDocument.id === doc.id ? 'selected' : ''
                        }`}
                        onClick={() => selectDocument(doc)}
                      >
                        <FileText size={16} />
                        <span>{doc.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="spacer" />

          {/* Right Action Bar */}
          <div className="action-bar">
            {/* Mode Dropdown */}
            <div className="mode-dropdown" ref={modeDropdownRef}>
              <Tooltip content={currentMode === 'edit' ? '编辑模式' : '阅读模式'}>
                <button className="action-button" onClick={toggleModeDropdown}>
                  {currentMode === 'edit' ? <Edit size={18} /> : <Eye size={18} />}
                </button>
              </Tooltip>

              {/* Mode Dropdown Menu */}
              {modeDropdownOpen && (
                <div className="dropdown-menu open">
                  <button
                    className={`dropdown-item ${currentMode === 'edit' ? 'selected' : ''}`}
                    onClick={() => selectMode('edit')}
                  >
                    编辑模式
                  </button>
                  <button
                    className={`dropdown-item ${currentMode === 'read' ? 'selected' : ''}`}
                    onClick={() => selectMode('read')}
                  >
                    阅读模式
                  </button>
                </div>
              )}
            </div>

            {/* Undo/Redo Group */}
            <div className="undo-redo-group">
              <Tooltip content="撤销">
                <button className="action-button" onClick={() => alert('撤销')}>
                  <Undo size={16} />
                </button>
              </Tooltip>
              <Tooltip content="重做">
                <button className="action-button" onClick={() => alert('重做')}>
                  <Redo size={16} />
                </button>
              </Tooltip>
            </div>

            {/* Add Button */}
            <Tooltip content="添加">
              <button className="action-button" onClick={() => alert('添加')}>
                <Plus size={18} />
              </button>
            </Tooltip>

            {/* Hotzone Toggle */}
            <Tooltip content={hotzoneVisible ? '隐藏热区' : '显示热区'}>
              <button
                className={`action-button ${hotzoneVisible ? 'active' : ''}`}
                onClick={toggleHotzone}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5C7.5 5 3.73 7.61 2 11.5 3.73 15.39 7.5 18 12 18s8.27-2.61 10-6.5C20.27 7.61 16.5 5 12 5zm0 11c-2.5 0-4.5-2-4.5-4.5S9.5 7 12 7s4.5 2 4.5 4.5S14.5 16 12 16z"
                    fill="currentColor"
                  />
                  <circle cx="12" cy="11.5" r="2.5" fill="currentColor" />
                </svg>
              </button>
            </Tooltip>

            {/* Dark Mode Toggle */}
            <Tooltip content="深色模式">
              <button className="action-button" onClick={toggleTheme}>
                <Moon size={16} />
              </button>
            </Tooltip>

            {/* Theme Style Selector */}
            <Tooltip content="主题风格">
              <button className="action-button" onClick={() => alert('主题风格选择')}>
                <Palette size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
