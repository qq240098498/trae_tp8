import { useState, useEffect } from 'react'
import { DollarSign, Search, CheckCircle, FileText, X, Eye } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { SETTLEMENT_STATUS_MAP, type Settlement } from '@/types'
import { cn } from '@/lib/utils'

export default function Settlements() {
  const { settlements, orders, fetchSettlements, fetchOrders, createSettlement, paySettlement } =
    useAppStore()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [keyword, setKeyword] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)

  useEffect(() => {
    fetchSettlements({ status: statusFilter })
    fetchOrders({ status: 'returned' })
  }, [fetchSettlements, fetchOrders, statusFilter])

  const returnedOrders = orders.filter(
    (o) => o.status === 'returned' && !settlements.some((s) => s.orderId === o.id),
  )

  const handleCreate = () => {
    setSelectedOrderId(null)
    setShowCreateModal(true)
  }

  const handleConfirmCreate = async () => {
    if (!selectedOrderId) {
      alert('请选择订单')
      return
    }
    try {
      await createSettlement(selectedOrderId)
      setShowCreateModal(false)
      fetchSettlements({ status: statusFilter })
      fetchOrders({ status: 'returned' })
      alert('结算单创建成功')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleView = (settlement: Settlement) => {
    setSelectedSettlement(settlement)
    setShowDetailModal(true)
  }

  const handlePay = async (id: number) => {
    if (!window.confirm('确认标记为已支付吗？')) return
    try {
      await paySettlement(id)
      fetchSettlements({ status: statusFilter })
      alert('支付成功')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const filteredSettlements = settlements.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (keyword && !s.orderNo.toLowerCase().includes(keyword.toLowerCase())) return false
    return true
  })

  const totalPending = settlements
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + s.totalAmount, 0)

  const totalPaid = settlements
    .filter((s) => s.status === 'paid')
    .reduce((sum, s) => sum + s.totalAmount, 0)

  const totalProfit = settlements
    .filter((s) => s.status === 'paid')
    .reduce((sum, s) => sum + s.netProfit, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">结算管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理订单结算和费用核算</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          <DollarSign className="h-4 w-4" />
          创建结算
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待结算金额</p>
              <p className="mt-2 text-2xl font-bold text-yellow-600">
                ¥{totalPending.toLocaleString()}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            {settlements.filter((s) => s.status === 'pending').length} 笔待支付
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已结算金额</p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                ¥{totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            {settlements.filter((s) => s.status === 'paid').length} 笔已支付
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">净利润</p>
              <p className="mt-2 text-2xl font-bold text-rose-600">
                ¥{totalProfit.toLocaleString()}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">已结算订单净收益</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单号..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="all">全部状态</option>
            <option value="pending">待支付</option>
            <option value="paid">已支付</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">结算单号</th>
              <th className="px-6 py-4 font-medium">关联订单</th>
              <th className="px-6 py-4 font-medium">订单总额</th>
              <th className="px-6 py-4 font-medium">司机费用</th>
              <th className="px-6 py-4 font-medium">车辆成本</th>
              <th className="px-6 py-4 font-medium">净利润</th>
              <th className="px-6 py-4 font-medium">状态</th>
              <th className="px-6 py-4 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredSettlements.map((settlement) => {
              const statusInfo = SETTLEMENT_STATUS_MAP[settlement.status]
              return (
                <tr key={settlement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    #JS{String(settlement.id).padStart(5, '0')}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{settlement.orderNo}</td>
                  <td className="px-6 py-4 text-gray-600">
                    ¥{settlement.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    ¥{settlement.driverFees.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    ¥{settlement.vehicleCosts.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    ¥{settlement.netProfit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-block rounded-full px-3 py-1 text-xs font-medium',
                        statusInfo?.color,
                      )}
                    >
                      {statusInfo?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleView(settlement)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {settlement.status === 'pending' && (
                        <button
                          onClick={() => handlePay(settlement.id)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600"
                          title="标记支付"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredSettlements.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  暂无结算数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">创建结算单</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {returnedOrders.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  暂无待结算的订单
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    选择订单
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {returnedOrders.map((order) => (
                      <label
                        key={order.id}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                          selectedOrderId === order.id
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300',
                        )}
                      >
                        <input
                          type="radio"
                          name="order"
                          value={order.id}
                          checked={selectedOrderId === order.id}
                          onChange={() => setSelectedOrderId(order.id)}
                          className="text-rose-600"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {order.groomName} &amp; {order.brideName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.orderNo} · {order.weddingDate}
                          </p>
                        </div>
                        <p className="font-semibold text-rose-600">
                          ¥{order.totalAmount.toLocaleString()}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmCreate}
                  disabled={!selectedOrderId}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                    selectedOrderId
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-gray-300 cursor-not-allowed',
                  )}
                >
                  创建结算
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">结算单详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">结算单号</span>
                <span className="font-mono text-sm">
                  #JS{String(selectedSettlement.id).padStart(5, '0')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">关联订单</span>
                <span className="font-medium">{selectedSettlement.orderNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">状态</span>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    SETTLEMENT_STATUS_MAP[selectedSettlement.status]?.color,
                  )}
                >
                  {SETTLEMENT_STATUS_MAP[selectedSettlement.status]?.label}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="font-medium text-gray-800">费用明细</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">订单总额</span>
                    <span className="font-medium">
                      ¥{selectedSettlement.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">司机费用</span>
                    <span className="text-gray-600">
                      - ¥{selectedSettlement.driverFees.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">车辆成本</span>
                    <span className="text-gray-600">
                      - ¥{selectedSettlement.vehicleCosts.toLocaleString()}
                    </span>
                  </div>
                  {selectedSettlement.extraFees > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">额外费用</span>
                      <span className="text-gray-600">
                        - ¥{selectedSettlement.extraFees.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">净利润</span>
                    <span className="text-xl font-bold text-green-600">
                      ¥{selectedSettlement.netProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedSettlement.paidAt && (
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-sm text-green-700">
                    支付时间：{new Date(selectedSettlement.paidAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              )}

              {selectedSettlement.status === 'pending' && (
                <button
                  onClick={() => {
                    handlePay(selectedSettlement.id)
                    setShowDetailModal(false)
                  }}
                  className="w-full rounded-lg bg-rose-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                >
                  确认支付
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
