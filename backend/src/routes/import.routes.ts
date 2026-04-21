import { Router } from 'express'
import { importController } from '../controllers/import.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { hasRole } from '../middleware/roles.middleware'
import { uploadTemp } from '../config/multer'

const router = Router()

router.use(isAuthenticated)
router.use(hasRole(['ADMIN', 'OPERATORE']))

router.post('/preview', uploadTemp.single('file'), importController.preview)
router.post('/confirm', importController.confirm)

export default router
