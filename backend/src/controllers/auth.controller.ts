import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'
import { prisma } from '../config/database'

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body
      const user = await authService.login(email, password)

      if (!user) {
        res.status(401).json({ error: 'Credenziali non valide' })
        return
      }

      req.session.userId = user.id
      req.session.userRole = user.role

      await new Promise<void>((resolve, reject) =>
        req.session.save((err) => (err ? reject(err) : resolve()))
      )
      console.log('[LOGIN] session saved | sessionID:', req.sessionID, '| userId:', req.session.userId)

      await prisma.auditLog.create({
        data: { action: 'LOGIN', entity: 'users', entityId: user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] },
      })

      res.on('finish', () => {
        console.log('[LOGIN] Set-Cookie sent:', res.getHeader('Set-Cookie'))
      })
      res.json({ user })
    } catch (err) {
      next(err)
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.session.userId
      req.session.destroy((err) => {
        if (err) { next(err); return }
        res.clearCookie('gb.sid')

        if (userId) {
          prisma.auditLog.create({
            data: { action: 'LOGOUT', entity: 'users', entityId: userId, ipAddress: req.ip },
          }).catch(() => {})
        }

        res.json({ message: 'Logout effettuato' })
      })
    } catch (err) {
      next(err)
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.session.userId!)
      if (!user) { res.status(404).json({ error: 'Utente non trovato' }); return }
      res.json({ user })
    } catch (err) {
      next(err)
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body
      await authService.changePassword(req.user!.id, currentPassword, newPassword)
      res.json({ message: 'Password aggiornata' })
    } catch (err: any) {
      if (err.message === 'Password attuale non corretta') {
        res.status(400).json({ error: err.message }); return
      }
      next(err)
    }
  },
}
