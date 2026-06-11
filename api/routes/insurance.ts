import { Router, type Request, type Response } from 'express'
import { db, type InsuranceRecord } from '../db.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const database = db.read()
  const { vehicleId, keyword } = req.query

  let records = [...database.insuranceRecords]

  if (vehicleId && vehicleId !== 'all') {
    records = records.filter(r => r.vehicleId === Number(vehicleId))
  }

  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase()
    records = records.filter(r => {
      const vehicle = database.vehicles.find(v => v.id === r.vehicleId)
      return (
        r.insuranceType.toLowerCase().includes(kw) ||
        r.insuranceCompany.toLowerCase().includes(kw) ||
        r.policyNo.toLowerCase().includes(kw) ||
        (vehicle && vehicle.plateNumber.toLowerCase().includes(kw))
      )
    })
  }

  const recordsWithPlate = records.map(r => {
    const vehicle = database.vehicles.find(v => v.id === r.vehicleId)
    return { ...r, vehiclePlate: vehicle?.plateNumber || '' }
  })

  recordsWithPlate.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())

  res.json({
    success: true,
    data: recordsWithPlate,
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const record = database.insuranceRecords.find(r => r.id === id)

  if (!record) {
    res.status(404).json({
      success: false,
      error: '保险记录不存在',
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
  const body = req.body as Partial<InsuranceRecord>

  const vehicle = database.vehicles.find(v => v.id === body.vehicleId)
  if (!vehicle) {
    res.status(400).json({
      success: false,
      error: '关联车辆不存在',
    })
    return
  }

  const newRecord: InsuranceRecord = {
    id: db.getNextId(database.insuranceRecords),
    vehicleId: body.vehicleId || 0,
    insuranceType: body.insuranceType || '',
    insuranceCompany: body.insuranceCompany || '',
    policyNo: body.policyNo || '',
    startDate: body.startDate || '',
    endDate: body.endDate || '',
    premium: body.premium || 0,
    coverageAmount: body.coverageAmount || 0,
    remark: body.remark || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  database.insuranceRecords.push(newRecord)
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
  const body = req.body as Partial<InsuranceRecord>
  const index = database.insuranceRecords.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '保险记录不存在',
    })
    return
  }

  database.insuranceRecords[index] = {
    ...database.insuranceRecords[index],
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  }

  db.write(database)

  const vehicle = database.vehicles.find(v => v.id === database.insuranceRecords[index].vehicleId)
  const recordWithPlate = { ...database.insuranceRecords[index], vehiclePlate: vehicle?.plateNumber || '' }

  res.json({
    success: true,
    data: recordWithPlate,
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const database = db.read()
  const id = Number(req.params.id)
  const index = database.insuranceRecords.findIndex(r => r.id === id)

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: '保险记录不存在',
    })
    return
  }

  database.insuranceRecords.splice(index, 1)
  db.write(database)

  res.json({
    success: true,
    message: '删除成功',
  })
})

export default router
