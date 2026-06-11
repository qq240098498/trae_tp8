import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  UserCheck,
  X,
  Car,
  AlertTriangle,
  DollarSign,
  Calendar,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import {
  REPAIR_STATUS_MAP,
  REPAIR_TYPE_MAP,
  REPAIR_PRIORITY_MAP,
  REPAIR_TYPE_OPTIONS,
  REPAIR_PRIORITY_OPTIONS,
  REPAIR_STATUS_OPTIONS,
  type RepairOrder,
  type Vehicle,
} from '@/types'
import { cn } from '@/lib/utils'

export default function RepairOrders() {
  const {
    repairOrders,
    fetchRepairOrders,
    addRepairOrder,
    updateRepairOrder,
    deleteRepairOrder,
    assignRepairOrder,
    startRepairOrder,
    completeRepairOrder,
    cancelRepairOrder,
    vehicles,
    fetchVehicles,
  } = useAppStore()

  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [vehicleFilter, setVehicleFilter] = useState<string>('all')

  const [showReportModal, setShowReportModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null)
  const [editingOrder, setEditingOrder] = useState<RepairOrder | null>(null)

  const [reportForm, setReportForm] = useState<Partial<RepairOrder>>({
    vehicleId: 0,
    reporter: '',
    repairType: 'repair',
    priority: 'normal',
    title: '',
    description: '',
    mileage: 0,
  })

  const [assignForm, setAssignForm] = useState({
    assignee: '',
    serviceProvider: '',
    estimatedCost: 0,
    startDate: '',
  })

  const [completeForm, setCompleteForm] = useState({
    actualCost: 0,
    completeDate: '',
    repairItems: '',
    remark: '',
  })

  useEffect(() => {
    fetchRepairOrders({ status: statusFilter, vehicleId: vehicleFilter, keyword })
    fetchVehicles({ status: 'all' })
  }, [fetchRepairOrders, fetchVehicles, statusFilter, vehicleFilter, keyword])

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!reportForm.vehicleId) {
        alert('请选择车辆')
        return
      }
      if (!reportForm.title) {
        alert('请填写维修标题')
        return
      }
      await addRepairOrder(reportForm)
      setShowReportModal(false)
      resetReportForm()
      fetchRepairOrders({ status: statusFilter, vehicleId: vehicleFilter, keyword })
      alert('报修成功')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleEdit = (order: RepairOrder) => {
    setEditingOrder(order)
    setReportForm({
      vehicleId: order.vehicleId,
      reporter: order.reporter,
      repairType: order.repairType,
      priority: order.priority,
      title: order.title,
      description: order.description,
      mileage: order.mileage,
    })
    setShowReportModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!editingOrder) return
      await updateRepairOrder(editingOrder.id, reportForm)
      setShowReportModal(false)
      resetReportForm()
      fetchRepairOrders({ status: statusFilter, vehicleId: vehicleFilter, keyword })
      alert('更新成功')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除该维修工单吗？')) {
      try {
        await deleteRepairOrder(id)
        fetchRepairOrders({ status: statusFilter, vehicleId: vehicleFilter, keyword })
      } catch (err) {
        alert((err as Error).message)
      }
    }
  }

  const handleAssign = (order: RepairOrder) => {
    setSelectedOrder(order)
    setAssignForm({
      assignee: order.assignee || '',
      serviceProvider: order.serviceProvider || '',
      estimatedCost: order.estimatedCost || 0,
      startDate: order.startDate || new Date().toISOString().slice(0, 10),
    })
    setShowAssignModal(true)
  }

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!selectedOrder) return
      await assignRepairOrder(selectedOrder.id, assignForm)
      setShowAssignModal(false)
      fetchRepairOrders({ status: statusFilter, vehicleId: vehicleFilter, keyword })
      alert('派修成功')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleStart = async (order: RepairOrder) => {
    if (!window.confirm('确认开始维修吗？')) return
    try {
      await startRepairOrder(order.id)
      fetchRepairOrders({ status: statusFilter, vehicleId: vehicleFilter, keyword })
      alert('已开始维修')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleComplete = (order: RepairOrder) => {
    setSelectedOrder(order)
    setCompleteForm({
      actualCost: order.actualCost || 0,
      completeDate: order.completeDate || new Date().toISOString().slice(0, 10),
      repairItems: order.repairItems || '',
      remark: order.remark || '',
    })
    setShowCompleteModal(true)
  }

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!selectedOrder) return
      await completeRepairOrder(selectedOrder.id, completeForm)
      setShowCompleteModal(false)
      fetchRepairOrders({ status: statusFilter, vehicleId: vehicleFilter, keyword })
      alert('维修完成')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleCancel = async (order: RepairOrder) => {
    if (!window.confirm('确认取消该维修工单吗？')) return
    try {
      await cancelRepairOrder(order.id)
      fetchRepairOrders({ status: statusFilter, vehicleId: vehicleFilter, keyword })
      alert('已取消')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleView = (order: RepairOrder) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const resetReportForm = () => {
    setReportForm({
      vehicleId: 0,
      reporter: '',
      repairType: 'repair',
      priority: 'normal',
      title: '',
      description: '',
      mileage: 0,
    })
    setEditingOrder(null)
  }

  const getVehicleInfo = (vehicleId: number): Vehicle | undefined => {
    return vehicles.find((v) => v.id === vehicleId)
  }

  const stats = {
    pending: repairOrders.filter((o) => o.status === 'pending').length,
    assigned: repairOrders.filter((o) => o.status === 'assigned').length,
    in_progress: repairOrders.filter((o) => o.status === 'in_progress').length,
    completed: repairOrders.filter((o) => o.status === 'completed').length,
  }

  const totalCost = repairOrders
    .filter((o) => o.status === 'completed' && o.actualCost)
    .reduce((sum, o) => sum + (o.actualCost || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">维修工单管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理车辆报修、派修、维修状态跟踪</p>
        </div>
        <button
          onClick={() => {
            resetReportForm()
            setShowReportModal(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          发起报修
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              <p className="text-xs text-gray-500">待派修</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.assigned}</p>
              <p className="text-xs text-gray-500">已派修</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Wrench className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.in_progress}</p>
              <p className="text-xs text-gray-500">维修中</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
              <p className="text-xs text-gray-500">已完成</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rose-100 p-2">
              <DollarSign className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">¥{totalCost.toLocaleString()}</p>
              <p className="text-xs text-gray-500">累计维修费用</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索工单号、标题、报修人、车牌号..."
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
            {REPAIR_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="all">全部车辆</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plateNumber} - {v.brand}{v.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">工单号</th>
              <th className="px-6 py-4 font-medium">车辆信息</th>
              <th className="px-6 py-4 font-medium">维修信息</th>
              <th className="px-6 py-4 font-medium">费用</th>
              <th className="px-6 py-4 font-medium">状态</th>
              <th className="px-6 py-4 font-medium">报修人</th>
              <th className="px-6 py-4 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {repairOrders.map((order) => {
              const statusInfo = REPAIR_STATUS_MAP[order.status]
              const typeInfo = REPAIR_TYPE_MAP[order.repairType]
              const priorityInfo = REPAIR_PRIORITY_MAP[order.priority]
              const vehicle = getVehicleInfo(order.vehicleId)
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs text-gray-600">{order.orderNo}</p>
                    <p className="mt-1 text-xs text-gray-400">{order.reportDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {order.vehiclePlate || vehicle?.plateNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {vehicle?.brand} {vehicle?.model}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800">{order.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={cn('rounded-full px-2 py-0.5 text-xs', typeInfo?.color)}>
                          {typeInfo?.label}
                        </span>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs', priorityInfo?.color)}>
                          {priorityInfo?.label}
                        </span>
                      </div>
                      {order.assignee && (
                        <p className="text-xs text-gray-500">维修人员：{order.assignee}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {order.estimatedCost ? (
                      <div>
                        <p className="text-gray-600">
                          预估：<span className="font-medium">¥{order.estimatedCost.toLocaleString()}</span>
                        </p>
                        {order.actualCost !== undefined && order.actualCost > 0 && (
                          <p className="text-rose-600 font-semibold">
                            实际：¥{order.actualCost.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
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
                    {order.startDate && order.status !== 'pending' && (
                      <p className="mt-1 text-xs text-gray-400">
                        开始：{order.startDate}
                      </p>
                    )}
                    {order.completeDate && order.status === 'completed' && (
                      <p className="text-xs text-gray-400">
                        完成：{order.completeDate}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {order.reporter}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleView(order)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleEdit(order)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-amber-600"
                            title="编辑"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAssign(order)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            title="派修"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {order.status === 'assigned' && (
                        <button
                          onClick={() => handleStart(order)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-purple-50 hover:text-purple-600"
                          title="开始维修"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {order.status === 'in_progress' && (
                        <button
                          onClick={() => handleComplete(order)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600"
                          title="完成维修"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'assigned' || order.status === 'in_progress') && (
                        <button
                          onClick={() => handleCancel(order)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          title="取消"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {repairOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  暂无维修工单数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingOrder ? '编辑报修' : '发起报修'}
              </h3>
              <button
                onClick={() => {
                  setShowReportModal(false)
                  resetReportForm()
                }}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={editingOrder ? handleUpdate : handleReport}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    选择车辆 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportForm.vehicleId || 0}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, vehicleId: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  >
                    <option value={0}>请选择车辆</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plateNumber} - {v.brand}{v.model} ({v.status === 'maintenance' ? '维修中' : '可用'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    报修人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reportForm.reporter || ''}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, reporter: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="请输入报修人姓名"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    维修类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportForm.repairType || 'repair'}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        repairType: e.target.value as RepairOrder['repairType'],
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {REPAIR_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    优先级 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportForm.priority || 'normal'}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        priority: e.target.value as RepairOrder['priority'],
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {REPAIR_PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  维修标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reportForm.title || ''}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="请简要描述维修问题"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  详细描述
                </label>
                <textarea
                  value={reportForm.description || ''}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="请详细描述故障现象和维修需求"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  当前里程（km）
                </label>
                <input
                  type="number"
                  min="0"
                  value={reportForm.mileage || 0}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, mileage: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false)
                    resetReportForm()
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                >
                  {editingOrder ? '更新' : '提交报修'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">派修 - {selectedOrder.orderNo}</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleAssignSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">工单信息</p>
                    <p className="mt-1">
                      {selectedOrder.title} - {selectedOrder.vehiclePlate}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  维修人员 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={assignForm.assignee}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, assignee: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="请输入维修人员姓名"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  服务商
                </label>
                <input
                  type="text"
                  value={assignForm.serviceProvider}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, serviceProvider: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="如：奔驰4S店、修理厂等"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    预估费用（元）
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={assignForm.estimatedCost}
                    onChange={(e) =>
                      setAssignForm({
                        ...assignForm,
                        estimatedCost: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    预计开始日期
                  </label>
                  <input
                    type="date"
                    value={assignForm.startDate}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, startDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  确认派修
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompleteModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">完成维修 - {selectedOrder.orderNo}</h3>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleCompleteSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">确认维修已完成</p>
                    <p className="mt-1">
                      {selectedOrder.title} - {selectedOrder.vehiclePlate}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    实际费用（元） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={completeForm.actualCost}
                    onChange={(e) =>
                      setCompleteForm({
                        ...completeForm,
                        actualCost: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    完成日期
                  </label>
                  <input
                    type="date"
                    value={completeForm.completeDate}
                    onChange={(e) =>
                      setCompleteForm({ ...completeForm, completeDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  维修项目明细
                </label>
                <textarea
                  value={completeForm.repairItems}
                  onChange={(e) =>
                    setCompleteForm({ ...completeForm, repairItems: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="请填写实际维修项目，如：更换机油、机滤等"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  备注
                </label>
                <textarea
                  value={completeForm.remark}
                  onChange={(e) =>
                    setCompleteForm({ ...completeForm, remark: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="下次保养时间、注意事项等"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  确认完成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">工单详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-gray-500">{selectedOrder.orderNo}</p>
                  <h4 className="text-xl font-semibold text-gray-800 mt-1">
                    {selectedOrder.title}
                  </h4>
                </div>
                <span
                  className={cn(
                    'inline-block rounded-full px-4 py-1.5 text-sm font-medium',
                    REPAIR_STATUS_MAP[selectedOrder.status]?.color,
                  )}
                >
                  {REPAIR_STATUS_MAP[selectedOrder.status]?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                    <Car className="h-4 w-4" />
                    <span>车辆信息</span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {selectedOrder.vehiclePlate}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getVehicleInfo(selectedOrder.vehicleId)?.brand}{' '}
                    {getVehicleInfo(selectedOrder.vehicleId)?.model}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>报修日期</span>
                  </div>
                  <p className="font-medium text-gray-800">{selectedOrder.reportDate}</p>
                  <p className="text-sm text-gray-500">报修人：{selectedOrder.reporter}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <span
                    className={cn(
                      'inline-block rounded-full px-3 py-1 text-xs font-medium',
                      REPAIR_TYPE_MAP[selectedOrder.repairType]?.color,
                    )}
                  >
                    {REPAIR_TYPE_MAP[selectedOrder.repairType]?.label}
                  </span>
                  <span
                    className={cn(
                      'inline-block rounded-full px-3 py-1 text-xs font-medium',
                      REPAIR_PRIORITY_MAP[selectedOrder.priority]?.color,
                    )}
                  >
                    {REPAIR_PRIORITY_MAP[selectedOrder.priority]?.label}
                  </span>
                </div>

                {selectedOrder.assignee && (
                  <div>
                    <p className="text-sm text-gray-500">维修人员</p>
                    <p className="font-medium text-gray-800">{selectedOrder.assignee}</p>
                    {selectedOrder.serviceProvider && (
                      <p className="text-sm text-gray-500">
                        服务商：{selectedOrder.serviceProvider}
                      </p>
                    )}
                  </div>
                )}

                {selectedOrder.mileage && (
                  <div>
                    <p className="text-sm text-gray-500">报修时里程</p>
                    <p className="font-medium text-gray-800">{selectedOrder.mileage.toLocaleString()} km</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">问题描述</p>
                  <p className="text-gray-800">{selectedOrder.description}</p>
                </div>

                {selectedOrder.repairItems && (
                  <div>
                    <p className="text-sm text-gray-500">维修项目</p>
                    <p className="text-gray-800">{selectedOrder.repairItems}</p>
                  </div>
                )}

                {(selectedOrder.estimatedCost || selectedOrder.actualCost) && (
                  <div className="rounded-lg bg-rose-50 p-4">
                    <div className="flex items-center justify-between">
                      {selectedOrder.estimatedCost && (
                        <div>
                          <p className="text-sm text-gray-500">预估费用</p>
                          <p className="text-lg font-semibold text-gray-800">
                            ¥{selectedOrder.estimatedCost.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {selectedOrder.actualCost && (
                        <div className="text-right">
                          <p className="text-sm text-rose-600">实际费用</p>
                          <p className="text-xl font-bold text-rose-600">
                            ¥{selectedOrder.actualCost.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.remark && (
                  <div>
                    <p className="text-sm text-gray-500">备注</p>
                    <p className="text-gray-800">{selectedOrder.remark}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
                  <p>创建时间：{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p>更新时间：{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
