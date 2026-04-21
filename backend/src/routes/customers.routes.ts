import { Router } from 'express'
import { customerController } from '../controllers/customer.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { hasRole } from '../middleware/roles.middleware'
import { validate } from '../middleware/validate.middleware'
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator'

const router = Router()

router.use(isAuthenticated)

router.get('/', customerController.list)
router.post('/', validate(createCustomerSchema), customerController.create)
router.get('/:id', customerController.getById)
router.put('/:id', validate(updateCustomerSchema), customerController.update)
router.delete('/:id', hasRole(['ADMIN', 'DIREZIONE']), customerController.delete)
router.get('/:id/cases', customerController.getCases)

export default router
