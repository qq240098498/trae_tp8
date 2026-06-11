import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/overview', (req: Request, res: Response): void => {
  const database = db.read()

  const totalOrders = database.orders.length
  const totalRevenue = database.orders
    .filter(o => o.status === 'settled')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const pendingOrders = database.orders.filter(o => o.status === 'pending').length
  const scheduledOrders = database.orders.filter(o => o.status === 'scheduled').length
  const departedOrders = database.orders.filter(o => o.status === 'departed').length
  const returnedOrders = database.orders.filter(o => o.status === 'returned').length
  const settledOrders = database.orders.filter(o => o.status === 'settled').length

  const totalDrivers = database.drivers.filter(d => d.status === 'active').length
  const totalVehicles = database.vehicles.filter(v => v.status === 'available').length

  const today = new Date().toISOString().split('T')[0]
  const todayOrders = database.orders.filter(o => o.weddingDate === today).length

  const pendingSettlements = database.settlements.filter(s => s.status === 'pending').length

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue,
      pendingOrders,
      scheduledOrders,
      departedOrders,
      returnedOrders,
      settledOrders,
      totalDrivers,
      totalVehicles,
      todayOrders,
      pendingSettlements,
    },
  })
})

router.get('/orders-by-month', (req: Request, res: Response): void => {
  const database = db.read()
  const { year } = req.query

  const currentYear = year ? Number(year) : new Date().getFullYear()

  const monthlyData: { month: string; count: number; revenue: number }[] = []

  for (let m = 0; m < 12; m++) {
    const monthStr = `${currentYear}-${String(m + 1).padStart(2, '0')}`
    const monthOrders = database.orders.filter(o => o.weddingDate.startsWith(monthStr))
    const settledOrders = monthOrders.filter(o => o.status === 'settled')
    const revenue = settledOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    monthlyData.push({
      month: `${m + 1}月`,
      count: monthOrders.length,
      revenue,
    })
  }

  res.json({
    success: true,
    data: monthlyData,
  })
})

router.get('/orders-by-status', (req: Request, res: Response): void => {
  const database = db.read()

  const statusMap: Record<string, string> = {
    pending: '待排班',
    scheduled: '已排班',
    departed: '已出车',
    returned: '已返程',
    settled: '已结算',
    cancelled: '已取消',
  }

  const result = Object.entries(statusMap).map(([key, label]) => ({
    status: key,
    label,
    count: database.orders.filter(o => o.status === key).length,
  }))

  res.json({
    success: true,
    data: result,
  })
})

router.get('/revenue-summary', (req: Request, res: Response): void => {
  const database = db.read()

  const totalRevenue = database.orders
    .filter(o => o.status === 'settled')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const totalDriverFees = database.settlements
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.driverFees, 0)

  const totalVehicleCosts = database.settlements
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.vehicleCosts, 0)

  const totalNetProfit = database.settlements
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.netProfit, 0)

  const totalDeposits = database.orders
    .filter(o => o.status !== 'cancelled' && o.status !== 'settled')
    .reduce((sum, o) => sum + o.depositAmount, 0)

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalDriverFees,
      totalVehicleCosts,
      totalNetProfit,
      totalDeposits,
    },
  })
})

router.get('/top-drivers', (req: Request, res: Response): void => {
  const database = db.read()
  const { limit = 5 } = req.query

  const driverStats: { driverId: number; name: string; orderCount: number; totalFee: number }[] = []

  for (const driver of database.drivers) {
    const driverOrders = database.orderVehicles.filter(ov => ov.driverId === driver.id)
    const totalFee = driverOrders.reduce((sum, ov) => sum + ov.driverFee, 0)

    driverStats.push({
      driverId: driver.id,
      name: driver.name,
      orderCount: driverOrders.length,
      totalFee,
    })
  }

  driverStats.sort((a, b) => b.orderCount - a.orderCount)

  res.json({
    success: true,
    data: driverStats.slice(0, Number(limit)),
  })
})

router.get('/top-vehicles', (req: Request, res: Response): void => {
  const database = db.read()
  const { limit = 5 } = req.query

  const vehicleStats: { vehicleId: number; plateNumber: string; brand: string; model: string; orderCount: number; totalFee: number }[] = []

  for (const vehicle of database.vehicles) {
    const vehicleOrders = database.orderVehicles.filter(ov => ov.vehicleId === vehicle.id)
    const totalFee = vehicleOrders.reduce((sum, ov) => sum + ov.serviceFee, 0)

    vehicleStats.push({
      vehicleId: vehicle.id,
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      orderCount: vehicleOrders.length,
      totalFee,
    })
  }

  vehicleStats.sort((a, b) => b.orderCount - a.orderCount)

  res.json({
    success: true,
    data: vehicleStats.slice(0, Number(limit)),
  })
})

router.get('/vehicle-type-distribution', (req: Request, res: Response): void => {
  const database = db.read()

  const typeMap: Record<string, string> = {
    luxury: '豪华型',
    sedan: '轿车',
    suv: 'SUV',
    other: '其他',
  }

  const result = Object.entries(typeMap).map(([key, label]) => ({
    type: key,
    label,
    count: database.vehicles.filter(v => v.vehicleType === key).length,
  }))

  res.json({
    success: true,
    data: result,
  })
})

export default router
