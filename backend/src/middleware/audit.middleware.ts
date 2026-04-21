import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'

export const auditAction =
  (action: string, entity: string) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const originalEnd = res.end.bind(res)

    res.end = function (chunk?: any, ...args: any[]) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId: string | undefined =
          (req.params?.id as string | undefined) ||
          (res.locals?.createdId as string | undefined) ||
          undefined

        prisma.auditLog
          .create({
            data: {
              action,
              entity,
              entityId,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              userId: req.user?.id,
            },
          })
          .catch((err) => console.error('Audit log error:', err))
      }
      return originalEnd(chunk, ...args)
    }

    next()
  }
