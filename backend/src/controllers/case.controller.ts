import { Request, Response, NextFunction } from 'express'
import { CaseStatus } from '@prisma/client'
import { caseService } from '../services/case.service'

export const caseController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try { res.json(await caseService.findAll(req.query as any)) } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await caseService.findById(req.params.id as string)
      if (!item) { res.status(404).json({ error: 'Pratica non trovata' }); return }
      res.json(item)
    } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await caseService.create(req.body, req.user!.id)
      res.status(201).json(item)
    } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await caseService.update(req.params.id as string, req.body)) } catch (err) { next(err) }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, note } = req.body
      const updated = await caseService.updateStatus(req.params.id as string, status as CaseStatus, note, req.user!.id)
      res.json(updated)
    } catch (err: any) {
      if (err.message?.includes('Transizione non valida')) {
        res.status(400).json({ error: err.message }); return
      }
      next(err)
    }
  },

  async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await caseService.addNote(req.params.id as string, req.body.note, req.user!.id)
      res.status(201).json(event)
    } catch (err) { next(err) }
  },

  async getEvents(req: Request, res: Response, next: NextFunction) {
    try { res.json(await caseService.getEvents(req.params.id as string)) } catch (err) { next(err) }
  },
}
