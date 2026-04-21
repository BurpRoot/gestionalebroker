import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { hasRole } from '../middleware/roles.middleware'

const router = Router()

router.use(isAuthenticated)
router.use(hasRole(['ADMIN']))

router.get('/', userController.list)
router.post('/', userController.create)
router.get('/:id', userController.getById)
router.put('/:id', userController.update)
router.post('/:id/reset-password', userController.resetPassword)

export default router
