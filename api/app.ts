/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import driversRoutes from './routes/drivers.js'
import vehiclesRoutes from './routes/vehicles.js'
import ordersRoutes from './routes/orders.js'
import settlementsRoutes from './routes/settlements.js'
import statsRoutes from './routes/stats.js'
import maintenanceRoutes from './routes/maintenance.js'
import insuranceRoutes from './routes/insurance.js'
import inspectionRoutes from './routes/inspection.js'
import flowerPackagesRoutes from './routes/flowerPackages.js'
import carDecorationsRoutes from './routes/carDecorations.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/drivers', driversRoutes)
app.use('/api/vehicles', vehiclesRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/settlements', settlementsRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/insurance', insuranceRoutes)
app.use('/api/inspection', inspectionRoutes)
app.use('/api/flower-packages', flowerPackagesRoutes)
app.use('/api/car-decorations', carDecorationsRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
