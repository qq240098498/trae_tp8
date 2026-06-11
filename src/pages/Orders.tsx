import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Eye,
  CalendarCheck,
  Car,
  Clock,
  CheckCircle2,
  X,
  ArrowRight,
  AlertTriangle,
  User,
  Trash2,
  Edit2,
  Flower2,
  Sparkles,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import {
  ORDER_STATUS_MAP,
  VEHICLE_ROLE_MAP,
  CAR_DECORATION_TYPE_MAP,
  type Order,
  type OrderVehicleDetail,
  type Vehicle,
  type Driver,
  type FlowerPackage,
  type CarDecoration,
} from '@/types'
import { api } from '@/services/api'
import { cn } from '@/lib/utils'

interface VehicleAssignment {
  id?: number
  vehicleId: number
  driverId: number
  role: 'lead' | 'follow'
  sequence: number
  estimatedMileage: number
  serviceFee: number
  driverFee: number
}

export default function Orders() {
  const { orders, fetchOrders, addOrder, updateOrder, deleteOrder, flowerPackages, carDecorations, fetchFlowerPackages, fetchCarDecorations } = useAppStore()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderVehicles, setOrderVehicles] = useState<OrderVehicleDetail[]>([])
  const [tab, setTab] = useState<'basic' | 'vehicles' | 'extras'>('basic')
  const [conflictInfo, setConflictInfo] = useState<{
    hasConflict: boolean
    conflictVehicles: Array<Vehicle & { conflictOrders?: { orderId: number; orderNo: string; timeRange: string }[] }>
    conflictDrivers: Driver[]
  } | null>(null)

  const [formData, setFormData] = useState<Partial<Order>>({
    groomName: '',
    brideName: '',
    groomPhone: '',
    bridePhone: '',
    weddingDate: '',
    departureTime: '08:00',
    returnTime: '18:00',
    pickupAddress: '',
    ceremonyAddress: '',
    dropoffAddress: '',
    totalAmount: 0,
    depositAmount: 0,
    remark: '',
  })

  const [vehicleAssignments, setVehicleAssignments] = useState<VehicleAssignment[]>(
    [],
  )

  const [availableResources, setAvailableResources] = useState<{
    vehicles: Vehicle[]
    drivers: Driver[]
  }>({ vehicles: [], drivers: [] })

  const [selectedFlowerPackageIds, setSelectedFlowerPackageIds] = useState<number[]>([])
  const [selectedCarDecorationIds, setSelectedCarDecorationIds] = useState<number[]>([])
  const [orderFlowerPackages, setOrderFlowerPackages] = useState<FlowerPackage[]>([])
  const [orderCarDecorations, setOrderCarDecorations] = useState<CarDecoration[]>([])

  useEffect(() => {
    fetchOrders({ status: statusFilter, keyword })
  }, [fetchOrders, statusFilter, keyword])

  useEffect(() => {
    fetchFlowerPackages({ status: 'active' })
    fetchCarDecorations({ status: 'active' })
  }, [fetchFlowerPackages, fetchCarDecorations])

  const checkConflict = useCallback(async (weddingDate: string, departureTime: string, returnTime: string) => {
    if (!weddingDate || !departureTime || !returnTime) return
    try {
      const vIds = vehicleAssignments.map((v) => v.vehicleId).filter(Boolean)
      const dIds = vehicleAssignments.map((v) => v.driverId).filter(Boolean)
      if (vIds.length === 0 && dIds.length === 0) {
        setConflictInfo(null)
        return
      }
      const result = await api.orders.checkConflict({
        weddingDate,
        departureTime,
        returnTime,
        vehicleIds: vIds,
        driverIds: dIds,
        excludeOrderId: editingOrder?.id,
      })
      setConflictInfo(result)
    } catch (err) {
      console.error(err)
    }
  }, [vehicleAssignments, editingOrder?.id])

  const loadAvailable = useCallback(async (date: string, departureTime?: string, returnTime?: string) => {
    if (!date) return
    try {
      const result = await api.orders.getAvailable(date, departureTime, returnTime)
      setAvailableResources(result)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    if (showModal && formData.weddingDate) {
      loadAvailable(formData.weddingDate, formData.departureTime, formData.returnTime)
      checkConflict(formData.weddingDate, formData.departureTime || '08:00', formData.returnTime || '18:00')
    }
  }, [showModal, formData.weddingDate, formData.departureTime, formData.returnTime, checkConflict, loadAvailable])

  useEffect(() => {
    if (showModal && formData.weddingDate && vehicleAssignments.length > 0) {
      checkConflict(formData.weddingDate, formData.departureTime || '08:00', formData.returnTime || '18:00')
    }
    if (showModal && formData.weddingDate && vehicleAssignments.length === 0) {
      setConflictInfo(null)
    }
  }, [showModal, formData.weddingDate, formData.departureTime, formData.returnTime, vehicleAssignments, checkConflict])

  const handleAdd = () => {
    setEditingOrder(null)
    setFormData({
      groomName: '',
      brideName: '',
      groomPhone: '',
      bridePhone: '',
      weddingDate: '',
      departureTime: '08:00',
      returnTime: '18:00',
      pickupAddress: '',
      ceremonyAddress: '',
      dropoffAddress: '',
      totalAmount: 0,
      depositAmount: 0,
      remark: '',
    })
    setVehicleAssignments([])
    setSelectedFlowerPackageIds([])
    setSelectedCarDecorationIds([])
    setConflictInfo(null)
    setTab('basic')
    setShowModal(true)
  }

  const handleEdit = async (order: Order) => {
    setEditingOrder(order)
    setFormData(order)
    setSelectedFlowerPackageIds(order.flowerPackageIds || [])
    setSelectedCarDecorationIds(order.carDecorationIds || [])
    try {
      const vehicles = await api.orders.getVehicles(order.id)
      const assignments = vehicles.map((v) => ({
        id: v.id,
        vehicleId: v.vehicleId,
        driverId: v.driverId,
        role: v.role,
        sequence: v.sequence,
        estimatedMileage: v.estimatedMileage,
        serviceFee: v.serviceFee,
        driverFee: v.driverFee,
      }))
      setVehicleAssignments(assignments as typeof vehicleAssignments)
    } catch (err) {
      console.error(err)
    }
    setTab('basic')
    setShowModal(true)
  }

  const handleView = async (order: Order) => {
    setSelectedOrder(order)
    try {
      const vehicles = await api.orders.getVehicles(order.id)
      setOrderVehicles(vehicles)
    } catch (err) {
      console.error(err)
    }
    try {
      const detail = await api.orders.get(order.id) as any
      setOrderFlowerPackages(detail.flowerPackages || [])
      setOrderCarDecorations(detail.carDecorations || [])
    } catch (err) {
      console.error(err)
    }
    setShowDetailModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除该订单吗？')) {
      try {
        await deleteOrder(id)
        fetchOrders({ status: statusFilter, keyword })
      } catch (err) {
        alert((err as Error).message)
      }
    }
  }

  const handleDepart = async (order: Order) => {
    if (!window.confirm('确认出车登记吗？')) return
    try {
      await api.orders.depart(order.id)
      fetchOrders({ status: statusFilter, keyword })
      alert('出车登记成功')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleReturn = async (order: Order) => {
    if (!window.confirm('确认返程核销吗？')) return
    try {
      await api.orders.return(order.id)
      fetchOrders({ status: statusFilter, keyword })
      alert('返程核销成功')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (vehicleAssignments.length === 0) {
        alert('请至少安排一辆车')
        setTab('vehicles')
        return
      }
      const orderData = {
        ...formData,
        vehicles: vehicleAssignments,
        flowerPackageIds: selectedFlowerPackageIds,
        carDecorationIds: selectedCarDecorationIds,
      }
      if (editingOrder) {
        await updateOrder(editingOrder.id, orderData as Parameters<typeof updateOrder>[1])
      } else {
        await addOrder(orderData as Parameters<typeof addOrder>[0])
      }
      setShowModal(false)
      fetchOrders({ status: statusFilter, keyword })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const addVehicleAssignment = () => {
    const newAssignment = {
      vehicleId: 0,
      driverId: 0,
      role: (vehicleAssignments.length === 0 ? 'lead' : 'follow') as 'lead' | 'follow',
      sequence: vehicleAssignments.length + 1,
      estimatedMileage: 50,
      serviceFee: 1000,
      driverFee: 500,
    }
    setVehicleAssignments([...vehicleAssignments, newAssignment])
  }

  const removeVehicleAssignment = (index: number) => {
    const newAssignments = vehicleAssignments.filter((_, i) => i !== index)
    newAssignments.forEach((v, i) => {
      v.sequence = i + 1
      if (i === 0) v.role = 'lead'
    })
    setVehicleAssignments([...newAssignments])
  }

  const updateVehicleAssignment = (
    index: number,
    field: keyof VehicleAssignment,
    value: string | number,
  ) => {
    const newAssignments = [...vehicleAssignments]
    newAssignments[index] = {
      ...newAssignments[index],
      [field]: value,
    } as VehicleAssignment
    setVehicleAssignments(newAssignments)
  }

  const calculateTotal = () => {
    const vehicleTotal = vehicleAssignments.reduce((sum, v) => sum + v.serviceFee, 0)
    const flowerTotal = selectedFlowerPackageIds.reduce((sum, id) => {
      const pkg = flowerPackages.find(p => p.id === id)
      return sum + (pkg?.price || 0)
    }, 0)
    const decorationTotal = selectedCarDecorationIds.reduce((sum, id) => {
      const dec = carDecorations.find(d => d.id === id)
      return sum + (dec?.price || 0)
    }, 0)
    return vehicleTotal + flowerTotal + decorationTotal
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">订单管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理婚礼订单和车辆排班</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          创建订单
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单号、新人姓名、电话..."
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
            <option value="pending">待排班</option>
            <option value="scheduled">已排班</option>
            <option value="departed">已出车</option>
            <option value="returned">已返程</option>
            <option value="settled">已结算</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">订单号</th>
              <th className="px-6 py-4 font-medium">新人信息</th>
              <th className="px-6 py-4 font-medium">婚礼日期</th>
              <th className="px-6 py-4 font-medium">时间</th>
              <th className="px-6 py-4 font-medium">金额</th>
              <th className="px-6 py-4 font-medium">状态</th>
              <th className="px-6 py-4 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {orders.map((order) => {
              const statusInfo = ORDER_STATUS_MAP[order.status]
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">{order.orderNo}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">
                      {order.groomName} &amp; {order.brideName}
                    </p>
                    <p className="text-xs text-gray-500">{order.groomPhone}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{order.weddingDate}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {order.departureTime} - {order.returnTime}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-rose-600">
                      ¥{order.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      定金 ¥{order.depositAmount.toLocaleString()}
                    </p>
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
                        onClick={() => handleView(order)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {order.status === 'pending' || order.status === 'scheduled' ? (
                        <button
                          onClick={() => handleEdit(order)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-amber-600"
                          title="编辑"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      ) : null}
                      {order.status === 'scheduled' && (
                        <button
                          onClick={() => handleDepart(order)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600"
                          title="出车登记"
                        >
                          <Car className="h-4 w-4" />
                        </button>
                      )}
                      {order.status === 'departed' && (
                        <button
                          onClick={() => handleReturn(order)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-purple-50 hover:text-purple-600"
                          title="返程核销"
                        >
                          <CheckCircle2 className="h-4 w-4" />
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
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  暂无订单数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingOrder ? '编辑订单' : '创建订单'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-100 px-6 flex-shrink-0">
              <button
                onClick={() => setTab('basic')}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  tab === 'basic'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                基本信息
              </button>
              <button
                onClick={() => setTab('vehicles')}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2',
                  tab === 'vehicles'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                车辆排班
                {vehicleAssignments.length > 0 && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-600">
                    {vehicleAssignments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTab('extras')}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2',
                  tab === 'extras'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                配套服务
                {(selectedFlowerPackageIds.length + selectedCarDecorationIds.length) > 0 && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-600">
                    {selectedFlowerPackageIds.length + selectedCarDecorationIds.length}
                  </span>
                )}
              </button>
            </div>

            {conflictInfo && conflictInfo.hasConflict && (
              <div className="mx-6 mt-4 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">档期冲突提醒</p>
                  <div className="mt-2 text-sm text-yellow-700 space-y-2">
                    {conflictInfo.conflictVehicles.length > 0 && (
                      <div>
                        <p className="font-medium mb-1">冲突车辆：</p>
                        <ul className="space-y-1 ml-2">
                          {conflictInfo.conflictVehicles.map((v) => (
                            <li key={v.id}>
                              <span className="font-medium">{v.plateNumber}</span>
                              <span className="text-yellow-600">（{v.brand} {v.model}）</span>
                              {v.conflictOrders && v.conflictOrders.length > 0 && (
                                <div className="ml-4 text-xs text-yellow-600 mt-0.5">
                                  与订单 {v.conflictOrders.map(o => `${o.orderNo}(${o.timeRange})`).join('、')} 时间重叠
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {conflictInfo.conflictDrivers.length > 0 && (
                      <div>
                        <p className="font-medium mb-1">冲突司机：</p>
                        <p className="ml-2">
                          {conflictInfo.conflictDrivers.map((d) => d.name).join('、')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              {tab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        新郎姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.groomName || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, groomName: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        新娘姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.brideName || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, brideName: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">新郎电话</label>
                      <input
                        type="tel"
                        value={formData.groomPhone || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, groomPhone: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">新娘电话</label>
                      <input
                        type="tel"
                        value={formData.bridePhone || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, bridePhone: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        婚礼日期 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.weddingDate || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, weddingDate: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">出发时间</label>
                      <input
                        type="time"
                        value={formData.departureTime || '08:00'}
                        onChange={(e) =>
                          setFormData({ ...formData, departureTime: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">返程时间</label>
                      <input
                        type="time"
                        value={formData.returnTime || '18:00'}
                        onChange={(e) =>
                          setFormData({ ...formData, returnTime: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      接亲地址 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pickupAddress || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupAddress: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      placeholder="新郎家地址"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      典礼地址 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.ceremonyAddress || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, ceremonyAddress: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      placeholder="酒店/教堂地址"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">送回地址</label>
                    <input
                      type="text"
                      value={formData.dropoffAddress || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, dropoffAddress: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      placeholder="新房地址（可选）"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">总金额（元）</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.totalAmount || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, totalAmount: Number(e.target.value) })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        费用合计：¥{calculateTotal().toLocaleString()}（车辆 + 配套）
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">定金（元）</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.depositAmount || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, depositAmount: Number(e.target.value) })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">备注</label>
                    <textarea
                      value={formData.remark || ''}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              )}

              {tab === 'vehicles' && (
                <div className="space-y-4">
                  {!formData.weddingDate ? (
                    <div className="py-8 text-center text-gray-400">
                      请先在「基本信息」中选择婚礼日期
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          可用车辆：{availableResources.vehicles.length} 辆 · 可用司机：
                          {availableResources.drivers.length} 人
                        </p>
                        <button
                          type="button"
                          onClick={addVehicleAssignment}
                          className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700"
                        >
                          <Plus className="h-4 w-4" />
                          添加车辆
                        </button>
                      </div>

                      {vehicleAssignments.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
                          <Car className="mx-auto h-12 w-12 text-gray-300" />
                          <p className="mt-2 text-sm text-gray-500">暂无车辆安排</p>
                          <button
                            type="button"
                            onClick={addVehicleAssignment}
                            className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600 hover:bg-rose-100"
                          >
                            添加第一辆车
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {vehicleAssignments.map((assignment, index) => (
                            <div
                              key={index}
                              className="rounded-lg border border-gray-200 p-4"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                                  {VEHICLE_ROLE_MAP[assignment.role]} · 第{assignment.sequence}车
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeVehicleAssignment(index)}
                                  className="text-sm text-red-500 hover:text-red-700"
                                >
                                  移除
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="mb-1 block text-xs text-gray-500">
                                    选择车辆
                                  </label>
                                  <select
                                    value={assignment.vehicleId}
                                    onChange={(e) =>
                                      updateVehicleAssignment(
                                        index,
                                        'vehicleId',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                                  >
                                    <option value={0}>请选择车辆</option>
                                    {availableResources.vehicles.map((v) => (
                                      <option key={v.id} value={v.id}>
                                        {v.plateNumber} - {v.brand}{v.model}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs text-gray-500">
                                    选择司机
                                  </label>
                                  <select
                                    value={assignment.driverId}
                                    onChange={(e) =>
                                      updateVehicleAssignment(
                                        index,
                                        'driverId',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                                  >
                                    <option value={0}>请选择司机</option>
                                    {availableResources.drivers.map((d) => (
                                      <option key={d.id} value={d.id}>
                                        {d.name} - {d.phone}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs text-gray-500">
                                    预计里程(km)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={assignment.estimatedMileage}
                                    onChange={(e) =>
                                      updateVehicleAssignment(
                                        index,
                                        'estimatedMileage',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs text-gray-500">
                                    服务费用(元)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={assignment.serviceFee}
                                    onChange={(e) =>
                                      updateVehicleAssignment(
                                        index,
                                        'serviceFee',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs text-gray-500">
                                    司机费用(元)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={assignment.driverFee}
                                    onChange={(e) =>
                                      updateVehicleAssignment(
                                        index,
                                        'driverFee',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs text-gray-500">角色</label>
                                  <select
                                    value={assignment.role}
                                    onChange={(e) =>
                                      updateVehicleAssignment(
                                        index,
                                        'role',
                                        e.target.value,
                                      )
                                    }
                                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                                  >
                                    <option value="lead">主婚车</option>
                                    <option value="follow">跟车</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {tab === 'extras' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Flower2 className="h-4 w-4 text-rose-500" />
                      鲜花配套套餐
                    </h4>
                    {flowerPackages.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">暂无可用套餐</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {flowerPackages.map((pkg) => {
                          const isSelected = selectedFlowerPackageIds.includes(pkg.id)
                          const availableStock = (pkg.stock || 0) - (pkg.usedStock || 0)
                          const outOfStock = availableStock <= 0
                          const lowStock = availableStock > 0 && availableStock <= 2
                          const isDisabled = outOfStock || pkg.status !== 'active'
                          return (
                            <label
                              key={pkg.id}
                              className={cn(
                                'flex items-start gap-3 rounded-lg border p-4 transition-colors',
                                isDisabled
                                  ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                                  : isSelected
                                    ? 'border-rose-300 bg-rose-50 cursor-pointer'
                                    : 'border-gray-200 hover:border-gray-300 cursor-pointer',
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={(e) => {
                                  if (isDisabled) return
                                  if (e.target.checked) {
                                    setSelectedFlowerPackageIds([...selectedFlowerPackageIds, pkg.id])
                                  } else {
                                    setSelectedFlowerPackageIds(selectedFlowerPackageIds.filter(id => id !== pkg.id))
                                  }
                                }}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 disabled:cursor-not-allowed"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">{pkg.name}</span>
                                    {outOfStock ? (
                                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">已售罄</span>
                                    ) : lowStock ? (
                                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">仅剩 {availableStock} 份</span>
                                    ) : (
                                      <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">库存 {availableStock}</span>
                                    )}
                                  </div>
                                  <span className="font-semibold text-rose-600">¥{pkg.price.toLocaleString()}</span>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">{pkg.description}</p>
                                <p className="mt-1 text-xs text-gray-400">包含：{pkg.items}</p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-rose-500" />
                      婚车装饰
                    </h4>
                    {carDecorations.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">暂无可用装饰</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {carDecorations.map((dec) => {
                          const isSelected = selectedCarDecorationIds.includes(dec.id)
                          const availableStock = (dec.stock || 0) - (dec.usedStock || 0)
                          const outOfStock = availableStock <= 0
                          const lowStock = availableStock > 0 && availableStock <= 2
                          const isDisabled = outOfStock || dec.status !== 'active'
                          return (
                            <label
                              key={dec.id}
                              className={cn(
                                'flex items-start gap-3 rounded-lg border p-4 transition-colors',
                                isDisabled
                                  ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                                  : isSelected
                                    ? 'border-rose-300 bg-rose-50 cursor-pointer'
                                    : 'border-gray-200 hover:border-gray-300 cursor-pointer',
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={(e) => {
                                  if (isDisabled) return
                                  if (e.target.checked) {
                                    setSelectedCarDecorationIds([...selectedCarDecorationIds, dec.id])
                                  } else {
                                    setSelectedCarDecorationIds(selectedCarDecorationIds.filter(id => id !== dec.id))
                                  }
                                }}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 disabled:cursor-not-allowed"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">{dec.name}</span>
                                    {outOfStock ? (
                                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">已售罄</span>
                                    ) : lowStock ? (
                                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">仅剩 {availableStock} 份</span>
                                    ) : (
                                      <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">库存 {availableStock}</span>
                                    )}
                                  </div>
                                  <span className="font-semibold text-rose-600">¥{dec.price.toLocaleString()}</span>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                    {CAR_DECORATION_TYPE_MAP[dec.decorationType] || dec.decorationType}
                                  </span>
                                  {dec.applicableVehicleTypes && (
                                    <span className="text-xs text-gray-400">适用：{dec.applicableVehicleTypes}</span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">{dec.description}</p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {(selectedFlowerPackageIds.length > 0 || selectedCarDecorationIds.length > 0) && (
                    <div className="rounded-lg bg-rose-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">配套服务合计</span>
                        <span className="text-lg font-bold text-rose-600">
                          ¥{(
                            selectedFlowerPackageIds.reduce((sum, id) => {
                              const pkg = flowerPackages.find(p => p.id === id)
                              return sum + (pkg?.price || 0)
                            }, 0) +
                            selectedCarDecorationIds.reduce((sum, id) => {
                              const dec = carDecorations.find(d => d.id === id)
                              return sum + (dec?.price || 0)
                            }, 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  取消
                </button>
                {tab === 'basic' && (
                  <button
                    type="button"
                    onClick={() => setTab('vehicles')}
                    className="flex items-center gap-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                  >
                    下一步：车辆排班
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {tab === 'vehicles' && (
                  <button
                    type="button"
                    onClick={() => setTab('extras')}
                    className="flex items-center gap-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                  >
                    下一步：配套服务
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {tab === 'extras' && (
                  <button
                    type="submit"
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                  >
                    {editingOrder ? '保存修改' : '创建订单'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">订单详情</h3>
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
                  <h4 className="mt-1 text-xl font-bold text-gray-800">
                    {selectedOrder.groomName} &amp; {selectedOrder.brideName}
                  </h4>
                </div>
                <span
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium',
                    ORDER_STATUS_MAP[selectedOrder.status]?.color,
                  )}
                >
                  {ORDER_STATUS_MAP[selectedOrder.status]?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <CalendarCheck className="h-5 w-5 text-rose-500" />
                  <div>
                    <p className="text-xs text-gray-500">婚礼日期</p>
                    <p className="font-medium text-gray-800">{selectedOrder.weddingDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-rose-500" />
                  <div>
                    <p className="text-xs text-gray-500">服务时间</p>
                    <p className="font-medium text-gray-800">
                      {selectedOrder.departureTime} - {selectedOrder.returnTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-800">行程信息</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-xs text-gray-500">接亲</p>
                      <p className="text-gray-700">{selectedOrder.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-rose-500"></div>
                    <div>
                      <p className="text-xs text-gray-500">典礼</p>
                      <p className="text-gray-700">{selectedOrder.ceremonyAddress}</p>
                    </div>
                  </div>
                  {selectedOrder.dropoffAddress && (
                    <div className="flex items-start gap-2">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-xs text-gray-500">送回</p>
                        <p className="text-gray-700">{selectedOrder.dropoffAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-800">车辆排班</h5>
                {orderVehicles.length === 0 ? (
                  <p className="text-sm text-gray-400">暂无车辆安排</p>
                ) : (
                  <div className="space-y-3">
                    {orderVehicles.map((ov, index) => (
                      <div
                        key={ov.id}
                        className="flex items-center gap-4 rounded-lg border border-gray-100 p-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">
                              {ov.vehicle?.plateNumber}
                            </span>
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {VEHICLE_ROLE_MAP[ov.role]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {ov.vehicle?.brand} {ov.vehicle?.model}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                            <User className="h-3 w-3" />
                            {ov.driver?.name} · {ov.driver?.phone}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-rose-600">
                            ¥{ov.serviceFee.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            预计 {ov.estimatedMileage}km
                          </p>
                          {ov.actualMileage && (
                            <p className="text-xs text-green-600">
                              实际 {ov.actualMileage}km
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(orderFlowerPackages.length > 0 || orderCarDecorations.length > 0) && (
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-800">配套服务</h5>
                  {orderFlowerPackages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Flower2 className="h-3 w-3" />
                        鲜花套餐
                      </p>
                      {orderFlowerPackages.map((pkg) => (
                        <div key={pkg.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                          <div>
                            <span className="text-sm font-medium text-gray-800">{pkg.name}</span>
                            <p className="text-xs text-gray-400">{pkg.items}</p>
                          </div>
                          <span className="text-sm font-semibold text-rose-600">¥{pkg.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {orderCarDecorations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        婚车装饰
                      </p>
                      {orderCarDecorations.map((dec) => (
                        <div key={dec.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800">{dec.name}</span>
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                {CAR_DECORATION_TYPE_MAP[dec.decorationType] || dec.decorationType}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{dec.description}</p>
                          </div>
                          <span className="text-sm font-semibold text-rose-600">¥{dec.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">订单总额</span>
                  <span className="text-2xl font-bold text-rose-600">
                    ¥{selectedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">已收定金</span>
                  <span className="text-gray-700">
                    ¥{selectedOrder.depositAmount.toLocaleString()}
                  </span>
                </div>
                {selectedOrder.remark && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500">备注</p>
                    <p className="mt-1 text-sm text-gray-700">{selectedOrder.remark}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
