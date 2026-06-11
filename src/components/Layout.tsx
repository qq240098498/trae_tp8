import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAppStore } from '@/store/useAppStore'

export default function Layout() {
  const { error } = useAppStore()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h2 className="text-lg font-semibold text-gray-800">婚庆鲜花车队调度管理系统</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <span className="text-sm font-medium">管</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  )
}
