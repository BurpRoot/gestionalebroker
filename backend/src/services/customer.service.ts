import { prisma } from '../config/database'
import { buildSkip, buildPaginationMeta } from '../utils/pagination'

export const customerService = {
  async findAll(params: {
    page: number
    limit: number
    search?: string
    city?: string
    isActive?: boolean
  }) {
    const { page, limit, search, city, isActive } = params
    const skip = buildSkip(page, limit)

    const where: any = {}
    if (isActive !== undefined) where.isActive = isActive
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { fiscalCode: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: { _count: { select: { cases: true, vehicles: true } } },
      }),
      prisma.customer.count({ where }),
    ])

    return { items, meta: buildPaginationMeta(total, page, limit) }
  },

  async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: { where: { isActive: true } },
        cases: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { partner: true, collaborator: true },
        },
      },
    })
  },

  async create(data: any) {
    return prisma.customer.create({ data })
  },

  async update(id: string, data: any) {
    return prisma.customer.update({ where: { id }, data })
  },

  async delete(id: string) {
    const caseCount = await prisma.insuranceCase.count({ where: { customerId: id } })
    if (caseCount > 0) {
      const err: any = new Error('Impossibile eliminare: il cliente ha pratiche associate')
      err.statusCode = 400
      throw err
    }
    await prisma.vehicle.deleteMany({ where: { customerId: id } })
    return prisma.customer.delete({ where: { id } })
  },

  async getCases(id: string, page: number, limit: number) {
    const skip = buildSkip(page, limit)
    const [items, total] = await Promise.all([
      prisma.insuranceCase.findMany({
        where: { customerId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: true, partner: true, collaborator: true },
      }),
      prisma.insuranceCase.count({ where: { customerId: id } }),
    ])
    return { items, meta: buildPaginationMeta(total, page, limit) }
  },
}
