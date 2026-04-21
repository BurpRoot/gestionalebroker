import { Router } from 'express'
import { caseController } from '../controllers/case.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { hasRole } from '../middleware/roles.middleware'
import { validate } from '../middleware/validate.middleware'
import { createCaseSchema, updateCaseSchema, updateCaseStatusSchema } from '../validators/case.validator'
import { z } from 'zod'

const router = Router()

router.use(isAuthenticated)

router.get('/', caseController.list)
router.post('/', validate(createCaseSchema), caseController.create)
router.get('/:id', caseController.getById)
router.put('/:id', validate(updateCaseSchema), caseController.update)
router.patch('/:id/status', validate(updateCaseStatusSchema), caseController.updateStatus)
router.post('/:id/notes', validate(z.object({ note: z.string().min(1) })), caseController.addNote)
router.get('/:id/events', caseController.getEvents)

export default router
