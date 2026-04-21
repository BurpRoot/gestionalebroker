import { Request, Response, NextFunction } from 'express'
import { vehicleService } from '../services/vehicle.service'

export const vehicleController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await vehicleService.findAll(req.query as any)
      res.json(result)
    } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await vehicleService.findById(req.params.id as string)
      if (!item) { res.status(404).json({ error: 'Veicolo non trovato' }); return }
      res.json(item)
    } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await vehicleService.create(req.body)
      res.status(201).json(item)
    } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await vehicleService.update(req.params.id as string, req.body)
      res.json(item)
    } catch (err) { next(err) }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await vehicleService.softDelete(req.params.id as string)
      res.json({ message: 'Veicolo disattivato' })
    } catch (err) { next(err) }
  },
}
