import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Car, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { VEHICLE_STATUS_MAP, VEHICLE_TYPE_MAP, type Vehicle } from '@/types'
import { cn } from '@/lib/utils'

export default function Vehicles() {
  const { vehicles, fetchVehicles, addVehicle, updateVehicle, deleteVehicle } = useAppStore()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    plateNumber: '',
    brand: '',
    model: '',
    color: '',
    vehicleType: 'sedan',
    decorationType: '标准鲜花装饰',
    seatCount: 5,
    purchaseYear: new Date().getFullYear(),
    status: 'available',
    remark: '',
  })

  useEffect(() => {
    fetchVehicles({ status: statusFilter, vehicleType: typeFilter, keyword })
  }, [fetchVehicles, statusFilter, typeFilter, keyword])

  const handleAdd = () => {
    setEditingVehicle(null)
    setFormData({
      plateNumber: '',
      brand: '',
      model: '',
      color: '',
      vehicleType: 'sedan',
      decorationType: '标准鲜花装饰',
      seatCount: 5,
      purchaseYear: new Date().getFullYear(),
      status: 'available',
      remark: '',
    })
    setShowModal(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData(vehicle)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除该车辆吗？')) {
      try {
        await deleteVehicle(id)
        fetchVehicles({ status: statusFilter, vehicleType: typeFilter, keyword })
      } catch (err) {
        alert((err as Error).message)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, formData)
      } else {
        await addVehicle(formData)
      }
      setShowModal(false)
      fetchVehicles({ status: statusFilter, vehicleType: typeFilter, keyword })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleToggleStatus = async (vehicle: Vehicle) => {
    const statuses: ('available' | 'in_use' | 'maintenance')[] = ['available', 'in_use', 'maintenance']
    const currentIndex = statuses.indexOf(vehicle.status)
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
    try {
      await updateVehicle(vehicle.id, { status: nextStatus })
      fetchVehicles({ status: statusFilter, vehicleType: typeFilter, keyword })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">车辆信息管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理婚车车队车辆信息和状态</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          添加车辆
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索车牌号、品牌、车型..."
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
            <option value="available">可用</option>
            <option value="in_use">使用中</option>
            <option value="maintenance">维修中</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="all">全部车型</option>
            <option value="luxury">豪华型</option>
            <option value="sedan">轿车</option>
            <option value="suv">SUV</option>
            <option value="other">其他</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">车辆信息</th>
              <th className="px-6 py-4 font-medium">车牌号</th>
              <th className="px-6 py-4 font-medium">车型</th>
              <th className="px-6 py-4 font-medium">装饰类型</th>
              <th className="px-6 py-4 font-medium">座位数</th>
              <th className="px-6 py-4 font-medium">购买年份</th>
              <th className="px-6 py-4 font-medium">状态</th>
              <th className="px-6 py-4 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {vehicles.map((vehicle) => {
              const statusInfo = VEHICLE_STATUS_MAP[vehicle.status]
              return (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                        <Car className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-xs text-gray-500">{vehicle.color}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{vehicle.plateNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{VEHICLE_TYPE_MAP[vehicle.vehicleType]}</td>
                  <td className="px-6 py-4 text-gray-600">{vehicle.decorationType}</td>
                  <td className="px-6 py-4 text-gray-600">{vehicle.seatCount} 座</td>
                  <td className="px-6 py-4 text-gray-600">{vehicle.purchaseYear} 年</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-block cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        statusInfo?.color,
                      )}
                      onClick={() => handleToggleStatus(vehicle)}
                    >
                      {statusInfo?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  暂无车辆数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingVehicle ? '编辑车辆' : '添加车辆'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    车牌号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.plateNumber || ''}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="如：京A·88888"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    品牌 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="如：奔驰、宝马"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    型号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="如：S450L"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    颜色 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.color || ''}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="如：黑色、白色"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">车辆类型</label>
                  <select
                    value={formData.vehicleType || 'sedan'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehicleType: e.target.value as Vehicle['vehicleType'],
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="luxury">豪华型</option>
                    <option value="sedan">轿车</option>
                    <option value="suv">SUV</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">装饰类型</label>
                  <input
                    type="text"
                    value={formData.decorationType || ''}
                    onChange={(e) => setFormData({ ...formData, decorationType: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="如：豪华鲜花装饰"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">座位数</label>
                  <input
                    type="number"
                    min="2"
                    value={formData.seatCount || 5}
                    onChange={(e) => setFormData({ ...formData, seatCount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">购买年份</label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={formData.purchaseYear || new Date().getFullYear()}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseYear: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">状态</label>
                <select
                  value={formData.status || 'available'}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as Vehicle['status'] })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="available">可用</option>
                  <option value="in_use">使用中</option>
                  <option value="maintenance">维修中</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">备注</label>
                <textarea
                  value={formData.remark || ''}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                >
                  {editingVehicle ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
