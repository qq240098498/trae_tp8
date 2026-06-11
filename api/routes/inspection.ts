import { Router, type Request, type Response } from 'express'
import { db, type InspectionRecord } from '../db.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const database = db.read()
  const { vehicleId, keyword, result } = req.query

  let records = [...database.inspectionRecords]

  if (vehicleId && vehicleId !== 'all') {
    records = records.filter(r => r.vehicleId === Number(vehicleId))
  }

  if (result && result !== 'all') {
    records = records.filter(r => r.inspectionResult === result)
  }

  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase()
    records = records.filter(r => {
      const vehicle = database.vehicles.find(v => v.id === r.vehicleId)
      return (
        r.inspectionAgency.toLowerCase().includes(kw) ||
        (vehicle && vehicle.plateNumber.toLowerCase().includes(kw))
      )
    })
  }

  const recordsWithPlate = records.map(r => {
    const vehicle = database.vehicles.find(v => v.id === r.vehicleId)
    return { ...r, vehiclePlate: vehicle?.plateNumber || '' }
  })

  recordsWithPlate.sort((a, b) => new Date(b.nextInspectionDate).getTime() - new Date(a.nextInspectionDate).getTime())

  res.json({
    success: true,
    data: recordsWithPlate,
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const record = database.inspectionRecords.find(r => r.id === id)

  if (!record) {
    res.status(404).json({
      success: false,
      error: '年检记录不存在',
    })
    return
  }

  const vehicle = database.vehicles.find(v => v.id === record.vehicleId)
  const recordWithPlate = { ...record, vehiclePlate: vehicle?.plateNumber || '' }

  res.json({
    success: true,
    data: recordWithPlate,
  })
})

router.post('/', (req: Request, res: Response): void => {
  const database = db.read()
  const body = req.body as Partial<InspectionRecord>

  const vehicle = database.vehicles.find(v => v.id === body.vehicleId)
  if (!vehicle) {
    res.status(400).json({
      success: false,
      error: '关联车辆不存在',
    })
    return
  }

  const newRecord: InspectionRecord = {
    id: db.getNextId(database.inspectionRecords),
    vehicleId: body.vehicleId || 0,
    inspectionDate: body.inspectionDate || '',
    inspectionResult: body.inspectionResult || 'pending',
    inspectionAgency: body.inspectionAgency || '',
    nextInspectionDate: body.nextInspectionDate || '',
    cost: body.cost || 0,
    remark: body.remark || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  database.inspectionRecords.push(newRecord)
  db.write(database)

  const recordWithPlate = { ...newRecord, vehiclePlate: vehicle?.plateNumber || '' }

  res.json({
    success: true,
    data: recordWithPlate,
  })
})

router.put('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const body = req.body as Partial<InspectionRecord>
  const index = database.inspectionRecords.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '年检记录不存在',
    })
    return
  }

  database.inspectionRecords[index] = {
    ...database.inspectionRecords[index],
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  }

  db.write(database)

  const vehicle = database.vehicles.find(v => v.id === database.inspectionRecords[index].vehicleId)
  const recordWithPlate = { ...database.inspectionRecords[index], vehiclePlate: vehicle?.plateNumber || '' }

  res.json({
    success: true,
    data: recordWithPlate,
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.inspectionRecords.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '年检记录不存在',
    })
    return
  }

  database.inspectionRecords.splice(index, 1)
  db.write(database)

  res.json({
    success: true,
    message: '删除成功',
  })
})

export default router
