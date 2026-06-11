import { create } from 'zustand'
import type {
  Driver,
  Vehicle,
  Order,
  OrderVehicleDetail,
  Settlement,
  StatsOverview,
  MonthlyData,
  StatusData,
  DriverRanking,
  VehicleRanking,
  VehicleTypeDistribution,
  RevenueSummary,
  MaintenanceRecord,
  InsuranceRecord,
  InspectionRecord,
  FlowerPackage,
  CarDecoration,
} from '@/types'
import { api } from '@/services/api'

interface AppState {
  drivers: Driver[]
  vehicles: Vehicle[]
  orders: Order[]
  settlements: Settlement[]
  maintenanceRecords: MaintenanceRecord[]
  insuranceRecords: InsuranceRecord[]
  inspectionRecords: InspectionRecord[]
  flowerPackages: FlowerPackage[]
  carDecorations: CarDecoration[]
  stats: {
    overview: StatsOverview | null
    monthlyData: MonthlyData[]
    statusData: StatusData[]
    topDrivers: DriverRanking[]
    topVehicles: VehicleRanking[]
    vehicleTypeDistribution: VehicleTypeDistribution[]
    revenueSummary: RevenueSummary | null
  }
  loading: boolean
  error: string | null

  fetchDrivers: (params?: { status?: string; keyword?: string }) => Promise<void>
  fetchVehicles: (params?: { status?: string; vehicleType?: string; keyword?: string }) => Promise<void>
  fetchOrders: (params?: { status?: string; dateFrom?: string; dateTo?: string; keyword?: string }) => Promise<void>
  fetchSettlements: (params?: { status?: string; dateFrom?: string; dateTo?: string }) => Promise<void>
  fetchMaintenanceRecords: (params?: { vehicleId?: string | number; keyword?: string }) => Promise<void>
  fetchInsuranceRecords: (params?: { vehicleId?: string | number; keyword?: string }) => Promise<void>
  fetchInspectionRecords: (params?: { vehicleId?: string | number; keyword?: string; result?: string }) => Promise<void>
  fetchFlowerPackages: (params?: { status?: string; keyword?: string }) => Promise<void>
  fetchCarDecorations: (params?: { status?: string; decorationType?: string; keyword?: string }) => Promise<void>
  fetchStatsOverview: () => Promise<void>
  fetchStatsMonthly: () => Promise<void>
  fetchStatsStatus: () => Promise<void>
  fetchTopDrivers: (limit?: number) => Promise<void>
  fetchTopVehicles: (limit?: number) => Promise<void>
  fetchVehicleTypeDistribution: () => Promise<void>
  fetchRevenueSummary: () => Promise<void>
  fetchAllStats: () => Promise<void>

  addDriver: (data: Partial<Driver>) => Promise<Driver>
  updateDriver: (id: number, data: Partial<Driver>) => Promise<Driver>
  deleteDriver: (id: number) => Promise<void>

  addVehicle: (data: Partial<Vehicle>) => Promise<Vehicle>
  updateVehicle: (id: number, data: Partial<Vehicle>) => Promise<Vehicle>
  deleteVehicle: (id: number) => Promise<void>

  addMaintenanceRecord: (data: Partial<MaintenanceRecord>) => Promise<MaintenanceRecord>
  updateMaintenanceRecord: (id: number, data: Partial<MaintenanceRecord>) => Promise<MaintenanceRecord>
  deleteMaintenanceRecord: (id: number) => Promise<void>

  addInsuranceRecord: (data: Partial<InsuranceRecord>) => Promise<InsuranceRecord>
  updateInsuranceRecord: (id: number, data: Partial<InsuranceRecord>) => Promise<InsuranceRecord>
  deleteInsuranceRecord: (id: number) => Promise<void>

  addInspectionRecord: (data: Partial<InspectionRecord>) => Promise<InspectionRecord>
  updateInspectionRecord: (id: number, data: Partial<InspectionRecord>) => Promise<InspectionRecord>
  deleteInspectionRecord: (id: number) => Promise<void>

  addFlowerPackage: (data: Partial<FlowerPackage>) => Promise<FlowerPackage>
  updateFlowerPackage: (id: number, data: Partial<FlowerPackage>) => Promise<FlowerPackage>
  deleteFlowerPackage: (id: number) => Promise<void>

  addCarDecoration: (data: Partial<CarDecoration>) => Promise<CarDecoration>
  updateCarDecoration: (id: number, data: Partial<CarDecoration>) => Promise<CarDecoration>
  deleteCarDecoration: (id: number) => Promise<void>

  addOrder: (data: Partial<Order> & { vehicles?: Array<Partial<import('@/types').OrderVehicle>> }) => Promise<Order>
  updateOrder: (
    id: number,
    data: Partial<Order> & { vehicles?: Array<Partial<import('@/types').OrderVehicle> & { id?: number }> },
  ) => Promise<Order>
  deleteOrder: (id: number) => Promise<void>
  getOrderDetail: (id: number) => Promise<Order>
  getOrderVehicles: (id: number) => Promise<OrderVehicleDetail[]>

  createSettlement: (orderId: number) => Promise<Settlement>
  paySettlement: (id: number) => Promise<Settlement>

  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  drivers: [],
  vehicles: [],
  orders: [],
  settlements: [],
  maintenanceRecords: [],
  insuranceRecords: [],
  inspectionRecords: [],
  flowerPackages: [],
  carDecorations: [],
  stats: {
    overview: null,
    monthlyData: [],
    statusData: [],
    topDrivers: [],
    topVehicles: [],
    vehicleTypeDistribution: [],
    revenueSummary: null,
  },
  loading: false,
  error: null,

  fetchDrivers: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await api.drivers.list(params)
      set({ drivers: data })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchVehicles: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await api.vehicles.list(params)
      set({ vehicles: data })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchOrders: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await api.orders.list(params)
      set({ orders: data })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchSettlements: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await api.settlements.list(params)
      set({ settlements: data })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchMaintenanceRecords: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await api.maintenance.list(params)
      set({ maintenanceRecords: data })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchInsuranceRecords: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await api.insurance.list(params)
      set({ insuranceRecords: data })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchInspectionRecords: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await api.inspection.list(params)
      set({ inspectionRecords: data })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchFlowerPackages: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await api.flowerPackages.list(params)
      set({ flowerPackages: data })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchCarDecorations: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await api.carDecorations.list(params)
      set({ carDecorations: data })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchStatsOverview: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.stats.overview()
      set((state) => ({ stats: { ...state.stats, overview: data } }))
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchStatsMonthly: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.stats.ordersByMonth()
      set((state) => ({ stats: { ...state.stats, monthlyData: data } }))
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchStatsStatus: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.stats.ordersByStatus()
      set((state) => ({ stats: { ...state.stats, statusData: data } }))
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchTopDrivers: async (limit) => {
    set({ loading: true, error: null })
    try {
      const data = await api.stats.topDrivers(limit)
      set((state) => ({ stats: { ...state.stats, topDrivers: data } }))
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchTopVehicles: async (limit) => {
    set({ loading: true, error: null })
    try {
      const data = await api.stats.topVehicles(limit)
      set((state) => ({ stats: { ...state.stats, topVehicles: data } }))
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchVehicleTypeDistribution: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.stats.vehicleTypeDistribution()
      set((state) => ({ stats: { ...state.stats, vehicleTypeDistribution: data } }))
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchRevenueSummary: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.stats.revenueSummary()
      set((state) => ({ stats: { ...state.stats, revenueSummary: data } }))
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  fetchAllStats: async () => {
    set({ loading: true, error: null })
    try {
      const [overview, monthly, status, topDrivers, topVehicles, vehicleTypes, revenue] = await Promise.all([
        api.stats.overview(),
        api.stats.ordersByMonth(),
        api.stats.ordersByStatus(),
        api.stats.topDrivers(5),
        api.stats.topVehicles(5),
        api.stats.vehicleTypeDistribution(),
        api.stats.revenueSummary(),
      ])
      set((state) => ({
        stats: {
          ...state.stats,
          overview,
          monthlyData: monthly,
          statusData: status,
          topDrivers,
          topVehicles,
          vehicleTypeDistribution: vehicleTypes,
          revenueSummary: revenue,
        },
      }))
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  addDriver: async (data) => {
    const driver = await api.drivers.create(data)
    set((state) => ({ drivers: [...state.drivers, driver] }))
    return driver
  },

  updateDriver: async (id, data) => {
    const driver = await api.drivers.update(id, data)
    set((state) => ({
      drivers: state.drivers.map((d) => (d.id === id ? driver : d)),
    }))
    return driver
  },

  deleteDriver: async (id) => {
    await api.drivers.remove(id)
    set((state) => ({
      drivers: state.drivers.filter((d) => d.id !== id),
    }))
  },

  addVehicle: async (data) => {
    const vehicle = await api.vehicles.create(data)
    set((state) => ({ vehicles: [...state.vehicles, vehicle] }))
    return vehicle
  },

  updateVehicle: async (id, data) => {
    const vehicle = await api.vehicles.update(id, data)
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? vehicle : v)),
    }))
    return vehicle
  },

  deleteVehicle: async (id) => {
    await api.vehicles.remove(id)
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
    }))
  },

  addMaintenanceRecord: async (data) => {
    const record = await api.maintenance.create(data)
    set((state) => ({ maintenanceRecords: [...state.maintenanceRecords, record] }))
    return record
  },

  updateMaintenanceRecord: async (id, data) => {
    const record = await api.maintenance.update(id, data)
    set((state) => ({
      maintenanceRecords: state.maintenanceRecords.map((r) => (r.id === id ? record : r)),
    }))
    return record
  },

  deleteMaintenanceRecord: async (id) => {
    await api.maintenance.remove(id)
    set((state) => ({
      maintenanceRecords: state.maintenanceRecords.filter((r) => r.id !== id),
    }))
  },

  addInsuranceRecord: async (data) => {
    const record = await api.insurance.create(data)
    set((state) => ({ insuranceRecords: [...state.insuranceRecords, record] }))
    return record
  },

  updateInsuranceRecord: async (id, data) => {
    const record = await api.insurance.update(id, data)
    set((state) => ({
      insuranceRecords: state.insuranceRecords.map((r) => (r.id === id ? record : r)),
    }))
    return record
  },

  deleteInsuranceRecord: async (id) => {
    await api.insurance.remove(id)
    set((state) => ({
      insuranceRecords: state.insuranceRecords.filter((r) => r.id !== id),
    }))
  },

  addInspectionRecord: async (data) => {
    const record = await api.inspection.create(data)
    set((state) => ({ inspectionRecords: [...state.inspectionRecords, record] }))
    return record
  },

  updateInspectionRecord: async (id, data) => {
    const record = await api.inspection.update(id, data)
    set((state) => ({
      inspectionRecords: state.inspectionRecords.map((r) => (r.id === id ? record : r)),
    }))
    return record
  },

  deleteInspectionRecord: async (id) => {
    await api.inspection.remove(id)
    set((state) => ({
      inspectionRecords: state.inspectionRecords.filter((r) => r.id !== id),
    }))
  },

  addFlowerPackage: async (data) => {
    const pkg = await api.flowerPackages.create(data)
    set((state) => ({ flowerPackages: [...state.flowerPackages, pkg] }))
    return pkg
  },

  updateFlowerPackage: async (id, data) => {
    const pkg = await api.flowerPackages.update(id, data)
    set((state) => ({
      flowerPackages: state.flowerPackages.map((p) => (p.id === id ? pkg : p)),
    }))
    return pkg
  },

  deleteFlowerPackage: async (id) => {
    await api.flowerPackages.remove(id)
    set((state) => ({
      flowerPackages: state.flowerPackages.filter((p) => p.id !== id),
    }))
  },

  addCarDecoration: async (data) => {
    const dec = await api.carDecorations.create(data)
    set((state) => ({ carDecorations: [...state.carDecorations, dec] }))
    return dec
  },

  updateCarDecoration: async (id, data) => {
    const dec = await api.carDecorations.update(id, data)
    set((state) => ({
      carDecorations: state.carDecorations.map((d) => (d.id === id ? dec : d)),
    }))
    return dec
  },

  deleteCarDecoration: async (id) => {
    await api.carDecorations.remove(id)
    set((state) => ({
      carDecorations: state.carDecorations.filter((d) => d.id !== id),
    }))
  },

  addOrder: async (data) => {
    const order = await api.orders.create(data)
    set((state) => ({ orders: [...state.orders, order] }))
    return order
  },

  updateOrder: async (id, data) => {
    const order = await api.orders.update(id, data)
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? order : o)),
    }))
    return order
  },

  deleteOrder: async (id) => {
    await api.orders.remove(id)
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    }))
  },

  getOrderDetail: async (id) => {
    return await api.orders.get(id)
  },

  getOrderVehicles: async (id) => {
    return await api.orders.getVehicles(id)
  },

  createSettlement: async (orderId) => {
    const settlement = await api.settlements.create(orderId)
    set((state) => ({ settlements: [...state.settlements, settlement] }))
    return settlement
  },

  paySettlement: async (id) => {
    const settlement = await api.settlements.pay(id)
    set((state) => ({
      settlements: state.settlements.map((s) => (s.id === id ? settlement : s)),
    }))
    return settlement
  },

  setError: (error) => set({ error }),
}))
