import { prisma } from '../config/database'
import { startOfMonth, endOfMonth, startOfYear, subMonths } from 'date-fns'

export const dashboardService = {
  async getKpis() {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const yearStart = startOfYear(now)

    const [
      totalCases,
      openCases,
      anomalyCases,
      monthCases,
      expiringWeek,
      openTasks,
      entrateMonth,
      usciteMonth,
      entrateYear,
      usciteYear,
    ] = await Promise.all([
      prisma.insuranceCase.count(),
      prisma.insuranceCase.count({ where: { status: { notIn: ['ANNULLATA', 'PAGATA', 'RINNOVATA'] } } }),
      prisma.insuranceCase.count({ where: { status: 'IN_ATTESA_DOCUMENTI' } }),
      prisma.insuranceCase.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
      prisma.insuranceCase.count({
        where: {
          expiryDate: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 3600 * 1000) },
          status: { notIn: ['ANNULLATA', 'RINNOVATA'] },
        },
      }),
      prisma.task.count({ where: { status: { in: ['APERTO', 'IN_CORSO'] } } }),
      prisma.cashMovement.aggregate({
        where: { type: 'ENTRATA', movementDate: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      prisma.cashMovement.aggregate({
        where: { type: 'USCITA', movementDate: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      prisma.cashMovement.aggregate({
        where: { type: 'ENTRATA', movementDate: { gte: yearStart } },
        _sum: { amount: true },
      }),
      prisma.cashMovement.aggregate({
        where: { type: 'USCITA', movementDate: { gte: yearStart } },
        _sum: { amount: true },
      }),
    ])

    const entrateM = Number(entrateMonth._sum.amount || 0)
    const usciteM = Number(usciteMonth._sum.amount || 0)
    const entrateY = Number(entrateYear._sum.amount || 0)
    const usciteY = Number(usciteYear._sum.amount || 0)

    return {
      totalCases,
      openCases,
      anomalyCases,
      monthCases,
      expiringWeek,
      openTasks,
      entrateMonth: entrateM,
      usciteMonth: usciteM,
      margineMonth: entrateM - usciteM,
      entrateYear: entrateY,
      usciteYear: usciteY,
      margineYear: entrateY - usciteY,
    }
  },

  async getCasesByStatus() {
    const groups = await prisma.insuranceCase.groupBy({
      by: ['status'],
      _count: { id: true },
    })
    return groups.map((g) => ({ status: g.status, count: g._count.id }))
  },

  async getRevenueTrend() {
    const months = []
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(new Date(), i)
      months.push({ start: startOfMonth(d), end: endOfMonth(d), label: d.toISOString().slice(0, 7) })
    }

    const results = await Promise.all(
      months.map(async ({ start, end, label }) => {
        const [e, u] = await Promise.all([
          prisma.cashMovement.aggregate({
            where: { type: 'ENTRATA', movementDate: { gte: start, lte: end } },
            _sum: { amount: true },
          }),
          prisma.cashMovement.aggregate({
            where: { type: 'USCITA', movementDate: { gte: start, lte: end } },
            _sum: { amount: true },
          }),
        ])
        return {
          month: label,
          entrate: Number(e._sum.amount || 0),
          uscite: Number(u._sum.amount || 0),
          margine: Number(e._sum.amount || 0) - Number(u._sum.amount || 0),
        }
      }),
    )

    return results
  },

  async getTopPartners() {
    const groups = await prisma.insuranceCase.groupBy({
      by: ['partnerId'],
      _count: { id: true },
      where: { partnerId: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    })

    const withNames = await Promise.all(
      groups.map(async (g) => {
        const partner = g.partnerId
          ? await prisma.partner.findUnique({ where: { id: g.partnerId }, select: { name: true } })
          : null
        return { partnerId: g.partnerId, partnerName: partner?.name || '—', count: g._count.id }
      }),
    )

    return withNames
  },

  async getTopCollaborators() {
    const groups = await prisma.insuranceCase.groupBy({
      by: ['collaboratorId'],
      _count: { id: true },
      where: { collaboratorId: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    })

    const withNames = await Promise.all(
      groups.map(async (g) => {
        const c = g.collaboratorId
          ? await prisma.collaborator.findUnique({
              where: { id: g.collaboratorId },
              select: { firstName: true, lastName: true },
            })
          : null
        return {
          collaboratorId: g.collaboratorId,
          name: c ? `${c.firstName} ${c.lastName}` : '—',
          count: g._count.id,
        }
      }),
    )

    return withNames
  },
}
