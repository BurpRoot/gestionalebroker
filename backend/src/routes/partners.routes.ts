import { Router } from 'express'
import { partnerController } from '../controllers/partner.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { hasRole } from '../middleware/roles.middleware'
import { validate } from '../middleware/validate.middleware'
import { createPartnerSchema, updatePartnerSchema } from '../validators/partner.validator'

const router = Router()

router.use(isAuthenticated)

router.get('/', partnerController.list)
router.post('/', validate(createPartnerSchema), partnerController.create)
router.get('/:id', partnerController.getById)
router.put('/:id', validate(updatePartnerSchema), partnerController.update)
router.delete('/:id', hasRole(['ADMIN']), partnerController.delete)

export default router
