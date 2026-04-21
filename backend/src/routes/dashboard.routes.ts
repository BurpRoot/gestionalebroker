import { Router } from 'express'
import { dashboardController } from '../controllers/dashboard.controller'
import { isAuthenticated } from '../middleware/auth.middleware'

const router = Router()

router.use(isAuthenticated)

router.get('/kpis', dashboardController.kpis)
router.get('/cases-by-status', dashboardController.casesByStatus)
router.get('/revenue-trend', dashboardController.revenueTrend)
router.get('/top-partners', dashboardController.topPartners)
router.get('/top-collaborators', dashboardController.topCollaborators)

export default router
