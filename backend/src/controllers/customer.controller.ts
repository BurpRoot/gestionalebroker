import { Request, Response, NextFunction } from 'express'
import { customerService } from '../services/customer.service'
import { parsePageLimit } from '../utils/pagination'

export const customerController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await customerService.findAll({ ...req.query, ...parsePageLimit(req.query) } as any)
      res.json(result)
    } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await customerService.findById(req.params.id as string)
      if (!item) { res.status(404).json({ error: 'Cliente non trovato' }); return }
      res.json(item)
    } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await customerService.create(req.body)
      res.status(201).json(item)
    } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await customerService.update(req.params.id as string, req.body)
      res.json(item)
    } catch (err) { next(err) }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await customerService.delete(req.params.id as string)
      res.json({ message: 'Cliente eliminato' })
    } catch (err: any) {
      if (err.statusCode === 400) { res.status(400).json({ error: err.message }); return }
      next(err)
    }
  },

  async getCases(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const result = await customerService.getCases(req.params.id as string, page, limit)
      res.json(result)
    } catch (err) { next(err) }
  },
}
