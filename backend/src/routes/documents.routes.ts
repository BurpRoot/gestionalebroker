import { Router } from 'express'
import { documentController } from '../controllers/document.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { upload } from '../config/multer'

const router = Router()

router.use(isAuthenticated)

router.get('/case/:caseId', documentController.getByCaseId)
router.post('/', upload.single('file'), documentController.upload)
router.get('/:id/download', documentController.download)
router.delete('/:id', documentController.delete)

export default router
