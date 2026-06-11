import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, Flower2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { FLOWER_PACKAGE_STATUS_MAP, type FlowerPackage } from '@/types'
import { cn } from '@/lib/utils'

export default function FlowerPackages() {
  const { flowerPackages, fetchFlowerPackages, addFlowerPackage, updateFlowerPackage, deleteFlowerPackage } = useAppStore()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingPkg, setEditingPkg] = useState<FlowerPackage | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    items: '',
    imageUrl: '',
    status: 'active' as 'active' | 'inactive',
    remark: '',
  })

  useEffect(() => {
    fetchFlowerPackages({ status: statusFilter, keyword })
  }, [fetchFlowerPackages, statusFilter, keyword])

  const handleAdd = () => {
    setEditingPkg(null)
    setFormData({
      name: '',
      description: '',
      price: 0,
      items: '',
      imageUrl: '',
      status: 'active',
      remark: '',
    })
    setShowModal(true)
  }

  const handleEdit = (pkg: FlowerPackage) => {
    setEditingPkg(pkg)
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      items: pkg.items,
      imageUrl: pkg.imageUrl,
      status: pkg.status,
      remark: pkg.remark,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除该套餐吗？')) {
      try {
        await deleteFlowerPackage(id)
        fetchFlowerPackages({ status: statusFilter, keyword })
      } catch (err) {
        alert((err as Error).message)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPkg) {
        await updateFlowerPackage(editingPkg.id, formData)
      } else {
        await addFlowerPackage(formData)
      }
      setShowModal(false)
      fetchFlowerPackages({ status: statusFilter, keyword })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleToggleStatus = async (pkg: FlowerPackage) => {
    const newStatus = pkg.status === 'active' ? 'inactive' : 'active'
    try {
      await updateFlowerPackage(pkg.id, { status: newStatus })
      fetchFlowerPackages({ status: statusFilter, keyword })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">鲜花配套套餐</h1>
          <p className="mt-1 text-sm text-gray-500">管理婚礼鲜花配套套餐</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          创建套餐
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索套餐名称..."
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
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">套餐名称</th>
              <th className="px-6 py-4 font-medium">描述</th>
              <th className="px-6 py-4 font-medium">价格</th>
              <th className="px-6 py-4 font-medium">包含花材</th>
              <th className="px-6 py-4 font-medium">状态</th>
              <th className="px-6 py-4 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {flowerPackages.map((pkg) => {
              const statusInfo = FLOWER_PACKAGE_STATUS_MAP[pkg.status]
              return (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <Flower2 className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-800">{pkg.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{pkg.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-rose-600">¥{pkg.price.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{pkg.items || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-block cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        statusInfo?.color,
                      )}
                      onClick={() => handleToggleStatus(pkg)}
                    >
                      {statusInfo?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-amber-600"
                        title="编辑"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
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
            {flowerPackages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  暂无套餐数据
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
                {editingPkg ? '编辑套餐' : '创建套餐'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  套餐名称 <span className="text-red-500">*</span>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">包含花材</label>
                <input
                  type="text"
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  placeholder="如：红玫瑰×99, 百合×20, 满天星×5"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">图片链接</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="套餐图片URL"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'active' | 'inactive',
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="active">上架</option>
                  <option value="inactive">下架</option>
                </select>
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
                  {editingPkg ? '保存修改' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
