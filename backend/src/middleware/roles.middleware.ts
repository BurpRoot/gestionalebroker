import { Request, Response, NextFunction } from 'express'

export const hasRole =
  (roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Permessi insufficienti' })
      return
    }
    next()
  }
