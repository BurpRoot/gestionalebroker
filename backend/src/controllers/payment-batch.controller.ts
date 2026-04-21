import { Request, Response, NextFunction } from 'express'
import { paymentBatchService } from '../services/payment-batch.service'

export const paymentBatchController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try { res.json(await paymentBatchService.findAll(req.query as any)) } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await paymentBatchService.findById(req.params.id as string)
      if (!item) { res.status(404).json({ error: 'Batch non trovato' }); return }
      res.json(item)
    } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await paymentBatchService.create(req.body)) } catch (err) { next(err) }
  },

  async addItem(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await paymentBatchService.addItem(req.params.id as string, req.body)) } catch (err) { next(err) }
  },

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try { await paymentBatchService.removeItem(req.params.itemId as string); res.json({ message: 'Item rimosso' }) } catch (err) { next(err) }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try { res.json(await paymentBatchService.updateStatus(req.params.id as string, req.body.status)) } catch (err) { next(err) }
  },
}
