export interface Driver {
  id: number
  name: string
  phone: string
  idCard: string
  licenseType: string
  licenseNumber: string
  drivingYears: number
  status: 'active' | 'inactive'
  remark: string
  createdAt: string
  updatedAt: string
}

export interface Vehicle {
  id: number
  plateNumber: string
  brand: string
  model: string
  color: string
  vehicleType: 'luxury' | 'sedan' | 'suv' | 'other'
  decorationType: string
  seatCount: number
  purchaseYear: number
  status: 'available' | 'in_use' | 'maintenance'
  remark: string
  createdAt: string
  updatedAt: string
}

export interface FlowerPackage {
  id: number
  name: string
  description: string
  price: number
  items: string
  imageUrl: string
  stock: number
  usedStock: number
  status: 'active' | 'inactive'
  remark: string
  createdAt: string
  updatedAt: string
}

export interface CarDecoration {
  id: number
  name: string
  decorationType: string
  description: string
  price: number
  applicableVehicleTypes: string
  imageUrl: string
  stock: number
  usedStock: number
  status: 'active' | 'inactive'
  remark: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: number
  orderNo: string
  groomName: string
  brideName: string
  groomPhone: string
  bridePhone: string
  weddingDate: string
  departureTime: string
  returnTime: string
  pickupAddress: string
  ceremonyAddress: string
  dropoffAddress: string
  status: 'pending' | 'scheduled' | 'departed' | 'returned' | 'settled' | 'cancelled'
  totalAmount: number
  depositAmount: number
  flowerPackageIds: number[]
  carDecorationIds: number[]
  remark: string
  createdAt: string
  updatedAt: string
}

export interface OrderWithVehicles extends Order {
  vehicles: OrderVehicleDetail[]
}

export interface OrderVehicle {
  id: number
  orderId: number
  vehicleId: number
  driverId: number
  sequence: number
  role: 'lead' | 'follow'
  estimatedMileage: number
  actualMileage?: number
  departureTime?: string
  returnTime?: string
  serviceFee: number
  driverFee: number
}

export interface OrderVehicleDetail extends OrderVehicle {
  vehicle?: Vehicle
  driver?: Driver
}

export interface Settlement {
  id: number
  orderId: number
  orderNo: string
  totalAmount: number
  driverFees: number
  vehicleCosts: number
  extraFees: number
  netProfit: number
  status: 'pending' | 'paid'
  paidAt?: string
  createdAt: string
}

export interface StatsOverview {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  scheduledOrders: number
  departedOrders: number
  returnedOrders: number
  settledOrders: number
  totalDrivers: number
  totalVehicles: number
  todayOrders: number
  pendingSettlements: number
}

export interface MonthlyData {
  month: string
  count: number
  revenue: number
}

export interface StatusData {
  status: string
  label: string
  count: number
}

export interface DriverRanking {
  driverId: number
  name: string
  orderCount: number
  totalFee: number
}

export interface VehicleRanking {
  vehicleId: number
  plateNumber: string
  brand: string
  model: string
  orderCount: number
  totalFee: number
}

export interface VehicleTypeDistribution {
  type: string
  label: string
  count: number
}

export interface RevenueSummary {
  totalRevenue: number
  totalDriverFees: number
  totalVehicleCosts: number
  totalNetProfit: number
  totalDeposits: number
}

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待排班', color: 'bg-yellow-100 text-yellow-800' },
  scheduled: { label: '已排班', color: 'bg-blue-100 text-blue-800' },
  departed: { label: '已出车', color: 'bg-purple-100 text-purple-800' },
  returned: { label: '已返程', color: 'bg-green-100 text-green-800' },
  settled: { label: '已结算', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' },
}

export const DRIVER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '在岗', color: 'bg-green-100 text-green-800' },
  inactive: { label: '离岗', color: 'bg-gray-100 text-gray-800' },
}

export const VEHICLE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  available: { label: '可用', color: 'bg-green-100 text-green-800' },
  in_use: { label: '使用中', color: 'bg-blue-100 text-blue-800' },
  maintenance: { label: '维修中', color: 'bg-yellow-100 text-yellow-800' },
}

export const VEHICLE_TYPE_MAP: Record<string, string> = {
  luxury: '豪华型',
  sedan: '轿车',
  suv: 'SUV',
  other: '其他',
}

export const VEHICLE_ROLE_MAP: Record<string, string> = {
  lead: '主婚车',
  follow: '跟车',
}

export const SETTLEMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '已支付', color: 'bg-green-100 text-green-800' },
}

export interface MaintenanceRecord {
  id: number
  vehicleId: number
  vehiclePlate?: string
  serviceDate: string
  serviceType: string
  serviceItem: string
  mileage: number
  cost: number
  serviceProvider: string
  nextServiceDate?: string
  remark: string
  createdAt: string
  updatedAt: string
}

export interface InsuranceRecord {
  id: number
  vehicleId: number
  vehiclePlate?: string
  insuranceType: string
  insuranceCompany: string
  policyNo: string
  startDate: string
  endDate: string
  premium: number
  coverageAmount: number
  remark: string
  createdAt: string
  updatedAt: string
}

export interface InspectionRecord {
  id: number
  vehicleId: number
  vehiclePlate?: string
  inspectionDate: string
  inspectionResult: 'pass' | 'fail' | 'pending'
  inspectionAgency: string
  nextInspectionDate: string
  cost: number
  remark: string
  createdAt: string
  updatedAt: string
}

export const MAINTENANCE_TYPE_OPTIONS = [
  '常规保养',
  '机油更换',
  '轮胎更换',
  '刹车片更换',
  '空调保养',
  '大保养',
  '钣金喷漆',
  '其他维修',
]

export const INSURANCE_TYPE_OPTIONS = [
  '交强险',
  '商业险-车辆损失险',
  '商业险-第三者责任险',
  '商业险-车上人员责任险',
  '商业险-全车盗抢险',
  '商业险-综合险',
  '车船税',
]

export const INSPECTION_RESULT_MAP: Record<string, { label: string; color: string }> = {
  pass: { label: '合格', color: 'bg-green-100 text-green-800' },
  fail: { label: '不合格', color: 'bg-red-100 text-red-800' },
  pending: { label: '待检', color: 'bg-yellow-100 text-yellow-800' },
}

export const FLOWER_PACKAGE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '上架', color: 'bg-green-100 text-green-800' },
  inactive: { label: '下架', color: 'bg-gray-100 text-gray-800' },
}

export const CAR_DECORATION_STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '上架', color: 'bg-green-100 text-green-800' },
  inactive: { label: '下架', color: 'bg-gray-100 text-gray-800' },
}

export const CAR_DECORATION_TYPE_MAP: Record<string, string> = {
  front: '车头花艺',
  full: '全车装饰',
  side: '车身花艺',
  trunk: '后备箱花艺',
  interior: '车内装饰',
  custom: '定制装饰',
}

export interface RepairOrder {
  id: number
  orderNo: string
  vehicleId: number
  vehiclePlate?: string
  reportDate: string
  reporter: string
  repairType: 'maintenance' | 'repair' | 'accident' | 'other'
  priority: 'normal' | 'urgent' | 'emergency'
  title: string
  description: string
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  assignee?: string
  serviceProvider?: string
  estimatedCost?: number
  actualCost?: number
  startDate?: string
  completeDate?: string
  mileage?: number
  repairItems?: string
  remark?: string
  createdAt: string
  updatedAt: string
}

export const REPAIR_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待派修', color: 'bg-yellow-100 text-yellow-800' },
  assigned: { label: '已派修', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: '维修中', color: 'bg-purple-100 text-purple-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
}

export const REPAIR_TYPE_MAP: Record<string, { label: string; color: string }> = {
  maintenance: { label: '常规保养', color: 'bg-blue-100 text-blue-800' },
  repair: { label: '故障维修', color: 'bg-red-100 text-red-800' },
  accident: { label: '事故维修', color: 'bg-orange-100 text-orange-800' },
  other: { label: '其他', color: 'bg-gray-100 text-gray-800' },
}

export const REPAIR_PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  normal: { label: '普通', color: 'bg-gray-100 text-gray-800' },
  urgent: { label: '紧急', color: 'bg-orange-100 text-orange-800' },
  emergency: { label: '特急', color: 'bg-red-100 text-red-800' },
}

export const REPAIR_TYPE_OPTIONS = [
  { value: 'maintenance', label: '常规保养' },
  { value: 'repair', label: '故障维修' },
  { value: 'accident', label: '事故维修' },
  { value: 'other', label: '其他' },
]

export const REPAIR_PRIORITY_OPTIONS = [
  { value: 'normal', label: '普通' },
  { value: 'urgent', label: '紧急' },
  { value: 'emergency', label: '特急' },
]

export const REPAIR_STATUS_OPTIONS = [
  { value: 'pending', label: '待派修' },
  { value: 'assigned', label: '已派修' },
  { value: 'in_progress', label: '维修中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

export type InventoryCategory = 'flower' | 'decoration'
export type InventoryOperationType = 'in' | 'out' | 'loss'

export interface InventoryItem {
  id: number
  name: string
  category: InventoryCategory
  unit: string
  stock: number
  safetyStock: number
  unitPrice: number
  totalValue: number
  supplier: string
  remark: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface InventoryRecord {
  id: number
  itemId: number
  itemName?: string
  operationType: InventoryOperationType
  quantity: number
  unitPrice: number
  totalPrice: number
  operator: string
  operationDate: string
  orderNo?: string
  remark: string
  createdAt: string
}

export interface InventoryLossStats {
  itemId: number
  itemName: string
  category: InventoryCategory
  lossQuantity: number
  lossValue: number
  totalInQuantity: number
  lossRate: number
}

export const INVENTORY_CATEGORY_MAP: Record<InventoryCategory, { label: string; color: string }> = {
  flower: { label: '鲜花类', color: 'bg-pink-100 text-pink-800' },
  decoration: { label: '装饰用品类', color: 'bg-purple-100 text-purple-800' },
}

export const INVENTORY_CATEGORY_OPTIONS = [
  { value: 'flower', label: '鲜花类' },
  { value: 'decoration', label: '装饰用品类' },
]

export const INVENTORY_OPERATION_TYPE_MAP: Record<InventoryOperationType, { label: string; color: string }> = {
  in: { label: '入库', color: 'bg-green-100 text-green-800' },
  out: { label: '出库', color: 'bg-blue-100 text-blue-800' },
  loss: { label: '损耗', color: 'bg-red-100 text-red-800' },
}

export const INVENTORY_OPERATION_TYPE_OPTIONS = [
  { value: 'in', label: '入库' },
  { value: 'out', label: '出库' },
  { value: 'loss', label: '损耗' },
]

export const INVENTORY_STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '启用', color: 'bg-green-100 text-green-800' },
  inactive: { label: '停用', color: 'bg-gray-100 text-gray-800' },
}
