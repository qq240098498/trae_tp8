import { useEffect } from 'react'
import {
  TrendingUp,
  Users,
  Car,
  PieChart,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export default function Statistics() {
  const { stats, fetchAllStats } = useAppStore()
  const {
    overview,
    monthlyData,
    statusData,
    topDrivers,
    topVehicles,
    vehicleTypeDistribution,
    revenueSummary,
  } = stats

  useEffect(() => {
    fetchAllStats()
  }, [fetchAllStats])

  const maxMonthlyCount = Math.max(...monthlyData.map((m) => m.count), 1)
  const maxMonthlyRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1)
  const totalOrders = statusData.reduce((sum, s) => sum + s.count, 0) || 1

  const totalVehicles = vehicleTypeDistribution.reduce((sum, v) => sum + v.count, 0) || 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">统计分析</h1>
        <p className="mt-1 text-sm text-gray-500">订单、营收、车辆、司机多维度数据分析</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总订单数</p>
              <p className="text-2xl font-bold text-gray-800">{overview?.totalOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">累计营收</p>
              <p className="text-2xl font-bold text-gray-800">
                ¥{(revenueSummary?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">净利润</p>
              <p className="text-2xl font-bold text-gray-800">
                ¥{(revenueSummary?.totalNetProfit || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">在岗司机</p>
              <p className="text-2xl font-bold text-gray-800">{overview?.totalDrivers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">月度订单与营收趋势</h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                订单数
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                营收(元)
              </span>
            </div>
          </div>
          <div className="mt-6 h-72">
            <div className="flex h-full items-end justify-between gap-2">
              {monthlyData.map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-full w-full items-end justify-center gap-1">
                    <div
                      className="w-4 rounded-t bg-rose-500 transition-all hover:bg-rose-600 relative group"
                      style={{ height: `${(item.count / maxMonthlyCount) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
                        {item.count} 单
                      </div>
                    </div>
                    <div
                      className="w-4 rounded-t bg-blue-400 transition-all hover:bg-blue-500 relative group"
                      style={{ height: `${(item.revenue / maxMonthlyRevenue) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
                        ¥{item.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">订单状态分布</h3>
          <div className="mt-6 space-y-4">
            {statusData.map((item) => {
              const percent = ((item.count / totalOrders) * 100).toFixed(1)
              const colors: Record<string, string> = {
                pending: 'bg-yellow-500',
                scheduled: 'bg-blue-500',
                departed: 'bg-purple-500',
                returned: 'bg-green-500',
                settled: 'bg-gray-500',
                cancelled: 'bg-red-500',
              }
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
                      className={cn('h-full rounded-full transition-all', colors[item.status])}
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
          <h3 className="text-lg font-semibold text-gray-800">营收构成</h3>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-gray-600">总营收</span>
              </div>
              <span className="text-xl font-bold text-gray-800">
                ¥{(revenueSummary?.totalRevenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="space-y-3 pl-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">司机费用</span>
                <span className="text-orange-600">
                  - ¥{(revenueSummary?.totalDriverFees || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">车辆成本</span>
                <span className="text-blue-600">
                  - ¥{(revenueSummary?.totalVehicleCosts || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-gray-700 font-medium">净利润</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                ¥{(revenueSummary?.totalNetProfit || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">车辆类型分布</h3>
          <div className="mt-6 flex items-center justify-center">
            <div className="relative h-48 w-48">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                {(() => {
                  const colors = ['#f43f5e', '#3b82f6', '#8b5cf6', '#6b7280']
                  let offset = 0
                  return vehicleTypeDistribution.map((item, index) => {
                    const percent = (item.count / totalVehicles) * 100
                    const circumference = 2 * Math.PI * 40
                    const dashArray = (percent / 100) * circumference
                    const dashOffset = -offset
                    offset += (percent / 100) * circumference
                    return (
                      <circle
                        key={item.type}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={colors[index % colors.length]}
                        strokeWidth="20"
                        strokeDasharray={`${dashArray} ${circumference}`}
                        strokeDashoffset={dashOffset}
                      />
                    )
                  })
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <PieChart className="h-8 w-8 text-gray-400" />
                <p className="mt-1 text-sm font-semibold text-gray-600">{totalVehicles} 辆</p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {vehicleTypeDistribution.map((item) => (
              <div key={item.type} className="flex items-center gap-2 text-sm">
                <div
                  className={cn(
                    'h-3 w-3 rounded-full',
                    item.type === 'luxury'
                      ? 'bg-rose-500'
                      : item.type === 'sedan'
                        ? 'bg-blue-500'
                        : item.type === 'suv'
                          ? 'bg-purple-500'
                          : 'bg-gray-500',
                  )}
                ></div>
                <span className="text-gray-600">{item.label}</span>
                <span className="ml-auto font-medium text-gray-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">司机排行榜</h3>
          <div className="mt-4 space-y-3">
            {topDrivers.map((driver, index) => (
              <div
                key={driver.driverId}
                className="flex items-center gap-4 rounded-lg border border-gray-100 p-4"
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white',
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
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <Users className="h-4 w-4" />
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

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">车辆使用排行</h3>
          <div className="mt-4 space-y-3">
            {topVehicles.map((vehicle, index) => (
              <div
                key={vehicle.vehicleId}
                className="flex items-center gap-4 rounded-lg border border-gray-100 p-4"
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white',
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
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Car className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{vehicle.plateNumber}</p>
                    <p className="text-xs text-gray-500">
                      {vehicle.brand} {vehicle.model}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-rose-600">
                    ¥{vehicle.totalFee.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{vehicle.orderCount} 单</p>
                </div>
              </div>
            ))}
            {topVehicles.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">暂无数据</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
