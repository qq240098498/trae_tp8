import { Router, type Request, type Response } from 'express'
import { db, type MaintenanceRecord } from '../db.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const database = db.read()
  const { vehicleId, keyword } = req.query

  let records = [...database.maintenanceRecords]

  if (vehicleId && vehicleId !== 'all') {
    records = records.filter(r => r.vehicleId === Number(vehicleId))
  }

  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase()
    records = records.filter(r => {
      const vehicle = database.vehicles.find(v => v.id === r.vehicleId)
      return (
        r.serviceType.toLowerCase().includes(kw) ||
        r.serviceProvider.toLowerCase().includes(kw) ||
        r.serviceItem.toLowerCase().includes(kw) ||
        (vehicle && vehicle.plateNumber.toLowerCase().includes(kw))
      )
    })
  }

  const recordsWithPlate = records.map(r => {
    const vehicle = database.vehicles.find(v => v.id === r.vehicleId)
    return { ...r, vehiclePlate: vehicle?.plateNumber || '' }
  })

  recordsWithPlate.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())

  res.json({
    success: true,
    data: recordsWithPlate,
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const record = database.maintenanceRecords.find(r => r.id === id)

  if (!record) {
    res.status(404).json({
      success: false,
      error: '维保记录不存在',
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
  const body = req.body as Partial<MaintenanceRecord>

  const vehicle = database.vehicles.find(v => v.id === body.vehicleId)
  if (!vehicle) {
    res.status(400).json({
      success: false,
      error: '关联车辆不存在',
    })
    return
  }

  const newRecord: MaintenanceRecord = {
    id: db.getNextId(database.maintenanceRecords),
    vehicleId: body.vehicleId || 0,
    serviceDate: body.serviceDate || '',
    serviceType: body.serviceType || '',
    serviceItem: body.serviceItem || '',
    mileage: body.mileage || 0,
    cost: body.cost || 0,
    serviceProvider: body.serviceProvider || '',
    nextServiceDate: body.nextServiceDate,
    remark: body.remark || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  database.maintenanceRecords.push(newRecord)
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
  const body = req.body as Partial<MaintenanceRecord>
  const index = database.maintenanceRecords.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '维保记录不存在',
    })
    return
  }

  database.maintenanceRecords[index] = {
    ...database.maintenanceRecords[index],
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  }

  db.write(database)

  const vehicle = database.vehicles.find(v => v.id === database.maintenanceRecords[index].vehicleId)
  const recordWithPlate = { ...database.maintenanceRecords[index], vehiclePlate: vehicle?.plateNumber || '' }

  res.json({
    success: true,
    data: recordWithPlate,
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.maintenanceRecords.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '维保记录不存在',
    })
    return
  }

  database.maintenanceRecords.splice(index, 1)
  db.write(database)

  res.json({
    success: true,
    message: '删除成功',
  })
})

export default router
