import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { documentService } from '../services/document.service'

export const documentController = {
  async getByCaseId(req: Request, res: Response, next: NextFunction) {
    try { res.json(await documentService.findByCaseId(req.params.caseId as string)) } catch (err) { next(err) }
  },

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) { res.status(400).json({ error: 'Nessun file caricato' }); return }

      const doc = await documentService.create({
        caseId: req.body.caseId,
        fileName: req.file.originalname,
        storedPath: req.file.path,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        documentType: req.body.documentType || 'ALTRO',
        description: req.body.description,
      })

      res.status(201).json(doc)
    } catch (err) { next(err) }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.findById(req.params.id as string)
      if (!doc) { res.status(404).json({ error: 'Documento non trovato' }); return }

      const absPath = documentService.getAbsolutePath(doc.storedPath)
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.fileName)}"`)
      res.setHeader('Content-Type', doc.mimeType)
      res.sendFile(absPath)
    } catch (err) { next(err) }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await documentService.delete(req.params.id as string)
      res.json({ message: 'Documento eliminato' })
    } catch (err) { next(err) }
  },
}
