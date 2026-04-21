import { Request, Response, NextFunction } from 'express'
import { userService } from '../services/user.service'

export const userController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      res.json(await userService.findAll({ page, limit }))
    } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id as string)
      if (!user) { res.status(404).json({ error: 'Utente non trovato' }); return }
      res.json(user)
    } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await userService.create(req.body)) } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await userService.update(req.params.id as string, req.body)) } catch (err) { next(err) }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.resetPassword(req.params.id as string, req.body.newPassword)
      res.json({ message: 'Password resettata' })
    } catch (err) { next(err) }
  },
}
