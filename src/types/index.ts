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
