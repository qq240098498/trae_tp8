import { Router, type Request, type Response } from 'express'
import { db, type Order, type OrderVehicle } from '../db.js'

const router = Router()

function getTimeRange(order: { weddingDate: string; departureTime: string; returnTime: string }) {
  return {
    start: new Date(`${order.weddingDate}T${order.departureTime}:00`).getTime(),
    end: new Date(`${order.weddingDate}T${order.returnTime}:00`).getTime(),
  }
}

function isTimeOverlap(
  range1: { start: number; end: number },
  range2: { start: number; end: number },
): boolean {
  return range1.start < range2.end && range2.start < range1.end
}

router.get('/', (req: Request, res: Response): void => {
  const database = db.read()
  const { status, dateFrom, dateTo, keyword } = req.query

  let orders = [...database.orders]

  if (status && status !== 'all') {
    orders = orders.filter(o => o.status === status)
  }

  if (dateFrom && typeof dateFrom === 'string') {
    orders = orders.filter(o => o.weddingDate >= dateFrom)
  }

  if (dateTo && typeof dateTo === 'string') {
    orders = orders.filter(o => o.weddingDate <= dateTo)
  }

  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase()
    orders = orders.filter(
      o =>
        o.orderNo.toLowerCase().includes(kw) ||
        o.groomName.toLowerCase().includes(kw) ||
        o.brideName.toLowerCase().includes(kw) ||
        o.groomPhone.includes(kw),
    )
  }

  orders.sort((a, b) => {
    if (a.weddingDate === b.weddingDate) return b.id - a.id
    return a.weddingDate < b.weddingDate ? -1 : 1
  })

  res.json({
    success: true,
    data: orders,
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const order = database.orders.find(o => o.id === id)

  if (!order) {
    res.status(404).json({
      success: false,
      error: '订单不存在',
    })
    return
  }

  const orderVehicles = database.orderVehicles.filter(ov => ov.orderId === id)
  const vehiclesWithDetails = orderVehicles.map(ov => {
    const vehicle = database.vehicles.find(v => v.id === ov.vehicleId)
    const driver = database.drivers.find(d => d.id === ov.driverId)
    return {
      ...ov,
      vehicle,
      driver,
    }
  })

  const flowerPackages = (order.flowerPackageIds || []).map((pid: number) =>
    database.flowerPackages.find(fp => fp.id === pid)
  ).filter(Boolean)

  const carDecorations = (order.carDecorationIds || []).map((did: number) =>
    database.carDecorations.find(cd => cd.id === did)
  ).filter(Boolean)

  res.json({
    success: true,
    data: {
      ...order,
      vehicles: vehiclesWithDetails,
      flowerPackages,
      carDecorations,
    },
  })
})

router.get('/:id/vehicles', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const orderVehicles = database.orderVehicles.filter(ov => ov.orderId === id)

  const vehiclesWithDetails = orderVehicles.map(ov => {
    const vehicle = database.vehicles.find(v => v.id === ov.vehicleId)
    const driver = database.drivers.find(d => d.id === ov.driverId)
    return {
      ...ov,
      vehicle,
      driver,
    }
  })

  res.json({
    success: true,
    data: vehiclesWithDetails,
  })
})

router.post('/check-conflict', (req: Request, res: Response): void => {
  const database = db.read()
  const { weddingDate, departureTime, returnTime, vehicleIds, driverIds, excludeOrderId } = req.body

  if (!weddingDate || !departureTime || !returnTime) {
    res.status(400).json({
      success: false,
      error: '请提供日期和时间段',
    })
    return
  }

  const newOrderRange = getTimeRange({
    weddingDate,
    departureTime,
    returnTime,
  })

  const dateOrders = database.orders.filter(
    o => o.weddingDate === weddingDate && o.status !== 'cancelled' && (excludeOrderId ? o.id !== excludeOrderId : true),
  )

  const conflictOrderIds: number[] = []
  for (const order of dateOrders) {
    const existingRange = getTimeRange(order)
    if (isTimeOverlap(newOrderRange, existingRange)) {
      conflictOrderIds.push(order.id)
    }
  }

  const dateOrderVehicles = database.orderVehicles.filter(ov =>
    conflictOrderIds.includes(ov.orderId),
  )

  const conflictVehicles: number[] = []
  const conflictDrivers: number[] = []
  const conflictInfoMap: Record<number, { orderId: number; orderNo: string; timeRange: string }[]> = {}

  for (const ov of dateOrderVehicles) {
    const order = database.orders.find(o => o.id === ov.orderId)
    const timeInfo = order ? `${order.departureTime}-${order.returnTime}` : ''
    const orderInfo = order ? { orderId: order.id, orderNo: order.orderNo, timeRange: timeInfo } : null

    if (vehicleIds && Array.isArray(vehicleIds) && vehicleIds.includes(ov.vehicleId)) {
      if (!conflictVehicles.includes(ov.vehicleId)) {
        conflictVehicles.push(ov.vehicleId)
      }
      if (orderInfo) {
        if (!conflictInfoMap[ov.vehicleId]) conflictInfoMap[ov.vehicleId] = []
        conflictInfoMap[ov.vehicleId].push(orderInfo)
      }
    }

    if (driverIds && Array.isArray(driverIds) && driverIds.includes(ov.driverId)) {
      if (!conflictDrivers.includes(ov.driverId)) {
        conflictDrivers.push(ov.driverId)
      }
    }
  }

  const conflictVehicleDetails = conflictVehicles.map(id => {
    const vehicle = database.vehicles.find(v => v.id === id)
    return vehicle ? { ...vehicle, conflictOrders: conflictInfoMap[id] || [] } : null
  }).filter(Boolean)

  const conflictDriverDetails = conflictDrivers.map(id => database.drivers.find(d => d.id === id)).filter(Boolean)

  res.json({
    success: true,
    data: {
      hasConflict: conflictVehicles.length > 0 || conflictDrivers.length > 0,
      conflictVehicles: conflictVehicleDetails,
      conflictDrivers: conflictDriverDetails,
    },
  })
})

router.get('/schedule/available', (req: Request, res: Response): void => {
  const database = db.read()
  const { date, departureTime, returnTime } = req.query

  if (!date || typeof date !== 'string') {
    res.status(400).json({
      success: false,
      error: '请指定日期',
    })
    return
  }

  const depTime = (departureTime as string) || '00:00'
  const retTime = (returnTime as string) || '23:59'
  const queryRange = getTimeRange({
    weddingDate: date,
    departureTime: depTime,
    returnTime: retTime,
  })

  const dateOrders = database.orders.filter(
    o => o.weddingDate === date && o.status !== 'cancelled',
  )

  const conflictOrderIds: number[] = []
  for (const order of dateOrders) {
    const existingRange = getTimeRange(order)
    if (isTimeOverlap(queryRange, existingRange)) {
      conflictOrderIds.push(order.id)
    }
  }

  const dateOrderVehicles = database.orderVehicles.filter(ov =>
    conflictOrderIds.includes(ov.orderId),
  )

  const usedVehicleIds = new Set(dateOrderVehicles.map(ov => ov.vehicleId))
  const usedDriverIds = new Set(dateOrderVehicles.map(ov => ov.driverId))

  const availableVehicles = database.vehicles.filter(
    v => v.status === 'available' && !usedVehicleIds.has(v.id),
  )
  const availableDrivers = database.drivers.filter(
    d => d.status === 'active' && !usedDriverIds.has(d.id),
  )

  res.json({
    success: true,
    data: {
      vehicles: availableVehicles,
      drivers: availableDrivers,
    },
  })
})

router.post('/', (req: Request, res: Response): void => {
  const database = db.read()
  const body = req.body as Partial<Order> & { vehicles?: Array<Partial<OrderVehicle>> }

  const flowerPackageIds = body.flowerPackageIds || []
  const carDecorationIds = body.carDecorationIds || []

  for (const pid of flowerPackageIds) {
    const pkg = database.flowerPackages.find(p => p.id === pid)
    if (!pkg) {
      res.status(400).json({
        success: false,
        error: `鲜花套餐ID ${pid} 不存在`,
      })
      return
    }
    const available = pkg.stock - pkg.usedStock
    if (available < 1) {
      res.status(400).json({
        success: false,
        error: `鲜花套餐「${pkg.name}」库存不足，剩余 ${available} 份`,
      })
      return
    }
  }

  for (const did of carDecorationIds) {
    const dec = database.carDecorations.find(d => d.id === did)
    if (!dec) {
      res.status(400).json({
        success: false,
        error: `婚车装饰ID ${did} 不存在`,
      })
      return
    }
    const available = dec.stock - dec.usedStock
    if (available < 1) {
      res.status(400).json({
        success: false,
        error: `婚车装饰「${dec.name}」库存不足，剩余 ${available} 份`,
      })
      return
    }
  }

  for (const pid of flowerPackageIds) {
    const idx = database.flowerPackages.findIndex(p => p.id === pid)
    if (idx !== -1) {
      database.flowerPackages[idx].usedStock += 1
      database.flowerPackages[idx].updatedAt = new Date().toISOString()
    }
  }

  for (const did of carDecorationIds) {
    const idx = database.carDecorations.findIndex(d => d.id === did)
    if (idx !== -1) {
      database.carDecorations[idx].usedStock += 1
      database.carDecorations[idx].updatedAt = new Date().toISOString()
    }
  }

  const orderNo = db.generateOrderNo(body.weddingDate || new Date().toISOString().split('T')[0])

  const newOrder: Order = {
    id: db.getNextId(database.orders),
    orderNo,
    groomName: body.groomName || '',
    brideName: body.brideName || '',
    groomPhone: body.groomPhone || '',
    bridePhone: body.bridePhone || '',
    weddingDate: body.weddingDate || '',
    departureTime: body.departureTime || '08:00',
    returnTime: body.returnTime || '18:00',
    pickupAddress: body.pickupAddress || '',
    ceremonyAddress: body.ceremonyAddress || '',
    dropoffAddress: body.dropoffAddress || '',
    status: body.status || 'pending',
    totalAmount: body.totalAmount || 0,
    depositAmount: body.depositAmount || 0,
    flowerPackageIds: body.flowerPackageIds || [],
    carDecorationIds: body.carDecorationIds || [],
    remark: body.remark || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  database.orders.push(newOrder)

  if (body.vehicles && body.vehicles.length > 0) {
    body.vehicles.forEach((v, index) => {
      const orderVehicle: OrderVehicle = {
        id: db.getNextId(database.orderVehicles) + index,
        orderId: newOrder.id,
        vehicleId: v.vehicleId || 0,
        driverId: v.driverId || 0,
        sequence: v.sequence || index + 1,
        role: v.role || (index === 0 ? 'lead' : 'follow'),
        estimatedMileage: v.estimatedMileage || 0,
        serviceFee: v.serviceFee || 0,
        driverFee: v.driverFee || 0,
      }
      database.orderVehicles.push(orderVehicle)
    })
    newOrder.status = 'scheduled'
  }

  db.write(database)

  res.json({
    success: true,
    data: newOrder,
  })
})

router.put('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const body = req.body as Partial<Order> & { vehicles?: Array<Partial<OrderVehicle> & { id?: number }> }
  const index = database.orders.findIndex(o => o.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '订单不存在',
    })
    return
  }

  const oldFlowerIds = database.orders[index].flowerPackageIds || []
  const oldDecoIds = database.orders[index].carDecorationIds || []
  const newFlowerIds = body.flowerPackageIds || oldFlowerIds
  const newDecoIds = body.carDecorationIds || oldDecoIds

  if (body.status === 'cancelled' && database.orders[index].status !== 'cancelled') {
    for (const pid of oldFlowerIds) {
      const idx = database.flowerPackages.findIndex(p => p.id === pid)
      if (idx !== -1 && database.flowerPackages[idx].usedStock > 0) {
        database.flowerPackages[idx].usedStock -= 1
        database.flowerPackages[idx].updatedAt = new Date().toISOString()
      }
    }
    for (const did of oldDecoIds) {
      const idx = database.carDecorations.findIndex(d => d.id === did)
      if (idx !== -1 && database.carDecorations[idx].usedStock > 0) {
        database.carDecorations[idx].usedStock -= 1
        database.carDecorations[idx].updatedAt = new Date().toISOString()
      }
    }
  } else if (database.orders[index].status !== 'cancelled') {
    const addedFlowers = newFlowerIds.filter(pid => !oldFlowerIds.includes(pid))
    const removedFlowers = oldFlowerIds.filter(pid => !newFlowerIds.includes(pid))
    const addedDecos = newDecoIds.filter(did => !oldDecoIds.includes(did))
    const removedDecos = oldDecoIds.filter(did => !newDecoIds.includes(did))

    for (const pid of addedFlowers) {
      const pkg = database.flowerPackages.find(p => p.id === pid)
      if (!pkg) {
        res.status(400).json({ success: false, error: `鲜花套餐ID ${pid} 不存在` })
        return
      }
      if (pkg.stock - pkg.usedStock < 1) {
        res.status(400).json({ success: false, error: `鲜花套餐「${pkg.name}」库存不足，剩余 ${pkg.stock - pkg.usedStock} 份` })
        return
      }
    }
    for (const did of addedDecos) {
      const dec = database.carDecorations.find(d => d.id === did)
      if (!dec) {
        res.status(400).json({ success: false, error: `婚车装饰ID ${did} 不存在` })
        return
      }
      if (dec.stock - dec.usedStock < 1) {
        res.status(400).json({ success: false, error: `婚车装饰「${dec.name}」库存不足，剩余 ${dec.stock - dec.usedStock} 份` })
        return
      }
    }

    for (const pid of addedFlowers) {
      const idx = database.flowerPackages.findIndex(p => p.id === pid)
      if (idx !== -1) {
        database.flowerPackages[idx].usedStock += 1
        database.flowerPackages[idx].updatedAt = new Date().toISOString()
      }
    }
    for (const pid of removedFlowers) {
      const idx = database.flowerPackages.findIndex(p => p.id === pid)
      if (idx !== -1 && database.flowerPackages[idx].usedStock > 0) {
        database.flowerPackages[idx].usedStock -= 1
        database.flowerPackages[idx].updatedAt = new Date().toISOString()
      }
    }
    for (const did of addedDecos) {
      const idx = database.carDecorations.findIndex(d => d.id === did)
      if (idx !== -1) {
        database.carDecorations[idx].usedStock += 1
        database.carDecorations[idx].updatedAt = new Date().toISOString()
      }
    }
    for (const did of removedDecos) {
      const idx = database.carDecorations.findIndex(d => d.id === did)
      if (idx !== -1 && database.carDecorations[idx].usedStock > 0) {
        database.carDecorations[idx].usedStock -= 1
        database.carDecorations[idx].updatedAt = new Date().toISOString()
      }
    }
  }

  database.orders[index] = {
    ...database.orders[index],
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  }

  if (body.vehicles !== undefined) {
    const existingVehicles = database.orderVehicles.filter(ov => ov.orderId === id)
    const existingIds = new Set(existingVehicles.map(v => v.id))
    const incomingIds = new Set(body.vehicles.filter(v => v.id).map(v => v.id as number))

    const toRemove = existingVehicles.filter(v => !incomingIds.has(v.id))
    toRemove.forEach(v => {
      const idx = database.orderVehicles.findIndex(ov => ov.id === v.id)
      if (idx !== -1) database.orderVehicles.splice(idx, 1)
    })

    body.vehicles.forEach((v) => {
      if (v.id && existingIds.has(v.id)) {
        const idx = database.orderVehicles.findIndex(ov => ov.id === v.id)
        if (idx !== -1) {
          database.orderVehicles[idx] = {
            ...database.orderVehicles[idx],
            ...v,
            id: v.id,
            orderId: id,
          } as OrderVehicle
        }
      } else {
        const newVehicle: OrderVehicle = {
          id: db.getNextId(database.orderVehicles),
          orderId: id,
          vehicleId: v.vehicleId || 0,
          driverId: v.driverId || 0,
          sequence: v.sequence || 1,
          role: v.role || 'follow',
          estimatedMileage: v.estimatedMileage || 0,
          serviceFee: v.serviceFee || 0,
          driverFee: v.driverFee || 0,
        }
        database.orderVehicles.push(newVehicle)
      }
    })

    const remainingVehicles = database.orderVehicles.filter(ov => ov.orderId === id)
    if (remainingVehicles.length > 0 && database.orders[index].status === 'pending') {
      database.orders[index].status = 'scheduled'
    } else if (remainingVehicles.length === 0 && database.orders[index].status === 'scheduled') {
      database.orders[index].status = 'pending'
    }
  }

  db.write(database)

  res.json({
    success: true,
    data: database.orders[index],
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.orders.findIndex(o => o.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '订单不存在',
    })
    return
  }

  const order = database.orders[index]
  if (order.status !== 'cancelled') {
    for (const pid of (order.flowerPackageIds || [])) {
      const idx = database.flowerPackages.findIndex(p => p.id === pid)
      if (idx !== -1 && database.flowerPackages[idx].usedStock > 0) {
        database.flowerPackages[idx].usedStock -= 1
        database.flowerPackages[idx].updatedAt = new Date().toISOString()
      }
    }
    for (const did of (order.carDecorationIds || [])) {
      const idx = database.carDecorations.findIndex(d => d.id === did)
      if (idx !== -1 && database.carDecorations[idx].usedStock > 0) {
        database.carDecorations[idx].usedStock -= 1
        database.carDecorations[idx].updatedAt = new Date().toISOString()
      }
    }
  }

  const orderVehicles = database.orderVehicles.filter(ov => ov.orderId === id)
  orderVehicles.forEach(ov => {
    const idx = database.orderVehicles.findIndex(v => v.id === ov.id)
    if (idx !== -1) database.orderVehicles.splice(idx, 1)
  })

  database.orders.splice(index, 1)
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
  const index = database.orders.findIndex(o => o.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '订单不存在',
    })
    return
  }

  const oldStatus = database.orders[index].status
  if (status === 'cancelled' && oldStatus !== 'cancelled') {
    for (const pid of (database.orders[index].flowerPackageIds || [])) {
      const idx = database.flowerPackages.findIndex(p => p.id === pid)
      if (idx !== -1 && database.flowerPackages[idx].usedStock > 0) {
        database.flowerPackages[idx].usedStock -= 1
        database.flowerPackages[idx].updatedAt = new Date().toISOString()
      }
    }
    for (const did of (database.orders[index].carDecorationIds || [])) {
      const idx = database.carDecorations.findIndex(d => d.id === did)
      if (idx !== -1 && database.carDecorations[idx].usedStock > 0) {
        database.carDecorations[idx].usedStock -= 1
        database.carDecorations[idx].updatedAt = new Date().toISOString()
      }
    }
  }

  database.orders[index].status = status
  database.orders[index].updatedAt = new Date().toISOString()
  db.write(database)

  res.json({
    success: true,
    data: database.orders[index],
  })
})

router.post('/:id/depart', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const { vehicleIds, departureTime, actualMileage } = req.body
  const orderIndex = database.orders.findIndex(o => o.id === id)

  if (orderIndex === -1) {
    res.status(404).json({
      success: false,
      error: '订单不存在',
    })
    return
  }

  const orderVehicles = database.orderVehicles.filter(ov => ov.orderId === id)

  if (vehicleIds && Array.isArray(vehicleIds)) {
    vehicleIds.forEach((vid: number) => {
      const ovIndex = database.orderVehicles.findIndex(ov => ov.id === vid && ov.orderId === id)
      if (ovIndex !== -1) {
        database.orderVehicles[ovIndex].departureTime = departureTime || new Date().toISOString()
        if (actualMileage !== undefined) {
          database.orderVehicles[ovIndex].actualMileage = actualMileage
        }
      }
    })
  } else {
    orderVehicles.forEach(ov => {
      const ovIndex = database.orderVehicles.findIndex(v => v.id === ov.id)
      if (ovIndex !== -1) {
        database.orderVehicles[ovIndex].departureTime = departureTime || new Date().toISOString()
      }
    })
  }

  database.orders[orderIndex].status = 'departed'
  database.orders[orderIndex].updatedAt = new Date().toISOString()
  db.write(database)

  res.json({
    success: true,
    data: database.orders[orderIndex],
  })
})

router.post('/:id/return', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const { vehicleIds, returnTime, actualMileages } = req.body
  const orderIndex = database.orders.findIndex(o => o.id === id)

  if (orderIndex === -1) {
    res.status(404).json({
      success: false,
      error: '订单不存在',
    })
    return
  }

  const orderVehicles = database.orderVehicles.filter(ov => ov.orderId === id)

  if (vehicleIds && Array.isArray(vehicleIds)) {
    vehicleIds.forEach((vid: number, idx: number) => {
      const ovIndex = database.orderVehicles.findIndex(ov => ov.id === vid && ov.orderId === id)
      if (ovIndex !== -1) {
        database.orderVehicles[ovIndex].returnTime = returnTime || new Date().toISOString()
        if (actualMileages && actualMileages[idx] !== undefined) {
          database.orderVehicles[ovIndex].actualMileage = actualMileages[idx]
        }
      }
    })
  } else {
    orderVehicles.forEach(ov => {
      const ovIndex = database.orderVehicles.findIndex(v => v.id === ov.id)
      if (ovIndex !== -1) {
        database.orderVehicles[ovIndex].returnTime = returnTime || new Date().toISOString()
      }
    })
  }

  database.orders[orderIndex].status = 'returned'
  database.orders[orderIndex].updatedAt = new Date().toISOString()
  db.write(database)

  res.json({
    success: true,
    data: database.orders[orderIndex],
  })
})

export default router
