import { Router, type Request, type Response } from 'express'
import { db, type CarDecoration } from '../db.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const database = db.read()
  const { status, decorationType, keyword } = req.query

  let records = [...database.carDecorations]

  if (status && status !== 'all') {
    records = records.filter(r => r.status === status)
  }

  if (decorationType && decorationType !== 'all') {
    records = records.filter(r => r.decorationType === decorationType)
  }

  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase()
    records = records.filter(r =>
      r.name.toLowerCase().includes(kw) ||
      r.description.toLowerCase().includes(kw)
    )
  }

  res.json({
    success: true,
    data: records,
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const record = database.carDecorations.find(r => r.id === id)

  if (!record) {
    res.status(404).json({
      success: false,
      error: '车辆装饰不存在',
    })
    return
  }

  res.json({
    success: true,
    data: record,
  })
})

router.post('/', (req: Request, res: Response): void => {
  const database = db.read()
  const body = req.body as Partial<CarDecoration>

  const newRecord: CarDecoration = {
    id: db.getNextId(database.carDecorations),
    name: body.name || '',
    decorationType: body.decorationType || '',
    description: body.description || '',
    price: body.price || 0,
    applicableVehicleTypes: body.applicableVehicleTypes || '',
    imageUrl: body.imageUrl || '',
    stock: body.stock || 0,
    usedStock: 0,
    status: body.status || 'active',
    remark: body.remark || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  database.carDecorations.push(newRecord)
  db.write(database)

  res.json({
    success: true,
    data: newRecord,
  })
})

router.put('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const body = req.body as Partial<CarDecoration>
  const index = database.carDecorations.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '车辆装饰不存在',
    })
    return
  }

  database.carDecorations[index] = {
    ...database.carDecorations[index],
    ...body,
    id,
    usedStock: database.carDecorations[index].usedStock,
    updatedAt: new Date().toISOString(),
  }

  db.write(database)

  res.json({
    success: true,
    data: database.carDecorations[index],
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.carDecorations.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '车辆装饰不存在',
    })
    return
  }

  database.carDecorations.splice(index, 1)
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
  const index = database.carDecorations.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '车辆装饰不存在',
    })
    return
  }

  database.carDecorations[index].status = status
  database.carDecorations[index].updatedAt = new Date().toISOString()
  db.write(database)

  res.json({
    success: true,
    data: database.carDecorations[index],
  })
})

export default router
