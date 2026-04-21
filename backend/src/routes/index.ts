import { Router } from 'express'
import authRoutes from './auth.routes'
import userRoutes from './users.routes'
import customerRoutes from './customers.routes'
import vehicleRoutes from './vehicles.routes'
import partnerRoutes from './partners.routes'
import collaboratorRoutes from './collaborators.routes'
import caseRoutes from './cases.routes'
import cashRoutes from './cash.routes'
import documentRoutes from './documents.routes'
import taskRoutes from './tasks.routes'
import paymentBatchRoutes from './payment-batches.routes'
import dashboardRoutes from './dashboard.routes'
import importRoutes from './import.routes'
import deadlineRoutes from './deadlines.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/customers', customerRoutes)
router.use('/vehicles', vehicleRoutes)
router.use('/partners', partnerRoutes)
router.use('/collaborators', collaboratorRoutes)
router.use('/cases', caseRoutes)
router.use('/cash', cashRoutes)
router.use('/documents', documentRoutes)
router.use('/tasks', taskRoutes)
router.use('/payment-batches', paymentBatchRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/import', importRoutes)
router.use('/deadlines', deadlineRoutes)

router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

export default router
