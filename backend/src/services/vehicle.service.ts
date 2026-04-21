import { prisma } from '../config/database'
import { buildSkip, buildPaginationMeta } from '../utils/pagination'

export const vehicleService = {
  async findAll(params: { page: number; limit: number; search?: string; customerId?: string; isActive?: boolean }) {
    const { page, limit, search, customerId, isActive } = params
    const skip = buildSkip(page, limit)

    const where: any = {}
    if (customerId) where.customerId = customerId
    if (isActive !== undefined) where.isActive = isActive
    if (search) {
      where.OR = [
        { licensePlate: { contains: search.toUpperCase() } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { licensePlate: 'asc' },
        include: { customer: { select: { id: true, firstName: true, lastName: true, companyName: true } } },
      }),
      prisma.vehicle.count({ where }),
    ])

    return { items, meta: buildPaginationMeta(total, page, limit) }
  },

  async findById(id: string) {
    return prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: true,
        cases: { orderBy: { createdAt: 'desc' }, take: 10, include: { partner: true } },
      },
    })
  },

  async findByPlate(plate: string) {
    return prisma.vehicle.findUnique({ where: { licensePlate: plate.toUpperCase().replace(/\s/g, '') } })
  },

  async create(data: any) {
    return prisma.vehicle.create({ data })
  },

  async update(id: string, data: any) {
    return prisma.vehicle.update({ where: { id }, data })
  },

  async softDelete(id: string) {
    return prisma.vehicle.update({ where: { id }, data: { isActive: false } })
  },
}
