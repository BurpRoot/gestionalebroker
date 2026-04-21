import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('❌ Error:', err.message)

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: 'Conflitto: record già esistente',
        field: (err.meta?.target as string[])?.join(', '),
      })
      return
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Record non trovato' })
      return
    }
    if (err.code === 'P2003') {
      res.status(400).json({ error: 'Riferimento a record non esistente' })
      return
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ error: 'Dati non validi per il database' })
    return
  }

  if (err.message?.includes('Tipo file non consentito') || err.message?.includes('Solo file Excel')) {
    res.status(400).json({ error: err.message })
    return
  }

  res.status(500).json({
    error: 'Errore interno del server',
    ...(process.env.NODE_ENV === 'development' && { message: err.message }),
  })
}
