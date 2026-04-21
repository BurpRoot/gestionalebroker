import { prisma } from '../config/database'
import { buildSkip, buildPaginationMeta } from '../utils/pagination'

export const taskService = {
  async findAll(params: {
    page: number
    limit: number
    status?: string
    priority?: string
    assigneeId?: string
    caseId?: string
    overdue?: boolean
  }) {
    const { page, limit, ...filters } = params
    const skip = buildSkip(page, limit)

    const where: any = {}
    if (filters.status) where.status = filters.status
    if (filters.priority) where.priority = filters.priority
    if (filters.assigneeId) where.assigneeId = filters.assigneeId
    if (filters.caseId) where.caseId = filters.caseId
    if (filters.overdue) {
      where.dueDate = { lt: new Date() }
      where.status = { notIn: ['COMPLETATO', 'ANNULLATO'] }
    }

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        include: {
          case: { select: { id: true, caseNumber: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.task.count({ where }),
    ])

    return { items, meta: buildPaginationMeta(total, page, limit) }
  },

  async create(data: any, creatorId: string) {
    return prisma.task.create({
      data: { ...data, creatorId },
      include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
    })
  },

  async update(id: string, data: any) {
    return prisma.task.update({ where: { id }, data })
  },

  async updateStatus(id: string, status: string, userId: string) {
    const data: any = { status }
    if (status === 'COMPLETATO') data.completedAt = new Date()
    return prisma.task.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.task.delete({ where: { id } })
  },
}
