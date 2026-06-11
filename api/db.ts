import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json')

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
  flowerPackageIds: number[]
  carDecorationIds: number[]
  remark: string
  createdAt: string
  updatedAt: string
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

export interface MaintenanceRecord {
  id: number
  vehicleId: number
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
  inspectionDate: string
  inspectionResult: 'pass' | 'fail' | 'pending'
  inspectionAgency: string
  nextInspectionDate: string
  cost: number
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

export interface RepairOrder {
  id: number
  orderNo: string
  vehicleId: number
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

export interface Database {
  drivers: Driver[]
  vehicles: Vehicle[]
  orders: Order[]
  orderVehicles: OrderVehicle[]
  settlements: Settlement[]
  maintenanceRecords: MaintenanceRecord[]
  insuranceRecords: InsuranceRecord[]
  inspectionRecords: InspectionRecord[]
  flowerPackages: FlowerPackage[]
  carDecorations: CarDecoration[]
  repairOrders: RepairOrder[]
}

function readDB(): Database {
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(raw) as Database
}

function writeDB(db: Database): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}

function getNextId<T extends { id: number }>(items: T[]): number {
  if (items.length === 0) return 1
  return Math.max(...items.map(item => item.id)) + 1
}

function generateOrderNo(date: string): string {
  const db = readDB()
  const dateStr = date.replace(/-/g, '')
  const dayOrders = db.orders.filter(o => o.weddingDate === date)
  const seq = String(dayOrders.length + 1).padStart(3, '0')
  return `WED${dateStr}${seq}`
}

export const db = {
  read: readDB,
  write: writeDB,
  getNextId,
  generateOrderNo,
}
