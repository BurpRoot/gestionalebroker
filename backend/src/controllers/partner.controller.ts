import { Request, Response, NextFunction } from 'express'
import { partnerService } from '../services/partner.service'
import { parsePageLimit } from '../utils/pagination'

export const partnerController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try { res.json(await partnerService.findAll({ ...req.query, ...parsePageLimit(req.query) } as any)) } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await partnerService.findById(req.params.id as string)
      if (!item) { res.status(404).json({ error: 'Partner non trovato' }); return }
      res.json(item)
    } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await partnerService.create(req.body)) } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await partnerService.update(req.params.id as string, req.body)) } catch (err) { next(err) }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try { await partnerService.softDelete(req.params.id as string); res.json({ message: 'Partner disattivato' }) } catch (err) { next(err) }
  },
}
