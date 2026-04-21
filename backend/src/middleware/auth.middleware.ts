import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'

declare module 'express-session' {
  interface SessionData {
    userId: string
    userRole: string
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        firstName: string
        lastName: string
        role: string
      }
    }
  }
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: 'Non autenticato' })
    return
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    })

    if (!user || !user.isActive) {
      req.session.destroy(() => {})
      res.status(401).json({ error: 'Utente non trovato o disattivato' })
      return
    }

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}
