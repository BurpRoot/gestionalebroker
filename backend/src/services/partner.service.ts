import { prisma } from '../config/database'
import { buildSkip, buildPaginationMeta } from '../utils/pagination'

export const partnerService = {
  async findAll(params: { page: number; limit: number; search?: string; isActive?: boolean }) {
    const { page, limit, search, isActive } = params
    const skip = buildSkip(page, limit)

    const where: any = {}
    if (isActive !== undefined) where.isActive = isActive
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { cases: true } } },
      }),
      prisma.partner.count({ where }),
    ])

    return { items, meta: buildPaginationMeta(total, page, limit) }
  },

  async findById(id: string) {
    return prisma.partner.findUnique({
      where: { id },
      include: {
        commissionRules: { include: { collaborator: true } },
        _count: { select: { cases: true } },
      },
    })
  },

  async create(data: any) {
    return prisma.partner.create({ data })
  },

  async update(id: string, data: any) {
    return prisma.partner.update({ where: { id }, data })
  },

  async softDelete(id: string) {
    return prisma.partner.update({ where: { id }, data: { isActive: false } })
  },
}
