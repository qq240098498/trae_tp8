import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, UserPlus, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { DRIVER_STATUS_MAP, type Driver } from '@/types'
import { cn } from '@/lib/utils'

export default function Drivers() {
  const { drivers, fetchDrivers, addDriver, updateDriver, deleteDriver } = useAppStore()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [formData, setFormData] = useState<Partial<Driver>>({
    name: '',
    phone: '',
    idCard: '',
    licenseType: 'C1',
    licenseNumber: '',
    drivingYears: 0,
    status: 'active',
    remark: '',
  })

  useEffect(() => {
    fetchDrivers({ status: statusFilter, keyword })
  }, [fetchDrivers, statusFilter, keyword])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchDrivers({ status: statusFilter, keyword })
  }

  const handleAdd = () => {
    setEditingDriver(null)
    setFormData({
      name: '',
      phone: '',
      idCard: '',
      licenseType: 'C1',
      licenseNumber: '',
      drivingYears: 0,
      status: 'active',
      remark: '',
    })
    setShowModal(true)
  }

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver)
    setFormData(driver)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除该司机吗？')) {
      try {
        await deleteDriver(id)
        fetchDrivers({ status: statusFilter, keyword })
      } catch (err) {
        alert((err as Error).message)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, formData)
      } else {
        await addDriver(formData)
      }
      setShowModal(false)
      fetchDrivers({ status: statusFilter, keyword })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleToggleStatus = async (driver: Driver) => {
    const newStatus = driver.status === 'active' ? 'inactive' : 'active'
    try {
      await updateDriver(driver.id, { status: newStatus })
      fetchDrivers({ status: statusFilter, keyword })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">司机档案管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理车队司机信息和状态</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          添加司机
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
          <div className="flex flex-1 min-w-[200px] items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索司机姓名、电话、驾驶证号..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="all">全部状态</option>
            <option value="active">在岗</option>
            <option value="inactive">离岗</option>
          </select>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">司机姓名</th>
              <th className="px-6 py-4 font-medium">联系电话</th>
              <th className="px-6 py-4 font-medium">驾驶证号</th>
              <th className="px-6 py-4 font-medium">准驾车型</th>
              <th className="px-6 py-4 font-medium">驾龄</th>
              <th className="px-6 py-4 font-medium">状态</th>
              <th className="px-6 py-4 font-medium">备注</th>
              <th className="px-6 py-4 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {drivers.map((driver) => {
              const statusInfo = DRIVER_STATUS_MAP[driver.status]
              return (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-800">{driver.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{driver.phone}</td>
                  <td className="px-6 py-4 text-gray-600">{driver.licenseNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{driver.licenseType}</td>
                  <td className="px-6 py-4 text-gray-600">{driver.drivingYears} 年</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-block cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        statusInfo?.color,
                      )}
                      onClick={() => handleToggleStatus(driver)}
                    >
                      {statusInfo?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{driver.remark || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(driver)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  暂无司机数据
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
                {editingDriver ? '编辑司机' : '添加司机'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    司机姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    联系电话 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">身份证号</label>
                <input
                  type="text"
                  value={formData.idCard || ''}
                  onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    驾驶证号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">准驾车型</label>
                  <select
                    value={formData.licenseType || 'C1'}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">驾龄（年）</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.drivingYears || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, drivingYears: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">状态</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'active' | 'inactive',
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="active">在岗</option>
                    <option value="inactive">离岗</option>
                  </select>
                </div>
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
                  {editingDriver ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
