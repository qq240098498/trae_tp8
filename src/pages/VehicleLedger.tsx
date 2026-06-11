import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Wrench,
  ShieldCheck,
  ClipboardCheck,
  X,
  Car,
  AlertTriangle,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import {
  MAINTENANCE_TYPE_OPTIONS,
  INSURANCE_TYPE_OPTIONS,
  INSPECTION_RESULT_MAP,
  type MaintenanceRecord,
  type InsuranceRecord,
  type InspectionRecord,
} from '@/types'
import { cn } from '@/lib/utils'

type TabKey = 'maintenance' | 'insurance' | 'inspection'

export default function VehicleLedger() {
  const [activeTab, setActiveTab] = useState<TabKey>('maintenance')
  const [keyword, setKeyword] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState<string>('all')
  const [resultFilter, setResultFilter] = useState<string>('all')

  const {
    vehicles,
    fetchVehicles,
    maintenanceRecords,
    fetchMaintenanceRecords,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    insuranceRecords,
    fetchInsuranceRecords,
    addInsuranceRecord,
    updateInsuranceRecord,
    deleteInsuranceRecord,
    inspectionRecords,
    fetchInspectionRecords,
    addInspectionRecord,
    updateInspectionRecord,
    deleteInspectionRecord,
  } = useAppStore()

  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add')
  const [editId, setEditId] = useState<number | null>(null)

  const [maintenanceForm, setMaintenanceForm] = useState<Partial<MaintenanceRecord>>({
    vehicleId: undefined,
    serviceDate: '',
    serviceType: '',
    serviceItem: '',
    mileage: 0,
    cost: 0,
    serviceProvider: '',
    nextServiceDate: '',
    remark: '',
  })

  const [insuranceForm, setInsuranceForm] = useState<Partial<InsuranceRecord>>({
    vehicleId: undefined,
    insuranceType: '',
    insuranceCompany: '',
    policyNo: '',
    startDate: '',
    endDate: '',
    premium: 0,
    coverageAmount: 0,
    remark: '',
  })

  const [inspectionForm, setInspectionForm] = useState<Partial<InspectionRecord>>({
    vehicleId: undefined,
    inspectionDate: '',
    inspectionResult: 'pending',
    inspectionAgency: '',
    nextInspectionDate: '',
    cost: 0,
    remark: '',
  })

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  useEffect(() => {
    if (activeTab === 'maintenance') {
      fetchMaintenanceRecords({ vehicleId: vehicleFilter, keyword })
    } else if (activeTab === 'insurance') {
      fetchInsuranceRecords({ vehicleId: vehicleFilter, keyword })
    } else if (activeTab === 'inspection') {
      fetchInspectionRecords({ vehicleId: vehicleFilter, keyword, result: resultFilter })
    }
  }, [activeTab, vehicleFilter, keyword, resultFilter, fetchMaintenanceRecords, fetchInsuranceRecords, fetchInspectionRecords])

  const tabs = [
    { key: 'maintenance' as TabKey, label: '维保台账', icon: Wrench },
    { key: 'insurance' as TabKey, label: '保险台账', icon: ShieldCheck },
    { key: 'inspection' as TabKey, label: '年检台账', icon: ClipboardCheck },
  ]

  const vehicleMap = useMemo(() => {
    const map = new Map<number, string>()
    vehicles.forEach((v) => map.set(v.id, v.plateNumber))
    return map
  }, [vehicles])

  const handleAdd = () => {
    setEditMode('add')
    setEditId(null)
    if (activeTab === 'maintenance') {
      setMaintenanceForm({
        vehicleId: vehicles[0]?.id,
        serviceDate: '',
        serviceType: '',
        serviceItem: '',
        mileage: 0,
        cost: 0,
        serviceProvider: '',
        nextServiceDate: '',
        remark: '',
      })
    } else if (activeTab === 'insurance') {
      setInsuranceForm({
        vehicleId: vehicles[0]?.id,
        insuranceType: '',
        insuranceCompany: '',
        policyNo: '',
        startDate: '',
        endDate: '',
        premium: 0,
        coverageAmount: 0,
        remark: '',
      })
    } else {
      setInspectionForm({
        vehicleId: vehicles[0]?.id,
        inspectionDate: '',
        inspectionResult: 'pending',
        inspectionAgency: '',
        nextInspectionDate: '',
        cost: 0,
        remark: '',
      })
    }
    setShowModal(true)
  }

  const handleEdit = (record: MaintenanceRecord | InsuranceRecord | InspectionRecord) => {
    setEditMode('edit')
    setEditId(record.id)
    if (activeTab === 'maintenance') {
      setMaintenanceForm(record as MaintenanceRecord)
    } else if (activeTab === 'insurance') {
      setInsuranceForm(record as InsuranceRecord)
    } else {
      setInspectionForm(record as InspectionRecord)
    }
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该记录吗？')) return
    try {
      if (activeTab === 'maintenance') {
        await deleteMaintenanceRecord(id)
        fetchMaintenanceRecords({ vehicleId: vehicleFilter, keyword })
      } else if (activeTab === 'insurance') {
        await deleteInsuranceRecord(id)
        fetchInsuranceRecords({ vehicleId: vehicleFilter, keyword })
      } else {
        await deleteInspectionRecord(id)
        fetchInspectionRecords({ vehicleId: vehicleFilter, keyword, result: resultFilter })
      }
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (activeTab === 'maintenance') {
        if (editMode === 'add') {
          await addMaintenanceRecord(maintenanceForm)
        } else if (editId !== null) {
          await updateMaintenanceRecord(editId, maintenanceForm)
        }
        fetchMaintenanceRecords({ vehicleId: vehicleFilter, keyword })
      } else if (activeTab === 'insurance') {
        if (editMode === 'add') {
          await addInsuranceRecord(insuranceForm)
        } else if (editId !== null) {
          await updateInsuranceRecord(editId, insuranceForm)
        }
        fetchInsuranceRecords({ vehicleId: vehicleFilter, keyword })
      } else {
        if (editMode === 'add') {
          await addInspectionRecord(inspectionForm)
        } else if (editId !== null) {
          await updateInspectionRecord(editId, inspectionForm)
        }
        fetchInspectionRecords({ vehicleId: vehicleFilter, keyword, result: resultFilter })
      }
      setShowModal(false)
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const isExpiringSoon = (dateStr: string, days = 30) => {
    if (!dateStr) return false
    const date = new Date(dateStr)
    const now = new Date()
    const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= days && diff >= 0
  }

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false
    const date = new Date(dateStr)
    const now = new Date()
    return date.getTime() < now.getTime()
  }

  const renderMaintenanceTable = () => (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-sm text-gray-600">
          <tr>
            <th className="px-6 py-4 font-medium">车牌号</th>
            <th className="px-6 py-4 font-medium">服务日期</th>
            <th className="px-6 py-4 font-medium">服务类型</th>
            <th className="px-6 py-4 font-medium">服务项目</th>
            <th className="px-6 py-4 font-medium">里程(km)</th>
            <th className="px-6 py-4 font-medium">费用</th>
            <th className="px-6 py-4 font-medium">服务商</th>
            <th className="px-6 py-4 font-medium">下次保养</th>
            <th className="px-6 py-4 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {maintenanceRecords.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                    <Car className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-gray-800">{record.vehiclePlate || vehicleMap.get(record.vehicleId)}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-600">{record.serviceDate}</td>
              <td className="px-6 py-4">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  {record.serviceType}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate" title={record.serviceItem}>
                {record.serviceItem}
              </td>
              <td className="px-6 py-4 text-gray-600">{record.mileage.toLocaleString()}</td>
              <td className="px-6 py-4 font-semibold text-rose-600">¥{record.cost.toLocaleString()}</td>
              <td className="px-6 py-4 text-gray-600">{record.serviceProvider}</td>
              <td className="px-6 py-4">
                {record.nextServiceDate && (
                  <div className={cn(
                    'flex items-center gap-1',
                    isOverdue(record.nextServiceDate) ? 'text-red-600' :
                    isExpiringSoon(record.nextServiceDate) ? 'text-yellow-600' : 'text-gray-600'
                  )}>
                    {(isOverdue(record.nextServiceDate) || isExpiringSoon(record.nextServiceDate)) && (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <span>{record.nextServiceDate}</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => handleEdit(record)} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(record.id)} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {maintenanceRecords.length === 0 && (
            <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-400">暂无维保记录</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )

  const renderInsuranceTable = () => (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-sm text-gray-600">
          <tr>
            <th className="px-6 py-4 font-medium">车牌号</th>
            <th className="px-6 py-4 font-medium">险种</th>
            <th className="px-6 py-4 font-medium">保险公司</th>
            <th className="px-6 py-4 font-medium">保单号</th>
            <th className="px-6 py-4 font-medium">起保日期</th>
            <th className="px-6 py-4 font-medium">到期日期</th>
            <th className="px-6 py-4 font-medium">保费</th>
            <th className="px-6 py-4 font-medium">保额</th>
            <th className="px-6 py-4 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {insuranceRecords.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <Car className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-gray-800">{record.vehiclePlate || vehicleMap.get(record.vehicleId)}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  {record.insuranceType}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{record.insuranceCompany}</td>
              <td className="px-6 py-4 text-gray-600 font-mono text-xs">{record.policyNo}</td>
              <td className="px-6 py-4 text-gray-600">{record.startDate}</td>
              <td className="px-6 py-4">
                <div className={cn(
                  'flex items-center gap-1',
                  isOverdue(record.endDate) ? 'text-red-600' :
                  isExpiringSoon(record.endDate) ? 'text-yellow-600' : 'text-gray-600'
                )}>
                  {(isOverdue(record.endDate) || isExpiringSoon(record.endDate)) && (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span>{record.endDate}</span>
                </div>
              </td>
              <td className="px-6 py-4 font-semibold text-rose-600">¥{record.premium.toLocaleString()}</td>
              <td className="px-6 py-4 text-gray-600">¥{record.coverageAmount.toLocaleString()}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => handleEdit(record)} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(record.id)} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {insuranceRecords.length === 0 && (
            <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-400">暂无保险记录</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )

  const renderInspectionTable = () => (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-sm text-gray-600">
          <tr>
            <th className="px-6 py-4 font-medium">车牌号</th>
            <th className="px-6 py-4 font-medium">检测日期</th>
            <th className="px-6 py-4 font-medium">检测结果</th>
            <th className="px-6 py-4 font-medium">检测机构</th>
            <th className="px-6 py-4 font-medium">下次检测</th>
            <th className="px-6 py-4 font-medium">费用</th>
            <th className="px-6 py-4 font-medium">备注</th>
            <th className="px-6 py-4 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {inspectionRecords.map((record) => {
            const resultInfo = INSPECTION_RESULT_MAP[record.inspectionResult]
            return (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      <Car className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-gray-800">{record.vehiclePlate || vehicleMap.get(record.vehicleId)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{record.inspectionDate || '-'}</td>
                <td className="px-6 py-4">
                  <span className={cn('inline-block rounded-full px-3 py-1 text-xs font-medium', resultInfo?.color)}>
                    {resultInfo?.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{record.inspectionAgency || '-'}</td>
                <td className="px-6 py-4">
                  <div className={cn(
                    'flex items-center gap-1',
                    isOverdue(record.nextInspectionDate) ? 'text-red-600' :
                    isExpiringSoon(record.nextInspectionDate) ? 'text-yellow-600' : 'text-gray-600'
                  )}>
                    {(isOverdue(record.nextInspectionDate) || isExpiringSoon(record.nextInspectionDate)) && (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <span>{record.nextInspectionDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-rose-600">¥{record.cost.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-500 max-w-[150px] truncate" title={record.remark}>
                  {record.remark || '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(record)} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {inspectionRecords.length === 0 && (
            <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">暂无年检记录</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )

  const renderModalForm = () => {
    if (activeTab === 'maintenance') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">车牌号 <span className="text-red-500">*</span></label>
              <select
                value={maintenanceForm.vehicleId || ''}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vehicleId: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              >
                <option value="">请选择车辆</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.plateNumber} - {v.brand} {v.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">服务日期 <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={maintenanceForm.serviceDate || ''}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceDate: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">服务类型 <span className="text-red-500">*</span></label>
              <select
                value={maintenanceForm.serviceType || ''}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceType: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              >
                <option value="">请选择</option>
                {MAINTENANCE_TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">服务商</label>
              <input
                type="text"
                value={maintenanceForm.serviceProvider || ''}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceProvider: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="如：奔驰4S店"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">服务项目</label>
            <textarea
              value={maintenanceForm.serviceItem || ''}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceItem: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="详细描述服务内容"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">里程(km)</label>
              <input
                type="number"
                min="0"
                value={maintenanceForm.mileage || 0}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, mileage: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">费用(元)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={maintenanceForm.cost || 0}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">下次保养日期</label>
              <input
                type="date"
                value={maintenanceForm.nextServiceDate || ''}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, nextServiceDate: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">备注</label>
            <textarea
              value={maintenanceForm.remark || ''}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, remark: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">取消</button>
            <button type="submit" className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700">
              {editMode === 'add' ? '添加' : '保存修改'}
            </button>
          </div>
        </form>
      )
    }

    if (activeTab === 'insurance') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">车牌号 <span className="text-red-500">*</span></label>
              <select
                value={insuranceForm.vehicleId || ''}
                onChange={(e) => setInsuranceForm({ ...insuranceForm, vehicleId: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              >
                <option value="">请选择车辆</option>
                {vehicles.map((v) => (<option key={v.id} value={v.id}>{v.plateNumber} - {v.brand} {v.model}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">险种 <span className="text-red-500">*</span></label>
              <select
                value={insuranceForm.insuranceType || ''}
                onChange={(e) => setInsuranceForm({ ...insuranceForm, insuranceType: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              >
                <option value="">请选择</option>
                {INSURANCE_TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">保险公司 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={insuranceForm.insuranceCompany || ''}
                onChange={(e) => setInsuranceForm({ ...insuranceForm, insuranceCompany: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="如：中国人保"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">保单号</label>
              <input
                type="text"
                value={insuranceForm.policyNo || ''}
                onChange={(e) => setInsuranceForm({ ...insuranceForm, policyNo: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">起保日期 <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={insuranceForm.startDate || ''}
                onChange={(e) => setInsuranceForm({ ...insuranceForm, startDate: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">到期日期 <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={insuranceForm.endDate || ''}
                onChange={(e) => setInsuranceForm({ ...insuranceForm, endDate: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">保费(元)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={insuranceForm.premium || 0}
                onChange={(e) => setInsuranceForm({ ...insuranceForm, premium: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">保额(元)</label>
              <input
                type="number"
                min="0"
                value={insuranceForm.coverageAmount || 0}
                onChange={(e) => setInsuranceForm({ ...insuranceForm, coverageAmount: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">备注</label>
            <textarea
              value={insuranceForm.remark || ''}
              onChange={(e) => setInsuranceForm({ ...insuranceForm, remark: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">取消</button>
            <button type="submit" className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700">
              {editMode === 'add' ? '添加' : '保存修改'}
            </button>
          </div>
        </form>
      )
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-6 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">车牌号 <span className="text-red-500">*</span></label>
            <select
              value={inspectionForm.vehicleId || ''}
              onChange={(e) => setInspectionForm({ ...inspectionForm, vehicleId: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              required
            >
              <option value="">请选择车辆</option>
              {vehicles.map((v) => (<option key={v.id} value={v.id}>{v.plateNumber} - {v.brand} {v.model}</option>))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">检测结果</label>
            <select
              value={inspectionForm.inspectionResult || 'pending'}
              onChange={(e) => setInspectionForm({ ...inspectionForm, inspectionResult: e.target.value as InspectionRecord['inspectionResult'] })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="pending">待检</option>
              <option value="pass">合格</option>
              <option value="fail">不合格</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">检测日期</label>
            <input
              type="date"
              value={inspectionForm.inspectionDate || ''}
              onChange={(e) => setInspectionForm({ ...inspectionForm, inspectionDate: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">检测机构</label>
            <input
              type="text"
              value={inspectionForm.inspectionAgency || ''}
              onChange={(e) => setInspectionForm({ ...inspectionForm, inspectionAgency: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="如：北京市车管所"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">下次检测日期 <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={inspectionForm.nextInspectionDate || ''}
              onChange={(e) => setInspectionForm({ ...inspectionForm, nextInspectionDate: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">费用(元)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={inspectionForm.cost || 0}
              onChange={(e) => setInspectionForm({ ...inspectionForm, cost: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">备注</label>
          <textarea
            value={inspectionForm.remark || ''}
            onChange={(e) => setInspectionForm({ ...inspectionForm, remark: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">取消</button>
          <button type="submit" className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700">
            {editMode === 'add' ? '添加' : '保存修改'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">车辆台账管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理车辆维保、保险、年检记录</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          添加记录
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索车牌号、服务商、保险公司..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="all">全部车辆</option>
            {vehicles.map((v) => (<option key={v.id} value={v.id}>{v.plateNumber}</option>))}
          </select>
          {activeTab === 'inspection' && (
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="all">全部结果</option>
              <option value="pass">合格</option>
              <option value="fail">不合格</option>
              <option value="pending">待检</option>
            </select>
          )}
        </div>
      </div>

      {activeTab === 'maintenance' && renderMaintenanceTable()}
      {activeTab === 'insurance' && renderInsuranceTable()}
      {activeTab === 'inspection' && renderInspectionTable()}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editMode === 'add' ? '添加' : '编辑'}
                {activeTab === 'maintenance' ? '维保记录' : activeTab === 'insurance' ? '保险记录' : '年检记录'}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderModalForm()}
          </div>
        </div>
      )}
    </div>
  )
}
