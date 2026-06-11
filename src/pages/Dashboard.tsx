import { useEffect } from 'react'
import {
  Car,
  Users,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { ORDER_STATUS_MAP } from '@/types'

export default function Dashboard() {
  const { stats, fetchAllStats, orders, fetchOrders } = useAppStore()
  const { overview, monthlyData, statusData, topDrivers, topVehicles } = stats

  useEffect(() => {
    fetchAllStats()
    fetchOrders({ status: 'all' })
  }, [fetchAllStats, fetchOrders])

  const statCards = [
    {
      label: '总订单数',
      value: overview?.totalOrders || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: '今日订单',
      value: overview?.todayOrders || 0,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      label: '在岗司机',
      value: overview?.totalDrivers || 0,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: '可用车辆',
      value: overview?.totalVehicles || 0,
      icon: Car,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: '待结算',
      value: overview?.pendingSettlements || 0,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      label: '累计营收',
      value: `¥${(overview?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-rose-500',
      bgColor: 'bg-rose-50',
    },
  ]

  const chartHeight = 200
  const maxMonthlyCount = Math.max(...monthlyData.map((m) => m.count), 1)
  const maxMonthlyRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1)

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">数据看板</h1>
        <p className="mt-1 text-sm text-gray-500">欢迎使用婚庆鲜花车队调度管理系统</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={cn('rounded-xl border border-gray-100 bg-white p-5 shadow-sm', card.bgColor, 'bg-opacity-50')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg text-white', card.color)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">月度订单趋势</h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                订单数
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                营收
              </span>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between gap-2" style={{ height: `${chartHeight}px` }}>
              {monthlyData.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center h-full">
                  <div className="flex-1 w-full flex items-end justify-center gap-1">
                    <div
                      className="w-3 rounded-t bg-rose-500 transition-all hover:bg-rose-600"
                      style={{ height: `${Math.max((item.count / maxMonthlyCount) * chartHeight, item.count > 0 ? 4 : 0)}px` }}
                      title={`订单数: ${item.count}`}
                    ></div>
                    <div
                      className="w-3 rounded-t bg-blue-400 transition-all hover:bg-blue-500"
                      style={{ height: `${Math.max((item.revenue / maxMonthlyRevenue) * chartHeight, item.revenue > 0 ? 4 : 0)}px` }}
                      title={`营收: ¥${item.revenue.toLocaleString()}`}
                    ></div>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-500">{item.month}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">订单状态分布</h3>
          <div className="mt-6 space-y-4">
            {statusData.map((item) => {
              const total = statusData.reduce((sum, s) => sum + s.count, 0) || 1
              const percent = ((item.count / total) * 100).toFixed(1)
              const statusInfo = ORDER_STATUS_MAP[item.status]
              return (
                <div key={item.status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-800">
                      {item.count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn('h-full rounded-full transition-all', statusInfo?.color.replace('text-', 'bg-').split(' ')[0])}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">最近订单</h3>
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => {
              const statusInfo = ORDER_STATUS_MAP[order.status]
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {order.groomName} &amp; {order.brideName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.weddingDate} · {order.orderNo}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        'inline-block rounded-full px-3 py-1 text-xs font-medium',
                        statusInfo?.color,
                      )}
                    >
                      {statusInfo?.label}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-rose-600">
                      ¥{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
            {recentOrders.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">暂无订单</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">司机排行榜</h3>
          <div className="mt-4 space-y-3">
            {topDrivers.map((driver, index) => (
              <div
                key={driver.driverId}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white',
                      index === 0
                        ? 'bg-yellow-500'
                        : index === 1
                          ? 'bg-gray-400'
                          : index === 2
                            ? 'bg-amber-600'
                            : 'bg-gray-300',
                    )}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{driver.name}</p>
                    <p className="text-xs text-gray-500">{driver.orderCount} 单</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-rose-600">
                  ¥{driver.totalFee.toLocaleString()}
                </p>
              </div>
            ))}
            {topDrivers.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">暂无数据</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800">热门车辆</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {topVehicles.map((vehicle, index) => (
            <div
              key={vehicle.vehicleId}
              className="rounded-lg border border-gray-100 p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white',
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                        ? 'bg-gray-400'
                        : index === 2
                          ? 'bg-amber-600'
                          : 'bg-gray-300',
                  )}
                >
                  {index + 1}
                </span>
                <Car className="h-5 w-5 text-rose-500" />
              </div>
              <p className="mt-3 font-medium text-gray-800">{vehicle.plateNumber}</p>
              <p className="text-xs text-gray-500">
                {vehicle.brand} {vehicle.model}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">{vehicle.orderCount} 单</span>
                <span className="font-semibold text-rose-600">
                  ¥{vehicle.totalFee.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {topVehicles.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-gray-400">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  )
}
