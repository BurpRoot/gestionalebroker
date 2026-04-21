import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validate =
  (schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      res.status(422).json({
        error: 'Dati non validi',
        details: result.error.flatten().fieldErrors,
      })
      return
    }
    req[target] = result.data
    next()
  }
