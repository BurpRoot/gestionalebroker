import { Request, Response, NextFunction } from 'express'
import { collaboratorService } from '../services/collaborator.service'
import { parsePageLimit } from '../utils/pagination'

export const collaboratorController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try { res.json(await collaboratorService.findAll({ ...req.query, ...parsePageLimit(req.query) } as any)) } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await collaboratorService.findById(req.params.id as string)
      if (!item) { res.status(404).json({ error: 'Collaboratore non trovato' }); return }
      res.json(item)
    } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await collaboratorService.create(req.body)) } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await collaboratorService.update(req.params.id as string, req.body)) } catch (err) { next(err) }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try { await collaboratorService.softDelete(req.params.id as string); res.json({ message: 'Collaboratore disattivato' }) } catch (err) { next(err) }
  },

  async upsertCommissionRule(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await collaboratorService.upsertCommissionRule(req.params.id as string, req.body.partnerId, req.body)
      res.json(rule)
    } catch (err) { next(err) }
  },
}
