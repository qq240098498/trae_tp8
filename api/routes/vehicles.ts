import { Router, type Request, type Response } from 'express'
import { db, type Vehicle } from '../db.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const database = db.read()
  const { status, vehicleType, keyword } = req.query

  let vehicles = [...database.vehicles]

  if (status && status !== 'all') {
    vehicles = vehicles.filter(v => v.status === status)
  }

  if (vehicleType && vehicleType !== 'all') {
    vehicles = vehicles.filter(v => v.vehicleType === vehicleType)
  }

  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase()
    vehicles = vehicles.filter(
      v =>
        v.plateNumber.toLowerCase().includes(kw) ||
        v.brand.toLowerCase().includes(kw) ||
        v.model.toLowerCase().includes(kw),
    )
  }

  res.json({
    success: true,
    data: vehicles,
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const vehicle = database.vehicles.find(v => v.id === id)

  if (!vehicle) {
    res.status(404).json({
      success: false,
      error: '车辆不存在',
    })
    return
  }

  res.json({
    success: true,
    data: vehicle,
  })
})

router.post('/', (req: Request, res: Response): void => {
  const database = db.read()
  const body = req.body as Partial<Vehicle>

  const newVehicle: Vehicle = {
    id: db.getNextId(database.vehicles),
    plateNumber: body.plateNumber || '',
    brand: body.brand || '',
    model: body.model || '',
    color: body.color || '',
    vehicleType: body.vehicleType || 'sedan',
    decorationType: body.decorationType || '标准鲜花装饰',
    seatCount: body.seatCount || 5,
    purchaseYear: body.purchaseYear || new Date().getFullYear(),
    status: body.status || 'available',
    remark: body.remark || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  database.vehicles.push(newVehicle)
  db.write(database)

  res.json({
    success: true,
    data: newVehicle,
  })
})

router.put('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const body = req.body as Partial<Vehicle>
  const index = database.vehicles.findIndex(v => v.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '车辆不存在',
    })
    return
  }

  database.vehicles[index] = {
    ...database.vehicles[index],
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  }

  db.write(database)

  res.json({
    success: true,
    data: database.vehicles[index],
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.vehicles.findIndex(v => v.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '车辆不存在',
    })
    return
  }

  const hasOrders = database.orderVehicles.some(ov => ov.vehicleId === id)
  if (hasOrders) {
    res.status(400).json({
      success: false,
      error: '该车辆有关联订单，无法删除',
    })
    return
  }

  database.vehicles.splice(index, 1)
  db.write(database)

  res.json({
    success: true,
    message: '删除成功',
  })
})

router.patch('/:id/status', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const { status } = req.body
  const index = database.vehicles.findIndex(v => v.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '车辆不存在',
    })
    return
  }

  database.vehicles[index].status = status
  database.vehicles[index].updatedAt = new Date().toISOString()
  db.write(database)

  res.json({
    success: true,
    data: database.vehicles[index],
  })
})

export default router
