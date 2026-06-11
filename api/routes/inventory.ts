import { Router, type Request, type Response } from 'express'
import { db, type InventoryItem, type InventoryRecord } from '../db.js'

const router = Router()

router.get('/items', (req: Request, res: Response): void => {
  const database = db.read()
  const { category, status, keyword, lowStock } = req.query

  let items = [...database.inventoryItems]

  if (category && category !== 'all') {
    items = items.filter((i) => i.category === category)
  }

  if (status && status !== 'all') {
    items = items.filter((i) => i.status === status)
  }

  if (lowStock === 'true') {
    items = items.filter((i) => i.stock <= i.safetyStock)
  }

  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase()
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(kw) ||
        i.supplier.toLowerCase().includes(kw) ||
        i.remark.toLowerCase().includes(kw),
    )
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  res.json({
    success: true,
    data: items,
  })
})

router.get('/items/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const item = database.inventoryItems.find((i) => i.id === id)

  if (!item) {
    res.status(404).json({
      success: false,
      error: '物料不存在',
    })
    return
  }

  res.json({
    success: true,
    data: item,
  })
})

router.post('/items', (req: Request, res: Response): void => {
  const database = db.read()
  const body = req.body as Partial<InventoryItem>

  if (!body.name || !body.category || !body.unit) {
    res.status(400).json({
      success: false,
      error: '请填写必要信息：名称、类别、单位',
    })
    return
  }

  const newItem: InventoryItem = {
    id: db.getNextId(database.inventoryItems),
    name: body.name || '',
    category: body.category as InventoryItem['category'],
    unit: body.unit || '',
    stock: body.stock || 0,
    safetyStock: body.safetyStock || 0,
    unitPrice: body.unitPrice || 0,
    totalValue: (body.stock || 0) * (body.unitPrice || 0),
    supplier: body.supplier || '',
    remark: body.remark || '',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  database.inventoryItems.push(newItem)
  db.write(database)

  res.json({
    success: true,
    data: newItem,
  })
})

router.put('/items/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const body = req.body as Partial<InventoryItem>
  const index = database.inventoryItems.findIndex((i) => i.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '物料不存在',
    })
    return
  }

  const existingItem = database.inventoryItems[index]
  const updatedStock = body.stock !== undefined ? body.stock : existingItem.stock
  const updatedUnitPrice = body.unitPrice !== undefined ? body.unitPrice : existingItem.unitPrice

  database.inventoryItems[index] = {
    ...existingItem,
    ...body,
    id,
    stock: updatedStock,
    unitPrice: updatedUnitPrice,
    totalValue: updatedStock * updatedUnitPrice,
    updatedAt: new Date().toISOString(),
  }

  db.write(database)

  res.json({
    success: true,
    data: database.inventoryItems[index],
  })
})

router.patch('/items/:id/status', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const { status } = req.body as { status: 'active' | 'inactive' }
  const index = database.inventoryItems.findIndex((i) => i.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '物料不存在',
    })
    return
  }

  database.inventoryItems[index] = {
    ...database.inventoryItems[index],
    status,
    updatedAt: new Date().toISOString(),
  }

  db.write(database)

  res.json({
    success: true,
    data: database.inventoryItems[index],
  })
})

router.delete('/items/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.inventoryItems.findIndex((i) => i.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '物料不存在',
    })
    return
  }

  database.inventoryItems.splice(index, 1)
  db.write(database)

  res.json({
    success: true,
    message: '删除成功',
  })
})

router.get('/records', (req: Request, res: Response): void => {
  const database = db.read()
  const { operationType, itemId, dateFrom, dateTo, keyword } = req.query

  let records = [...database.inventoryRecords]

  if (operationType && operationType !== 'all') {
    records = records.filter((r) => r.operationType === operationType)
  }

  if (itemId && itemId !== 'all') {
    records = records.filter((r) => r.itemId === Number(itemId))
  }

  if (dateFrom && typeof dateFrom === 'string') {
    records = records.filter((r) => r.operationDate >= dateFrom)
  }

  if (dateTo && typeof dateTo === 'string') {
    records = records.filter((r) => r.operationDate <= dateTo)
  }

  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase()
    records = records.filter((r) => {
      const item = database.inventoryItems.find((i) => i.id === r.itemId)
      return (
        r.operator.toLowerCase().includes(kw) ||
        r.remark.toLowerCase().includes(kw) ||
        (item && item.name.toLowerCase().includes(kw)) ||
        (r.orderNo && r.orderNo.toLowerCase().includes(kw))
      )
    })
  }

  const recordsWithItemName = records.map((r) => {
    const item = database.inventoryItems.find((i) => i.id === r.itemId)
    return { ...r, itemName: item?.name || '' }
  })

  recordsWithItemName.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  res.json({
    success: true,
    data: recordsWithItemName,
  })
})

router.post('/records', (req: Request, res: Response): void => {
  const database = db.read()
  const body = req.body as Partial<InventoryRecord> & { operator: string }

  if (!body.itemId || !body.operationType || !body.quantity || !body.operator) {
    res.status(400).json({
      success: false,
      error: '请填写必要信息：物料、操作类型、数量、操作人',
    })
    return
  }

  const itemIndex = database.inventoryItems.findIndex((i) => i.id === Number(body.itemId))
  if (itemIndex === -1) {
    res.status(400).json({
      success: false,
      error: '物料不存在',
    })
    return
  }

  const item = database.inventoryItems[itemIndex]
  const quantity = Number(body.quantity)
  const unitPrice = body.unitPrice !== undefined ? Number(body.unitPrice) : item.unitPrice
  const totalPrice = quantity * unitPrice

  if (body.operationType !== 'in' && item.stock < quantity) {
    res.status(400).json({
      success: false,
      error: `库存不足，当前库存：${item.stock} ${item.unit}`,
    })
    return
  }

  let newStock = item.stock
  if (body.operationType === 'in') {
    newStock = item.stock + quantity
  } else {
    newStock = item.stock - quantity
  }

  const newRecord: InventoryRecord = {
    id: db.getNextId(database.inventoryRecords),
    itemId: Number(body.itemId),
    operationType: body.operationType as InventoryRecord['operationType'],
    quantity,
    unitPrice,
    totalPrice,
    operator: body.operator,
    operationDate: body.operationDate || new Date().toISOString().slice(0, 10),
    orderNo: body.orderNo,
    remark: body.remark || '',
    createdAt: new Date().toISOString(),
  }

  database.inventoryRecords.push(newRecord)

  database.inventoryItems[itemIndex] = {
    ...item,
    stock: newStock,
    totalValue: newStock * item.unitPrice,
    updatedAt: new Date().toISOString(),
  }

  db.write(database)

  const updatedItem = database.inventoryItems[itemIndex]
  const recordWithItemName = { ...newRecord, itemName: updatedItem.name }

  res.json({
    success: true,
    data: recordWithItemName,
    item: updatedItem,
  })
})

router.get('/loss-stats', (req: Request, res: Response): void => {
  const database = db.read()
  const { category, dateFrom, dateTo } = req.query

  let records = [...database.inventoryRecords]

  if (dateFrom && typeof dateFrom === 'string') {
    records = records.filter((r) => r.operationDate >= dateFrom)
  }

  if (dateTo && typeof dateTo === 'string') {
    records = records.filter((r) => r.operationDate <= dateTo)
  }

  const statsMap = new Map<number, {
    itemId: number
    itemName: string
    category: InventoryItem['category']
    lossQuantity: number
    lossValue: number
    totalInQuantity: number
  }>()

  for (const item of database.inventoryItems) {
    if (category && category !== 'all' && item.category !== category) {
      continue
    }
    statsMap.set(item.id, {
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      lossQuantity: 0,
      lossValue: 0,
      totalInQuantity: 0,
    })
  }

  for (const record of records) {
    const stat = statsMap.get(record.itemId)
    if (!stat) continue

    if (record.operationType === 'loss') {
      stat.lossQuantity += record.quantity
      stat.lossValue += record.totalPrice
    } else if (record.operationType === 'in') {
      stat.totalInQuantity += record.quantity
    }
  }

  const stats = Array.from(statsMap.values())
    .map((s) => ({
      ...s,
      lossRate: s.totalInQuantity > 0 ? (s.lossQuantity / s.totalInQuantity) * 100 : 0,
    }))
    .filter((s) => s.lossQuantity > 0 || s.totalInQuantity > 0)
    .sort((a, b) => b.lossValue - a.lossValue)

  const summary = {
    totalLossQuantity: stats.reduce((sum, s) => sum + s.lossQuantity, 0),
    totalLossValue: stats.reduce((sum, s) => sum + s.lossValue, 0),
    totalItems: stats.length,
    highLossItems: stats.filter((s) => s.lossRate > 5).length,
  }

  res.json({
    success: true,
    data: {
      list: stats,
      summary,
    },
  })
})

router.get('/overview', (req: Request, res: Response): void => {
  const database = db.read()

  const totalItems = database.inventoryItems.length
  const activeItems = database.inventoryItems.filter((i) => i.status === 'active').length
  const lowStockItems = database.inventoryItems.filter(
    (i) => i.stock <= i.safetyStock && i.status === 'active',
  ).length

  const totalValue = database.inventoryItems.reduce(
    (sum, i) => sum + i.totalValue,
    0,
  )

  const flowerItems = database.inventoryItems.filter((i) => i.category === 'flower')
  const decorationItems = database.inventoryItems.filter((i) => i.category === 'decoration')

  const flowerValue = flowerItems.reduce((sum, i) => sum + i.totalValue, 0)
  const decorationValue = decorationItems.reduce((sum, i) => sum + i.totalValue, 0)

  const today = new Date().toISOString().slice(0, 10)
  const todayRecords = database.inventoryRecords.filter(
    (r) => r.operationDate === today,
  )

  const todayIn = todayRecords
    .filter((r) => r.operationType === 'in')
    .reduce((sum, r) => sum + r.totalPrice, 0)
  const todayOut = todayRecords
    .filter((r) => r.operationType === 'out')
    .reduce((sum, r) => sum + r.totalPrice, 0)
  const todayLoss = todayRecords
    .filter((r) => r.operationType === 'loss')
    .reduce((sum, r) => sum + r.totalPrice, 0)

  res.json({
    success: true,
    data: {
      totalItems,
      activeItems,
      lowStockItems,
      totalValue,
      flowerCount: flowerItems.length,
      decorationCount: decorationItems.length,
      flowerValue,
      decorationValue,
      todayIn,
      todayOut,
      todayLoss,
    },
  })
})

export default router
