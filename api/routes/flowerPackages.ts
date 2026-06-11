import { Router, type Request, type Response } from 'express'
import { db, type FlowerPackage } from '../db.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const database = db.read()
  const { status, keyword } = req.query

  let records = [...database.flowerPackages]

  if (status && status !== 'all') {
    records = records.filter(r => r.status === status)
  }

  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase()
    records = records.filter(r =>
      r.name.toLowerCase().includes(kw) ||
      r.description.toLowerCase().includes(kw)
    )
  }

  records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  res.json({
    success: true,
    data: records,
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const record = database.flowerPackages.find(r => r.id === id)

  if (!record) {
    res.status(404).json({
      success: false,
      error: '花艺套餐不存在',
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
  const body = req.body as Partial<FlowerPackage>

  const newRecord: FlowerPackage = {
    id: db.getNextId(database.flowerPackages),
    name: body.name || '',
    description: body.description || '',
    price: body.price || 0,
    items: body.items || '',
    imageUrl: body.imageUrl || '',
    stock: body.stock || 0,
    usedStock: 0,
    status: body.status || 'active',
    remark: body.remark || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  database.flowerPackages.push(newRecord)
  db.write(database)

  res.json({
    success: true,
    data: newRecord,
  })
})

router.put('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const body = req.body as Partial<FlowerPackage>
  const index = database.flowerPackages.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '花艺套餐不存在',
    })
    return
  }

  database.flowerPackages[index] = {
    ...database.flowerPackages[index],
    ...body,
    id,
    usedStock: database.flowerPackages[index].usedStock,
    updatedAt: new Date().toISOString(),
  }

  db.write(database)

  res.json({
    success: true,
    data: database.flowerPackages[index],
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.flowerPackages.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '花艺套餐不存在',
    })
    return
  }

  database.flowerPackages.splice(index, 1)
  db.write(database)

  res.json({
    success: true,
    message: '删除成功',
  })
})

router.patch('/:id/status', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const { status } = req.body as { status?: FlowerPackage['status'] }
  const index = database.flowerPackages.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '花艺套餐不存在',
    })
    return
  }

  if (!status || (status !== 'active' && status !== 'inactive')) {
    res.status(400).json({
      success: false,
      error: '无效的状态值',
    })
    return
  }

  database.flowerPackages[index].status = status
  database.flowerPackages[index].updatedAt = new Date().toISOString()
  db.write(database)

  res.json({
    success: true,
    data: database.flowerPackages[index],
  })
})

export default router
