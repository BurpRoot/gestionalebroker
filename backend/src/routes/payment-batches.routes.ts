import { Router } from 'express'
import { paymentBatchController } from '../controllers/payment-batch.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { createBatchSchema, createBatchItemSchema, updateBatchStatusSchema } from '../validators/payment-batch.validator'

const router = Router()

router.use(isAuthenticated)

router.get('/', paymentBatchController.list)
router.post('/', validate(createBatchSchema), paymentBatchController.create)
router.get('/:id', paymentBatchController.getById)
router.patch('/:id/status', validate(updateBatchStatusSchema), paymentBatchController.updateStatus)
router.post('/:id/items', validate(createBatchItemSchema), paymentBatchController.addItem)
router.delete('/:id/items/:itemId', paymentBatchController.removeItem)

export default router
