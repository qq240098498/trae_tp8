import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Car,
  Calendar,
  DollarSign,
  BarChart3,
  Flower2,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { path: '/', label: '数据看板', icon: LayoutDashboard },
  { path: '/drivers', label: '司机管理', icon: Users },
  { path: '/vehicles', label: '车辆管理', icon: Car },
  { path: '/vehicle-ledger', label: '车辆台账', icon: BookOpen },
  { path: '/orders', label: '订单管理', icon: Calendar },
  { path: '/settlements', label: '结算管理', icon: DollarSign },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
]

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col bg-gradient-to-b from-rose-600 to-pink-700 text-white',
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/20 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Flower2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold">婚庆车队调度</h1>
          <p className="text-xs text-white/70">鲜花婚车管理系统</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-white/20 text-white shadow-lg shadow-black/10'
                    : 'text-white/80 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-white/20 p-4">
        <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
          <p className="text-xs text-white/70">系统版本</p>
          <p className="text-sm font-medium">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
