import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Flower2,
  Sparkles,
  X,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  BarChart3,
  Layers,
  Calendar,
  User,
  FileText,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import {
  INVENTORY_CATEGORY_MAP,
  INVENTORY_CATEGORY_OPTIONS,
  INVENTORY_OPERATION_TYPE_MAP,
  INVENTORY_OPERATION_TYPE_OPTIONS,
  INVENTORY_STATUS_MAP,
  type InventoryItem,
  type InventoryOperationType,
} from '@/types'
import { cn } from '@/lib/utils'

type TabType = 'items' | 'records' | 'loss'

export default function Inventory() {
  const {
    inventoryItems,
    inventoryRecords,
    inventoryOverview,
    inventoryLossStats,
    fetchInventoryItems,
    fetchInventoryRecords,
    fetchInventoryOverview,
    fetchInventoryLossStats,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateInventoryItemStatus,
    addInventoryRecord,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<TabType>('items')

  const [itemKeyword, setItemKeyword] = useState('')
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('all')
  const [itemStatusFilter, setItemStatusFilter] = useState<string>('all')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  const [recordOperationFilter, setRecordOperationFilter] = useState<string>('all')
  const [recordItemFilter, setRecordItemFilter] = useState<string>('all')
  const [recordDateFrom, setRecordDateFrom] = useState('')
  const [recordDateTo, setRecordDateTo] = useState('')

  const [lossCategoryFilter, setLossCategoryFilter] = useState<string>('all')
  const [lossDateFrom, setLossDateFrom] = useState('')
  const [lossDateTo, setLossDateTo] = useState('')

  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [itemForm, setItemForm] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'flower',
    unit: '',
    stock: 0,
    safetyStock: 0,
    unitPrice: 0,
    supplier: '',
    remark: '',
  })

  const [showRecordModal, setShowRecordModal] = useState(false)
  const [recordForm, setRecordForm] = useState<{
    itemId: number
    operationType: InventoryOperationType
    quantity: number
    unitPrice: number
    operator: string
    operationDate: string
    orderNo: string
    remark: string
  }>({
    itemId: 0,
    operationType: 'in',
    quantity: 0,
    unitPrice: 0,
    operator: '',
    operationDate: new Date().toISOString().slice(0, 10),
    orderNo: '',
    remark: '',
  })

  useEffect(() => {
    fetchInventoryOverview()
  }, [fetchInventoryOverview])

  useEffect(() => {
    if (activeTab === 'items') {
      fetchInventoryItems({
        category: itemCategoryFilter === 'all' ? undefined : itemCategoryFilter,
        status: itemStatusFilter === 'all' ? undefined : itemStatusFilter,
        keyword: itemKeyword || undefined,
        lowStock: showLowStockOnly || undefined,
      })
    } else if (activeTab === 'records') {
      fetchInventoryRecords({
        operationType: recordOperationFilter === 'all' ? undefined : recordOperationFilter,
        itemId: recordItemFilter === 'all' ? undefined : recordItemFilter,
        dateFrom: recordDateFrom || undefined,
        dateTo: recordDateTo || undefined,
      })
    } else if (activeTab === 'loss') {
      fetchInventoryLossStats({
        category: lossCategoryFilter === 'all' ? undefined : lossCategoryFilter,
        dateFrom: lossDateFrom || undefined,
        dateTo: lossDateTo || undefined,
      })
    }
  }, [activeTab, itemCategoryFilter, itemStatusFilter, itemKeyword, showLowStockOnly, recordOperationFilter, recordItemFilter, recordDateFrom, recordDateTo, lossCategoryFilter, lossDateFrom, lossDateTo, fetchInventoryItems, fetchInventoryRecords, fetchInventoryLossStats])

  const resetItemForm = () => {
    setItemForm({
      name: '',
      category: 'flower',
      unit: '',
      stock: 0,
      safetyStock: 0,
      unitPrice: 0,
      supplier: '',
      remark: '',
    })
    setEditingItem(null)
  }

  const handleOpenItemModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item)
      setItemForm({ ...item })
    } else {
      resetItemForm()
    }
    setShowItemModal(true)
  }

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!itemForm.name || !itemForm.category || !itemForm.unit) {
        alert('请填写物料名称、类别和单位')
        return
      }
      if (editingItem) {
        await updateInventoryItem(editingItem.id, itemForm)
        alert('更新成功')
      } else {
        await addInventoryItem(itemForm)
        alert('新增成功')
      }
      setShowItemModal(false)
      resetItemForm()
      fetchInventoryItems()
      fetchInventoryOverview()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (window.confirm('确定要删除该物料吗？相关出入库记录将保留。')) {
      try {
        await deleteInventoryItem(id)
        fetchInventoryItems()
        fetchInventoryOverview()
        alert('删除成功')
      } catch (err) {
        alert((err as Error).message)
      }
    }
  }

  const handleToggleStatus = async (item: InventoryItem) => {
    try {
      const newStatus = item.status === 'active' ? 'inactive' : 'active'
      await updateInventoryItemStatus(item.id, newStatus)
      fetchInventoryItems()
      fetchInventoryOverview()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleOpenRecordModal = (itemId?: number) => {
    setRecordForm({
      itemId: itemId || inventoryItems[0]?.id || 0,
      operationType: 'in',
      quantity: 0,
      unitPrice: itemId ? inventoryItems.find((i) => i.id === itemId)?.unitPrice || 0 : 0,
      operator: '',
      operationDate: new Date().toISOString().slice(0, 10),
      orderNo: '',
      remark: '',
    })
    setShowRecordModal(true)
  }

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!recordForm.itemId) {
        alert('请选择物料')
        return
      }
      if (!recordForm.quantity || recordForm.quantity <= 0) {
        alert('请输入有效数量')
        return
      }
      if (!recordForm.operator) {
        alert('请填写操作人')
        return
      }
      const selectedItem = inventoryItems.find((i) => i.id === recordForm.itemId)
      if (recordForm.operationType !== 'in' && selectedItem && selectedItem.stock < recordForm.quantity) {
        alert(`库存不足，当前库存：${selectedItem.stock} ${selectedItem.unit}`)
        return
      }
      await addInventoryRecord({
        ...recordForm,
        unitPrice: recordForm.unitPrice || selectedItem?.unitPrice || 0,
      })
      setShowRecordModal(false)
      fetchInventoryItems()
      fetchInventoryOverview()
      if (activeTab === 'records') fetchInventoryRecords()
      if (activeTab === 'loss') fetchInventoryLossStats()
      alert('登记成功')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const filteredLossItems = inventoryLossStats?.list || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">物料库存管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理鲜花、婚车装饰用品库存，出入库登记，库存预警，损耗统计
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleOpenRecordModal()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <ArrowDownToLine className="h-4 w-4" />
            出入库登记
          </button>
          <button
            onClick={() => handleOpenItemModal()}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" />
            新增物料
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2">
              <Layers className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {inventoryOverview?.totalItems || 0}
              </p>
              <p className="text-xs text-gray-500">物料总数</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {inventoryOverview?.activeItems || 0}
              </p>
              <p className="text-xs text-gray-500">启用物料</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {inventoryOverview?.lowStockItems || 0}
              </p>
              <p className="text-xs text-gray-500">库存预警</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rose-100 p-2">
              <DollarSign className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                ¥{(inventoryOverview?.totalValue || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">库存总值</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pink-100 p-2">
              <Flower2 className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">
                {inventoryOverview?.flowerCount || 0}
              </p>
              <p className="text-xs text-gray-500">
                鲜花 ¥{(inventoryOverview?.flowerValue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">
                {inventoryOverview?.decorationCount || 0}
              </p>
              <p className="text-xs text-gray-500">
                装饰 ¥{(inventoryOverview?.decorationValue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <ArrowDownToLine className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-xs text-green-700">今日入库</p>
              <p className="text-lg font-bold text-green-800">
                ¥{(inventoryOverview?.todayIn || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <ArrowUpFromLine className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-700">今日出库</p>
              <p className="text-lg font-bold text-blue-800">
                ¥{(inventoryOverview?.todayOut || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-xs text-red-700">今日损耗</p>
              <p className="text-lg font-bold text-red-800">
                ¥{(inventoryOverview?.todayLoss || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'items', label: '物料列表', icon: Package },
            { key: 'records', label: '出入库记录', icon: FileText },
            { key: 'loss', label: '损耗统计', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px',
                  isActive
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-4">
          {activeTab === 'items' && (
            <>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索物料名称、供应商..."
                    value={itemKeyword}
                    onChange={(e) => setItemKeyword(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <select
                  value={itemCategoryFilter}
                  onChange={(e) => setItemCategoryFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="all">全部类别</option>
                  {INVENTORY_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={itemStatusFilter}
                  onChange={(e) => setItemStatusFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="all">全部状态</option>
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLowStockOnly}
                    onChange={(e) => setShowLowStockOnly(e.target.checked)}
                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  仅显示低库存
                </label>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-sm text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">物料信息</th>
                      <th className="px-4 py-3 font-medium">类别</th>
                      <th className="px-4 py-3 font-medium">库存</th>
                      <th className="px-4 py-3 font-medium">安全库存</th>
                      <th className="px-4 py-3 font-medium">单价</th>
                      <th className="px-4 py-3 font-medium">总值</th>
                      <th className="px-4 py-3 font-medium">供应商</th>
                      <th className="px-4 py-3 font-medium">状态</th>
                      <th className="px-4 py-3 text-right font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {inventoryItems.map((item) => {
                      const categoryInfo = INVENTORY_CATEGORY_MAP[item.category]
                      const statusInfo = INVENTORY_STATUS_MAP[item.status]
                      const isLowStock = item.stock <= item.safetyStock
                      return (
                        <tr
                          key={item.id}
                          className={cn(
                            'hover:bg-gray-50',
                            isLowStock && item.status === 'active' && 'bg-red-50/50',
                          )}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-800">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  {item.remark || '—'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                                categoryInfo?.color,
                              )}
                            >
                              {categoryInfo?.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'font-semibold',
                                  isLowStock && item.status === 'active'
                                    ? 'text-red-600'
                                    : 'text-gray-800',
                                )}
                              >
                                {item.stock}
                              </span>
                              <span className="text-xs text-gray-500">{item.unit}</span>
                              {isLowStock && item.status === 'active' && (
                                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {item.safetyStock} {item.unit}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            ¥{item.unitPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-800">
                            ¥{item.totalValue.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {item.supplier || '—'}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                                statusInfo?.color,
                              )}
                            >
                              {statusInfo?.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleOpenRecordModal(item.id)}
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                title="出入库"
                              >
                                <ArrowDownToLine className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(item)}
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                title={item.status === 'active' ? '停用' : '启用'}
                              >
                                {item.status === 'active' ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                              <button
                                onClick={() => handleOpenItemModal(item)}
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                                title="编辑"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
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
                    {inventoryItems.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                          暂无物料数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'records' && (
            <>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <select
                  value={recordOperationFilter}
                  onChange={(e) => setRecordOperationFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="all">全部操作</option>
                  {INVENTORY_OPERATION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={recordItemFilter}
                  onChange={(e) => setRecordItemFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="all">全部物料</option>
                  {inventoryItems.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={recordDateFrom}
                    onChange={(e) => setRecordDateFrom(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-gray-400">至</span>
                  <input
                    type="date"
                    value={recordDateTo}
                    onChange={(e) => setRecordDateTo(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-sm text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">日期</th>
                      <th className="px-4 py-3 font-medium">物料</th>
                      <th className="px-4 py-3 font-medium">操作类型</th>
                      <th className="px-4 py-3 font-medium">数量</th>
                      <th className="px-4 py-3 font-medium">单价</th>
                      <th className="px-4 py-3 font-medium">金额</th>
                      <th className="px-4 py-3 font-medium">操作人</th>
                      <th className="px-4 py-3 font-medium">关联订单</th>
                      <th className="px-4 py-3 font-medium">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {inventoryRecords.map((record) => {
                      const typeInfo = INVENTORY_OPERATION_TYPE_MAP[record.operationType]
                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">
                            {record.operationDate}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">
                              {record.itemName || `#${record.itemId}`}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                                typeInfo?.color,
                              )}
                            >
                              {typeInfo?.label}
                            </span>
                          </td>
                          <td
                            className={cn(
                              'px-4 py-3 font-semibold',
                              record.operationType === 'in'
                                ? 'text-green-600'
                                : record.operationType === 'out'
                                  ? 'text-blue-600'
                                  : 'text-red-600',
                            )}
                          >
                            {record.operationType === 'in' ? '+' : '-'}
                            {record.quantity}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            ¥{record.unitPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            ¥{record.totalPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <User className="h-3.5 w-3.5 text-gray-400" />
                              {record.operator}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {record.orderNo || '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                            {record.remark || '—'}
                          </td>
                        </tr>
                      )
                    })}
                    {inventoryRecords.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                          暂无出入库记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'loss' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">损耗物料数</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {inventoryLossStats?.summary?.totalItems || 0}
                    <span className="ml-1 text-sm font-normal text-gray-500">种</span>
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">总损耗数量</p>
                  <p className="text-2xl font-bold text-red-600">
                    {inventoryLossStats?.summary?.totalLossQuantity || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">总损耗金额</p>
                  <p className="text-2xl font-bold text-red-600">
                    ¥{(inventoryLossStats?.summary?.totalLossValue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">高损耗物料（损耗率&gt;5%）</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {inventoryLossStats?.summary?.highLossItems || 0}
                    <span className="ml-1 text-sm font-normal text-gray-500">种</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <select
                  value={lossCategoryFilter}
                  onChange={(e) => setLossCategoryFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="all">全部类别</option>
                  {INVENTORY_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={lossDateFrom}
                    onChange={(e) => setLossDateFrom(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-gray-400">至</span>
                  <input
                    type="date"
                    value={lossDateTo}
                    onChange={(e) => setLossDateTo(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-sm text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">物料名称</th>
                      <th className="px-4 py-3 font-medium">类别</th>
                      <th className="px-4 py-3 font-medium">入库总量</th>
                      <th className="px-4 py-3 font-medium">损耗数量</th>
                      <th className="px-4 py-3 font-medium">损耗金额</th>
                      <th className="px-4 py-3 font-medium">损耗率</th>
                      <th className="px-4 py-3 font-medium">状态评估</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredLossItems.map((stat) => {
                      const categoryInfo = INVENTORY_CATEGORY_MAP[stat.category]
                      const isHighLoss = stat.lossRate > 5
                      return (
                        <tr key={stat.itemId} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <p className="font-medium text-gray-800">{stat.itemName}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                                categoryInfo?.color,
                              )}
                            >
                              {categoryInfo?.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {stat.totalInQuantity}
                          </td>
                          <td className="px-4 py-4 font-semibold text-red-600">
                            {stat.lossQuantity}
                          </td>
                          <td className="px-4 py-4 font-medium text-red-600">
                            ¥{stat.lossValue.toLocaleString()}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full',
                                    isHighLoss ? 'bg-red-500' : 'bg-green-500',
                                  )}
                                  style={{
                                    width: `${Math.min(stat.lossRate * 10, 100)}%`,
                                  }}
                                />
                              </div>
                              <span
                                className={cn(
                                  'font-semibold text-sm',
                                  isHighLoss ? 'text-red-600' : 'text-green-600',
                                )}
                              >
                                {stat.lossRate.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {isHighLoss ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                <AlertTriangle className="h-3 w-3" />
                                需关注
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                正常
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {filteredLossItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                          暂无损耗数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingItem ? '编辑物料' : '新增物料'}
              </h3>
              <button
                onClick={() => {
                  setShowItemModal(false)
                  resetItemForm()
                }}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleSubmitItem}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    物料名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemForm.name || ''}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="如：红玫瑰"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    物料类别 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={itemForm.category || 'flower'}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        category: e.target.value as InventoryItem['category'],
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {INVENTORY_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    计量单位 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemForm.unit || ''}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="如：支、扎、个、套"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    供应商
                  </label>
                  <input
                    type="text"
                    value={itemForm.supplier || ''}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, supplier: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="供应商名称"
                  />
                </div>
              </div>
              {!editingItem && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      初始库存
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={itemForm.stock || 0}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          stock: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      安全库存（预警）
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={itemForm.safetyStock || 0}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          safetyStock: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      入库单价（元）
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemForm.unitPrice || 0}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          unitPrice: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              )}
              {editingItem && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      安全库存（预警）
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={itemForm.safetyStock || 0}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          safetyStock: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      当前单价（元）
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemForm.unitPrice || 0}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          unitPrice: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  备注
                </label>
                <textarea
                  value={itemForm.remark || ''}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, remark: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="规格、注意事项等"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemModal(false)
                    resetItemForm()
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                >
                  {editingItem ? '更新' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">出入库登记</h3>
              <button
                onClick={() => setShowRecordModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleSubmitRecord}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  选择物料 <span className="text-red-500">*</span>
                </label>
                <select
                  value={recordForm.itemId || 0}
                  onChange={(e) => {
                    const itemId = Number(e.target.value)
                    const selected = inventoryItems.find((i) => i.id === itemId)
                    setRecordForm({
                      ...recordForm,
                      itemId,
                      unitPrice: selected?.unitPrice || 0,
                    })
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                >
                  <option value={0}>请选择物料</option>
                  {inventoryItems
                    .filter((i) => i.status === 'active')
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}（库存：{i.stock} {i.unit}，单价：¥{i.unitPrice}）
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    操作类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={recordForm.operationType}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        operationType: e.target.value as InventoryOperationType,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {INVENTORY_OPERATION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    操作日期
                  </label>
                  <input
                    type="date"
                    value={recordForm.operationDate}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        operationDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    数量 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={recordForm.quantity || 0}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="请输入数量"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    单价（元）
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={recordForm.unitPrice || 0}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        unitPrice: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">合计金额：</span>
                <span className="text-lg font-bold text-rose-600">
                  ¥{(recordForm.quantity * (recordForm.unitPrice || 0)).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    操作人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recordForm.operator}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, operator: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="请输入操作人姓名"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    关联订单号
                  </label>
                  <input
                    type="text"
                    value={recordForm.orderNo}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, orderNo: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="出库时可关联订单号"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  备注
                </label>
                <textarea
                  value={recordForm.remark}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, remark: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder={
                    recordForm.operationType === 'loss'
                      ? '请填写损耗原因'
                      : '采购来源、使用场景等'
                  }
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium text-white',
                    recordForm.operationType === 'in' && 'bg-green-600 hover:bg-green-700',
                    recordForm.operationType === 'out' && 'bg-blue-600 hover:bg-blue-700',
                    recordForm.operationType === 'loss' &&
                      'bg-red-600 hover:bg-red-700',
                  )}
                >
                  确认登记
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
