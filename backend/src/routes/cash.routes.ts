import { Router } from 'express'
import { cashController } from '../controllers/cash.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { createMovementSchema, updateMovementSchema } from '../validators/cash.validator'

const router = Router()

router.use(isAuthenticated)

router.get('/accounts', cashController.getAccounts)
router.post('/accounts', cashController.createAccount)
router.get('/summary', cashController.getSummary)
router.get('/movements', cashController.listMovements)
router.post('/movements', validate(createMovementSchema), cashController.createMovement)
router.put('/movements/:id', validate(updateMovementSchema), cashController.updateMovement)
router.delete('/movements/:id', cashController.deleteMovement)

export default router
