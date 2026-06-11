import { Router, type Request, type Response } from 'express'
import { db, type Driver } from '../db.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const database = db.read()
  const { status, keyword } = req.query

  let drivers = [...database.drivers]

  if (status && status !== 'all') {
    drivers = drivers.filter(d => d.status === status)
  }

  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase()
    drivers = drivers.filter(
      d =>
        d.name.toLowerCase().includes(kw) ||
        d.phone.includes(kw) ||
        d.licenseNumber.toLowerCase().includes(kw),
    )
  }

  res.json({
    success: true,
    data: drivers,
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const driver = database.drivers.find(d => d.id === id)

  if (!driver) {
    res.status(404).json({
      success: false,
      error: '司机不存在',
    })
    return
  }

  res.json({
    success: true,
    data: driver,
  })
})

router.post('/', (req: Request, res: Response): void => {
  const database = db.read()
  const body = req.body as Partial<Driver>

  const newDriver: Driver = {
    id: db.getNextId(database.drivers),
    name: body.name || '',
    phone: body.phone || '',
    idCard: body.idCard || '',
    licenseType: body.licenseType || 'C1',
    licenseNumber: body.licenseNumber || '',
    drivingYears: body.drivingYears || 0,
    status: body.status || 'active',
    remark: body.remark || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  database.drivers.push(newDriver)
  db.write(database)

  res.json({
    success: true,
    data: newDriver,
  })
})

router.put('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const body = req.body as Partial<Driver>
  const index = database.drivers.findIndex(d => d.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '司机不存在',
    })
    return
  }

  database.drivers[index] = {
    ...database.drivers[index],
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  }

  db.write(database)

  res.json({
    success: true,
    data: database.drivers[index],
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.drivers.findIndex(d => d.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '司机不存在',
    })
    return
  }

  const hasOrders = database.orderVehicles.some(ov => ov.driverId === id)
  if (hasOrders) {
    res.status(400).json({
      success: false,
      error: '该司机有关联订单，无法删除',
    })
    return
  }

  database.drivers.splice(index, 1)
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
  const index = database.drivers.findIndex(d => d.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '司机不存在',
    })
    return
  }

  database.drivers[index].status = status
  database.drivers[index].updatedAt = new Date().toISOString()
  db.write(database)

  res.json({
    success: true,
    data: database.drivers[index],
  })
})

export default router
