import { Router } from 'express'
import { taskController } from '../controllers/task.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../validators/task.validator'

const router = Router()

router.use(isAuthenticated)

router.get('/', taskController.list)
router.post('/', validate(createTaskSchema), taskController.create)
router.put('/:id', validate(updateTaskSchema), taskController.update)
router.patch('/:id/status', validate(updateTaskStatusSchema), taskController.updateStatus)
router.delete('/:id', taskController.delete)

export default router
