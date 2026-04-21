import { Router } from 'express'
import { vehicleController } from '../controllers/vehicle.controller'
import { isAuthenticated } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicle.validator'

const router = Router()

router.use(isAuthenticated)

router.get('/', vehicleController.list)
router.post('/', validate(createVehicleSchema), vehicleController.create)
router.get('/:id', vehicleController.getById)
router.put('/:id', validate(updateVehicleSchema), vehicleController.update)
router.delete('/:id', vehicleController.delete)

export default router
