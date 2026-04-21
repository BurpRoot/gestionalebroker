import { Router } from 'express'
import { collaboratorController } from '../controllers/collaborator.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { createCollaboratorSchema, updateCollaboratorSchema } from '../validators/collaborator.validator'

const router = Router()

router.use(isAuthenticated)

router.get('/', collaboratorController.list)
router.post('/', validate(createCollaboratorSchema), collaboratorController.create)
router.get('/:id', collaboratorController.getById)
router.put('/:id', validate(updateCollaboratorSchema), collaboratorController.update)
router.delete('/:id', collaboratorController.delete)
router.post('/:id/commission-rules', collaboratorController.upsertCommissionRule)

export default router
