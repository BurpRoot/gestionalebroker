import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { loginSchema } from '../validators/auth.validator'
import { z } from 'zod'

const router = Router()

router.post('/login', validate(loginSchema), authController.login)
router.post('/logout', authController.logout)
router.get('/me', isAuthenticated, authController.me)
router.post(
  '/change-password',
  isAuthenticated,
  validate(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) })),
  authController.changePassword,
)

export default router
