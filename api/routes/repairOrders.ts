import { Router, type Request, type Response } from 'express'
import { db, type RepairOrder } from '../db.js'

const router = Router()

function generateRepairOrderNo(date: string): string {
  const database = db.read()
  const dateStr = date.replace(/-/g, '')
  const dayOrders = database.repairOrders.filter((o) =>
    o.reportDate.startsWith(date.slice(0, 10)),
  )
  const seq = String(dayOrders.length + 1).padStart(3, '0')
  return `RX${dateStr}${seq}`
}

router.get('/', (req: Request, res: Response): void => {
  const database = db.read()
  const { vehicleId, status, keyword } = req.query

  let orders = [...database.repairOrders]

  if (vehicleId && vehicleId !== 'all') {
    orders = orders.filter((o) => o.vehicleId === Number(vehicleId))
  }

  if (status && status !== 'all') {
    orders = orders.filter((o) => o.status === status)
  }

  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase()
    orders = orders.filter((o) => {
      const vehicle = database.vehicles.find((v) => v.id === o.vehicleId)
      return (
        o.orderNo.toLowerCase().includes(kw) ||
        o.title.toLowerCase().includes(kw) ||
        o.description.toLowerCase().includes(kw) ||
        o.reporter.toLowerCase().includes(kw) ||
        (o.assignee && o.assignee.toLowerCase().includes(kw)) ||
        (o.serviceProvider && o.serviceProvider.toLowerCase().includes(kw)) ||
        (vehicle && vehicle.plateNumber.toLowerCase().includes(kw))
      )
    })
  }

  const ordersWithPlate = orders.map((o) => {
    const vehicle = database.vehicles.find((v) => v.id === o.vehicleId)
    return { ...o, vehiclePlate: vehicle?.plateNumber || '' }
  })

  ordersWithPlate.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  res.json({
    success: true,
    data: ordersWithPlate,
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const order = database.repairOrders.find((o) => o.id === id)

  if (!order) {
    res.status(404).json({
      success: false,
      error: '维修工单不存在',
    })
    return
  }

  const vehicle = database.vehicles.find((v) => v.id === order.vehicleId)
  const orderWithPlate = { ...order, vehiclePlate: vehicle?.plateNumber || '' }

  res.json({
    success: true,
    data: orderWithPlate,
  })
})

router.post('/', (req: Request, res: Response): void => {
  const database = db.read()
  const body = req.body as Partial<RepairOrder>

  const vehicle = database.vehicles.find((v) => v.id === body.vehicleId)
  if (!vehicle) {
    res.status(400).json({
      success: false,
      error: '关联车辆不存在',
    })
    return
  }

  const reportDate = body.reportDate || new Date().toISOString().slice(0, 10)

  const newOrder: RepairOrder = {
    id: db.getNextId(database.repairOrders),
    orderNo: generateRepairOrderNo(reportDate),
    vehicleId: body.vehicleId || 0,
    reportDate,
    reporter: body.reporter || '',
    repairType: body.repairType || 'repair',
    priority: body.priority || 'normal',
    title: body.title || '',
    description: body.description || '',
    status: 'pending',
    assignee: body.assignee,
    serviceProvider: body.serviceProvider,
    estimatedCost: body.estimatedCost,
    actualCost: body.actualCost,
    startDate: body.startDate,
    completeDate: body.completeDate,
    mileage: body.mileage,
    repairItems: body.repairItems,
    remark: body.remark,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  database.repairOrders.push(newOrder)

  if (vehicle.status !== 'maintenance') {
    const vehicleIndex = database.vehicles.findIndex((v) => v.id === vehicle.id)
    database.vehicles[vehicleIndex] = {
      ...database.vehicles[vehicleIndex],
      status: 'maintenance',
      updatedAt: new Date().toISOString(),
    }
  }

  db.write(database)

  const orderWithPlate = { ...newOrder, vehiclePlate: vehicle?.plateNumber || '' }

  res.json({
    success: true,
    data: orderWithPlate,
  })
})

router.put('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const body = req.body as Partial<RepairOrder>
  const index = database.repairOrders.findIndex((o) => o.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '维修工单不存在',
    })
    return
  }

  const oldStatus = database.repairOrders[index].status
  const newStatus = body.status || oldStatus

  database.repairOrders[index] = {
    ...database.repairOrders[index],
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  }

  const vehicle = database.vehicles.find(
    (v) => v.id === database.repairOrders[index].vehicleId,
  )
  if (vehicle) {
    const vehicleIndex = database.vehicles.findIndex(
      (v) => v.id === vehicle.id,
    )
    if (newStatus === 'completed' || newStatus === 'cancelled') {
      const hasActiveRepair = database.repairOrders.some(
        (o) =>
          o.vehicleId === vehicle.id &&
          o.id !== id &&
          (o.status === 'pending' ||
            o.status === 'assigned' ||
            o.status === 'in_progress'),
      )
      if (!hasActiveRepair && vehicle.status === 'maintenance') {
        database.vehicles[vehicleIndex] = {
          ...database.vehicles[vehicleIndex],
          status: 'available',
          updatedAt: new Date().toISOString(),
        }
      }
    } else if (
      (newStatus === 'assigned' || newStatus === 'in_progress') &&
      vehicle.status !== 'maintenance'
    ) {
      database.vehicles[vehicleIndex] = {
        ...database.vehicles[vehicleIndex],
        status: 'maintenance',
        updatedAt: new Date().toISOString(),
      }
    }
  }

  db.write(database)

  const updatedVehicle = database.vehicles.find(
    (v) => v.id === database.repairOrders[index].vehicleId,
  )
  const orderWithPlate = {
    ...database.repairOrders[index],
    vehiclePlate: updatedVehicle?.plateNumber || '',
  }

  res.json({
    success: true,
    data: orderWithPlate,
  })
})

router.patch('/:id/assign', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const body = req.body as {
    assignee?: string
    serviceProvider?: string
    estimatedCost?: number
    startDate?: string
  }
  const index = database.repairOrders.findIndex((o) => o.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '维修工单不存在',
    })
    return
  }

  if (database.repairOrders[index].status !== 'pending') {
    res.status(400).json({
      success: false,
      error: '只有待派修状态的工单才能派修',
    })
    return
  }

  database.repairOrders[index] = {
    ...database.repairOrders[index],
    assignee: body.assignee,
    serviceProvider: body.serviceProvider,
    estimatedCost: body.estimatedCost,
    startDate: body.startDate || new Date().toISOString().slice(0, 10),
    status: 'assigned',
    updatedAt: new Date().toISOString(),
  }

  const vehicle = database.vehicles.find(
    (v) => v.id === database.repairOrders[index].vehicleId,
  )
  if (vehicle && vehicle.status !== 'maintenance') {
    const vehicleIndex = database.vehicles.findIndex(
      (v) => v.id === vehicle.id,
    )
    database.vehicles[vehicleIndex] = {
      ...database.vehicles[vehicleIndex],
      status: 'maintenance',
      updatedAt: new Date().toISOString(),
    }
  }

  db.write(database)

  const updatedVehicle = database.vehicles.find(
    (v) => v.id === database.repairOrders[index].vehicleId,
  )
  const orderWithPlate = {
    ...database.repairOrders[index],
    vehiclePlate: updatedVehicle?.plateNumber || '',
  }

  res.json({
    success: true,
    data: orderWithPlate,
  })
})

router.patch('/:id/start', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.repairOrders.findIndex((o) => o.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '维修工单不存在',
    })
    return
  }

  const currentStatus = database.repairOrders[index].status
  if (currentStatus !== 'assigned') {
    res.status(400).json({
      success: false,
      error: '只有已派修状态的工单才能开始维修',
    })
    return
  }

  database.repairOrders[index] = {
    ...database.repairOrders[index],
    status: 'in_progress',
    startDate:
      database.repairOrders[index].startDate ||
      new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
  }

  db.write(database)

  const vehicle = database.vehicles.find(
    (v) => v.id === database.repairOrders[index].vehicleId,
  )
  const orderWithPlate = {
    ...database.repairOrders[index],
    vehiclePlate: vehicle?.plateNumber || '',
  }

  res.json({
    success: true,
    data: orderWithPlate,
  })
})

router.patch('/:id/complete', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const body = req.body as {
    actualCost?: number
    completeDate?: string
    repairItems?: string
    remark?: string
  }
  const index = database.repairOrders.findIndex((o) => o.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '维修工单不存在',
    })
    return
  }

  const currentStatus = database.repairOrders[index].status
  if (currentStatus !== 'in_progress') {
    res.status(400).json({
      success: false,
      error: '只有维修中状态的工单才能完成',
    })
    return
  }

  database.repairOrders[index] = {
    ...database.repairOrders[index],
    actualCost: body.actualCost,
    completeDate: body.completeDate || new Date().toISOString().slice(0, 10),
    repairItems: body.repairItems || database.repairOrders[index].repairItems,
    remark: body.remark || database.repairOrders[index].remark,
    status: 'completed',
    updatedAt: new Date().toISOString(),
  }

  const vehicle = database.vehicles.find(
    (v) => v.id === database.repairOrders[index].vehicleId,
  )
  if (vehicle) {
    const hasActiveRepair = database.repairOrders.some(
      (o) =>
        o.vehicleId === vehicle.id &&
        o.id !== id &&
        (o.status === 'pending' ||
          o.status === 'assigned' ||
          o.status === 'in_progress'),
    )
    if (!hasActiveRepair && vehicle.status === 'maintenance') {
      const vehicleIndex = database.vehicles.findIndex(
        (v) => v.id === vehicle.id,
      )
      database.vehicles[vehicleIndex] = {
        ...database.vehicles[vehicleIndex],
        status: 'available',
        updatedAt: new Date().toISOString(),
      }
    }
  }

  db.write(database)

  const updatedVehicle = database.vehicles.find(
    (v) => v.id === database.repairOrders[index].vehicleId,
  )
  const orderWithPlate = {
    ...database.repairOrders[index],
    vehiclePlate: updatedVehicle?.plateNumber || '',
  }

  res.json({
    success: true,
    data: orderWithPlate,
  })
})

router.patch('/:id/cancel', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.repairOrders.findIndex((o) => o.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '维修工单不存在',
    })
    return
  }

  const currentStatus = database.repairOrders[index].status
  if (currentStatus === 'completed') {
    res.status(400).json({
      success: false,
      error: '已完成的工单不能取消',
    })
    return
  }

  database.repairOrders[index] = {
    ...database.repairOrders[index],
    status: 'cancelled',
    updatedAt: new Date().toISOString(),
  }

  const vehicle = database.vehicles.find(
    (v) => v.id === database.repairOrders[index].vehicleId,
  )
  if (vehicle) {
    const hasActiveRepair = database.repairOrders.some(
      (o) =>
        o.vehicleId === vehicle.id &&
        o.id !== id &&
        (o.status === 'pending' ||
          o.status === 'assigned' ||
          o.status === 'in_progress'),
    )
    if (!hasActiveRepair && vehicle.status === 'maintenance') {
      const vehicleIndex = database.vehicles.findIndex(
        (v) => v.id === vehicle.id,
      )
      database.vehicles[vehicleIndex] = {
        ...database.vehicles[vehicleIndex],
        status: 'available',
        updatedAt: new Date().toISOString(),
      }
    }
  }

  db.write(database)

  const updatedVehicle = database.vehicles.find(
    (v) => v.id === database.repairOrders[index].vehicleId,
  )
  const orderWithPlate = {
    ...database.repairOrders[index],
    vehiclePlate: updatedVehicle?.plateNumber || '',
  }

  res.json({
    success: true,
    data: orderWithPlate,
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.repairOrders.findIndex((o) => o.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '维修工单不存在',
    })
    return
  }

  const vehicleId = database.repairOrders[index].vehicleId
  database.repairOrders.splice(index, 1)

  const vehicle = database.vehicles.find((v) => v.id === vehicleId)
  if (vehicle) {
    const hasActiveRepair = database.repairOrders.some(
      (o) =>
        o.vehicleId === vehicleId &&
        (o.status === 'pending' ||
          o.status === 'assigned' ||
          o.status === 'in_progress'),
    )
    if (!hasActiveRepair && vehicle.status === 'maintenance') {
      const vehicleIndex = database.vehicles.findIndex(
        (v) => v.id === vehicleId,
      )
      database.vehicles[vehicleIndex] = {
        ...database.vehicles[vehicleIndex],
        status: 'available',
        updatedAt: new Date().toISOString(),
      }
    }
  }

  db.write(database)

  res.json({
    success: true,
    message: '删除成功',
  })
})

export default router
