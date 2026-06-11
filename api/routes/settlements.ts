import { Router, type Request, type Response } from 'express'
import { db, type Settlement } from '../db.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const database = db.read()
  const { status, dateFrom, dateTo } = req.query

  let settlements = [...database.settlements]

  if (status && status !== 'all') {
    settlements = settlements.filter(s => s.status === status)
  }

  if (dateFrom && typeof dateFrom === 'string') {
    settlements = settlements.filter(s => s.createdAt >= dateFrom)
  }

  if (dateTo && typeof dateTo === 'string') {
    settlements = settlements.filter(s => s.createdAt <= dateTo + 'T23:59:59.999Z')
  }

  settlements.sort((a, b) => b.id - a.id)

  res.json({
    success: true,
    data: settlements,
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const settlement = database.settlements.find(s => s.id === id)

  if (!settlement) {
    res.status(404).json({
      success: false,
      error: '结算单不存在',
    })
    return
  }

  res.json({
    success: true,
    data: settlement,
  })
})

router.post('/:orderId', (req: Request, res: Response): void => {
  const database = db.read()
  const orderId = Number(req.params.orderId)

  const order = database.orders.find(o => o.id === orderId)
  if (!order) {
    res.status(404).json({
      success: false,
      error: '订单不存在',
    })
    return
  }

  const existingSettlement = database.settlements.find(s => s.orderId === orderId)
  if (existingSettlement) {
    res.status(400).json({
      success: false,
      error: '该订单已存在结算单',
    })
    return
  }

  const orderVehicles = database.orderVehicles.filter(ov => ov.orderId === orderId)
  const totalDriverFees = orderVehicles.reduce((sum, ov) => sum + ov.driverFee, 0)
  const totalServiceFees = orderVehicles.reduce((sum, ov) => sum + ov.serviceFee, 0)

  const newSettlement: Settlement = {
    id: db.getNextId(database.settlements),
    orderId,
    orderNo: order.orderNo,
    totalAmount: order.totalAmount,
    driverFees: totalDriverFees,
    vehicleCosts: totalServiceFees - totalDriverFees,
    extraFees: 0,
    netProfit: order.totalAmount - totalDriverFees - (totalServiceFees - totalDriverFees),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  database.settlements.push(newSettlement)
  db.write(database)

  res.json({
    success: true,
    data: newSettlement,
  })
})

router.put('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const body = req.body as Partial<Settlement>
  const index = database.settlements.findIndex(s => s.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '结算单不存在',
    })
    return
  }

  database.settlements[index] = {
    ...database.settlements[index],
    ...body,
    id,
  }

  db.write(database)

  res.json({
    success: true,
    data: database.settlements[index],
  })
})

router.post('/:id/pay', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.settlements.findIndex(s => s.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '结算单不存在',
    })
    return
  }

  database.settlements[index].status = 'paid'
  database.settlements[index].paidAt = new Date().toISOString()

  const settlement = database.settlements[index]
  const orderIndex = database.orders.findIndex(o => o.id === settlement.orderId)
  if (orderIndex !== -1) {
    database.orders[orderIndex].status = 'settled'
    database.orders[orderIndex].updatedAt = new Date().toISOString()
  }

  db.write(database)

  res.json({
    success: true,
    data: database.settlements[index],
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.settlements.findIndex(s => s.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '结算单不存在',
    })
    return
  }

  database.settlements.splice(index, 1)
  db.write(database)

  res.json({
    success: true,
    message: '删除成功',
  })
})

export default router
