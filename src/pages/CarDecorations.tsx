import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, Car } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { CAR_DECORATION_STATUS_MAP, CAR_DECORATION_TYPE_MAP, type CarDecoration } from '@/types'
import { cn } from '@/lib/utils'

const initialFormData = {
  name: '',
  decorationType: 'front',
  description: '',
  price: 0,
  applicableVehicleTypes: '',
  imageUrl: '',
  stock: 0,
  status: 'active' as 'active' | 'inactive',
  remark: '',
}

export default function CarDecorations() {
  const { carDecorations, fetchCarDecorations, addCarDecoration, updateCarDecoration, deleteCarDecoration } = useAppStore()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<CarDecoration | null>(null)
  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    fetchCarDecorations({ status: statusFilter === 'all' ? undefined : statusFilter, decorationType: typeFilter === 'all' ? undefined : typeFilter, keyword })
  }, [fetchCarDecorations, statusFilter, typeFilter, keyword])

  const handleAdd = () => {
    setEditingItem(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const handleEdit = (item: CarDecoration) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      decorationType: item.decorationType,
      description: item.description,
      price: item.price,
      applicableVehicleTypes: item.applicableVehicleTypes,
      imageUrl: item.imageUrl,
      stock: item.stock,
      status: item.status,
      remark: item.remark,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除该装饰项目吗？')) {
      try {
        await deleteCarDecoration(id)
        fetchCarDecorations({ status: statusFilter === 'all' ? undefined : statusFilter, decorationType: typeFilter === 'all' ? undefined : typeFilter, keyword })
      } catch (err) {
        alert((err as Error).message)
      }
    }
  }

  const handleToggleStatus = async (item: CarDecoration) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active'
    try {
      await updateCarDecoration(item.id, { status: newStatus })
      fetchCarDecorations({ status: statusFilter === 'all' ? undefined : statusFilter, decorationType: typeFilter === 'all' ? undefined : typeFilter, keyword })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await updateCarDecoration(editingItem.id, formData)
      } else {
        await addCarDecoration(formData)
      }
      setShowModal(false)
      fetchCarDecorations({ status: statusFilter === 'all' ? undefined : statusFilter, decorationType: typeFilter === 'all' ? undefined : typeFilter, keyword })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">婚车装饰管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理婚车花艺装饰项目</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          创建装饰
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索装饰名称..."
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
            <option value="active">上架</option>
            <option value="inactive">下架</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="all">全部类型</option>
            {Object.entries(CAR_DECORATION_TYPE_MAP).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">装饰名称</th>
              <th className="px-6 py-4 font-medium">装饰类型</th>
              <th className="px-6 py-4 font-medium">描述</th>
              <th className="px-6 py-4 font-medium">价格</th>
              <th className="px-6 py-4 font-medium">库存</th>
              <th className="px-6 py-4 font-medium">适用车型</th>
              <th className="px-6 py-4 font-medium">状态</th>
              <th className="px-6 py-4 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {carDecorations.map((item) => {
              const statusInfo = CAR_DECORATION_STATUS_MAP[item.status]
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <Car className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {CAR_DECORATION_TYPE_MAP[item.decorationType] || item.decorationType}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                    {item.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-rose-600">
                      ¥{item.price.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={cn(
                        'font-medium',
                        (item.stock - item.usedStock) <= 0 ? 'text-red-600' : (item.stock - item.usedStock) <= 2 ? 'text-amber-600' : 'text-green-600'
                      )}>
                        剩 {item.stock - item.usedStock}
                      </span>
                      <span className="text-xs text-gray-400">共 {item.stock} / 已用 {item.usedStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.applicableVehicleTypes || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-block cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        statusInfo?.color,
                      )}
                      onClick={() => handleToggleStatus(item)}
                    >
                      {statusInfo?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {carDecorations.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  暂无装饰数据
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
                {editingItem ? '编辑装饰' : '创建装饰'}
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
                    装饰名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    装饰类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.decorationType}
                    onChange={(e) => setFormData({ ...formData, decorationType: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  >
                    {Object.entries(CAR_DECORATION_TYPE_MAP).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    价格（元） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    库存数量 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">适用车型</label>
                  <input
                    type="text"
                    value={formData.applicableVehicleTypes}
                    onChange={(e) => setFormData({ ...formData, applicableVehicleTypes: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="如：豪华型、轿车"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">图片链接</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="active">上架</option>
                    <option value="inactive">下架</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">备注</label>
                <textarea
                  value={formData.remark}
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
                  {editingItem ? '保存修改' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
