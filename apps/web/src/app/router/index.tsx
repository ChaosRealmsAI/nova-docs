import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'

// 懒加载编辑器页面
const EditorPage = lazy(() => import('../pages/editor'))

export function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<div className="flex items-center justify-center h-screen">加载编辑器中...</div>}>
                <EditorPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  )
}
