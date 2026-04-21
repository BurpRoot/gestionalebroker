import { Router, Request, Response, NextFunction } from 'express'
import { isAuthenticated } from '../middleware/auth.middleware'
import { prisma } from '../config/database'

const router = Router()

router.use(isAuthenticated)

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = Number(req.query.days) || 30
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + days)

    const [expiringCases, overdueTasks] = await Promise.all([
      prisma.insuranceCase.findMany({
        where: {
          expiryDate: { gte: new Date(), lte: cutoff },
          status: { notIn: ['ANNULLATA', 'RINNOVATA'] },
        },
        orderBy: { expiryDate: 'asc' },
        take: 100,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, companyName: true } },
          vehicle: { select: { id: true, licensePlate: true } },
          collaborator: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.task.findMany({
        where: {
          dueDate: { lt: new Date() },
          status: { in: ['APERTO', 'IN_CORSO'] },
        },
        orderBy: { dueDate: 'asc' },
        take: 50,
        include: {
          case: { select: { id: true, caseNumber: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ])

    res.json({ expiringCases, overdueTasks })
  } catch (err) {
    next(err)
  }
})

export default router
