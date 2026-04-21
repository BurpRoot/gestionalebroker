import { prisma } from '../config/database'
import { buildSkip, buildPaginationMeta } from '../utils/pagination'

export const cashService = {
  async findMovements(params: {
    page: number
    limit: number
    type?: string
    category?: string
    cashAccountId?: string
    caseId?: string
    isReconciled?: boolean
    dateFrom?: Date
    dateTo?: Date
  }) {
    const { page, limit, ...filters } = params
    const skip = buildSkip(page, limit)

    const where: any = {}
    if (filters.type) where.type = filters.type
    if (filters.category) where.category = filters.category
    if (filters.cashAccountId) where.cashAccountId = filters.cashAccountId
    if (filters.caseId) where.caseId = filters.caseId
    if (filters.isReconciled !== undefined) where.isReconciled = filters.isReconciled
    if (filters.dateFrom || filters.dateTo) {
      where.movementDate = {}
      if (filters.dateFrom) where.movementDate.gte = filters.dateFrom
      if (filters.dateTo) where.movementDate.lte = filters.dateTo
    }

    const [items, total] = await Promise.all([
      prisma.cashMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { movementDate: 'desc' },
        include: {
          cashAccount: { select: { id: true, name: true } },
          case: { select: { id: true, caseNumber: true } },
        },
      }),
      prisma.cashMovement.count({ where }),
    ])

    return { items, meta: buildPaginationMeta(total, page, limit) }
  },

  async getSummary(params: { dateFrom?: Date; dateTo?: Date; cashAccountId?: string }) {
    const where: any = {}
    if (params.cashAccountId) where.cashAccountId = params.cashAccountId
    if (params.dateFrom || params.dateTo) {
      where.movementDate = {}
      if (params.dateFrom) where.movementDate.gte = params.dateFrom
      if (params.dateTo) where.movementDate.lte = params.dateTo
    }

    const [entrate, uscite] = await Promise.all([
      prisma.cashMovement.aggregate({
        where: { ...where, type: 'ENTRATA' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.cashMovement.aggregate({
        where: { ...where, type: 'USCITA' },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    const totEntrate = Number(entrate._sum.amount || 0)
    const totUscite = Number(uscite._sum.amount || 0)

    return {
      entrate: totEntrate,
      uscite: totUscite,
      margine: totEntrate - totUscite,
      countEntrate: entrate._count,
      countUscite: uscite._count,
    }
  },

  async createMovement(data: any) {
    return prisma.cashMovement.create({
      data,
      include: { cashAccount: true, case: { select: { caseNumber: true } } },
    })
  },

  async updateMovement(id: string, data: any) {
    return prisma.cashMovement.update({ where: { id }, data })
  },

  async deleteMovement(id: string) {
    return prisma.cashMovement.delete({ where: { id } })
  },

  async getAccounts() {
    return prisma.cashAccount.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  },

  async createAccount(data: any) {
    return prisma.cashAccount.create({ data })
  },
}
