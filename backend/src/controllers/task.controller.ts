import { Request, Response, NextFunction } from 'express'
import { taskService } from '../services/task.service'
import { parsePageLimit } from '../utils/pagination'

export const taskController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try { res.json(await taskService.findAll({ ...req.query, ...parsePageLimit(req.query) } as any)) } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await taskService.create(req.body, req.user!.id)) } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await taskService.update(req.params.id as string, req.body)) } catch (err) { next(err) }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try { res.json(await taskService.updateStatus(req.params.id as string, req.body.status, req.user!.id)) } catch (err) { next(err) }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try { await taskService.delete(req.params.id as string); res.json({ message: 'Task eliminato' }) } catch (err) { next(err) }
  },
}
