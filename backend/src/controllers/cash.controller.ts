import { Request, Response, NextFunction } from 'express'
import { cashService } from '../services/cash.service'
import { parsePageLimit } from '../utils/pagination'

export const cashController = {
  async listMovements(req: Request, res: Response, next: NextFunction) {
    try { res.json(await cashService.findMovements({ ...req.query, ...parsePageLimit(req.query) } as any)) } catch (err) { next(err) }
  },

  async createMovement(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await cashService.createMovement(req.body)) } catch (err) { next(err) }
  },

  async updateMovement(req: Request, res: Response, next: NextFunction) {
    try { res.json(await cashService.updateMovement(req.params.id as string, req.body)) } catch (err) { next(err) }
  },

  async deleteMovement(req: Request, res: Response, next: NextFunction) {
    try { await cashService.deleteMovement(req.params.id as string); res.json({ message: 'Movimento eliminato' }) } catch (err) { next(err) }
  },

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try { res.json(await cashService.getSummary(req.query as any)) } catch (err) { next(err) }
  },

  async getAccounts(req: Request, res: Response, next: NextFunction) {
    try { res.json(await cashService.getAccounts()) } catch (err) { next(err) }
  },

  async createAccount(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await cashService.createAccount(req.body)) } catch (err) { next(err) }
  },
}
