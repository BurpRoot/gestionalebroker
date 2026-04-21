import { Request, Response, NextFunction } from 'express'
import { importService } from '../services/import.service'

export const importController = {
  async preview(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) { res.status(400).json({ error: 'Nessun file caricato' }); return }
      const result = await importService.preview(req.file.buffer, req.file.originalname)
      res.json(result)
    } catch (err) { next(err) }
  },

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { importSessionId } = req.body
      if (!importSessionId) { res.status(400).json({ error: 'importSessionId obbligatorio' }); return }
      const result = await importService.confirm(importSessionId, req.user!.id)
      res.json(result)
    } catch (err: any) {
      if (err.message?.includes('scaduta')) { res.status(410).json({ error: err.message }); return }
      next(err)
    }
  },
}
