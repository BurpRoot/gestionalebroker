import { prisma } from '../config/database'
import { buildSkip, buildPaginationMeta } from '../utils/pagination'

export const collaboratorService = {
  async findAll(params: { page: number; limit: number; search?: string; isActive?: boolean }) {
    const { page, limit, search, isActive } = params
    const skip = buildSkip(page, limit)

    const where: any = {}
    if (isActive !== undefined) where.isActive = isActive
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { fiscalCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.collaborator.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: { _count: { select: { cases: true } } },
      }),
      prisma.collaborator.count({ where }),
    ])

    return { items, meta: buildPaginationMeta(total, page, limit) }
  },

  async findById(id: string) {
    return prisma.collaborator.findUnique({
      where: { id },
      include: {
        commissionRules: { include: { partner: true } },
        _count: { select: { cases: true } },
      },
    })
  },

  async create(data: any) {
    return prisma.collaborator.create({ data })
  },

  async update(id: string, data: any) {
    return prisma.collaborator.update({ where: { id }, data })
  },

  async softDelete(id: string) {
    return prisma.collaborator.update({ where: { id }, data: { isActive: false } })
  },

  async upsertCommissionRule(collaboratorId: string, partnerId: string, data: any) {
    return prisma.collaboratorPartnerCommission.upsert({
      where: {
        collaboratorId_partnerId_productLine: {
          collaboratorId,
          partnerId,
          productLine: data.productLine || null,
        },
      },
      update: data,
      create: { collaboratorId, partnerId, ...data },
    })
  },
}
