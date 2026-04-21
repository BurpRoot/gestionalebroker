import { prisma } from '../config/database'
import { buildSkip, buildPaginationMeta } from '../utils/pagination'
import { generateBatchNumber } from '../utils/batch-number'

export const paymentBatchService = {
  async findAll(params: { page: number; limit: number; partnerId?: string; status?: string }) {
    const { page, limit, partnerId, status } = params
    const skip = buildSkip(page, limit)

    const where: any = {}
    if (partnerId) where.partnerId = partnerId
    if (status) where.status = status

    const [items, total] = await Promise.all([
      prisma.paymentBatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          partner: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.paymentBatch.count({ where }),
    ])

    return { items, meta: buildPaginationMeta(total, page, limit) }
  },

  async findById(id: string) {
    return prisma.paymentBatch.findUnique({
      where: { id },
      include: {
        partner: true,
        items: {
          include: {
            collaborator: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    })
  },

  async create(data: any) {
    const batchNumber = await generateBatchNumber()
    return prisma.paymentBatch.create({
      data: { ...data, batchNumber },
      include: { partner: true },
    })
  },

  async addItem(batchId: string, data: any) {
    const item = await prisma.paymentBatchItem.create({
      data: { ...data, batchId },
    })

    const agg = await prisma.paymentBatchItem.aggregate({
      where: { batchId },
      _sum: { amount: true },
    })

    await prisma.paymentBatch.update({
      where: { id: batchId },
      data: { totalAmount: agg._sum.amount || 0 },
    })

    return item
  },

  async removeItem(itemId: string) {
    const item = await prisma.paymentBatchItem.findUnique({ where: { id: itemId } })
    if (!item) throw new Error('Item non trovato')

    await prisma.paymentBatchItem.delete({ where: { id: itemId } })

    const agg = await prisma.paymentBatchItem.aggregate({
      where: { batchId: item.batchId },
      _sum: { amount: true },
    })

    await prisma.paymentBatch.update({
      where: { id: item.batchId },
      data: { totalAmount: agg._sum.amount || 0 },
    })
  },

  async updateStatus(id: string, status: string) {
    const data: any = { status }
    if (status === 'INVIATA') data.sentAt = new Date()
    if (status === 'CONFERMATA') data.confirmedAt = new Date()
    return prisma.paymentBatch.update({ where: { id }, data })
  },
}
