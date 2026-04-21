import { CaseStatus } from '@prisma/client'
import { prisma } from '../config/database'
import { buildSkip, buildPaginationMeta } from '../utils/pagination'
import { generateCaseNumber } from '../utils/case-number'

const VALID_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  BOZZA: ['IN_LAVORAZIONE', 'ANNULLATA'],
  IN_LAVORAZIONE: ['IN_ATTESA_DOCUMENTI', 'IN_ATTESA_COMPAGNIA', 'EMESSA', 'ANNULLATA'],
  IN_ATTESA_DOCUMENTI: ['IN_LAVORAZIONE', 'IN_ATTESA_COMPAGNIA', 'EMESSA', 'ANNULLATA'],
  IN_ATTESA_COMPAGNIA: ['EMESSA', 'ANNULLATA'],
  EMESSA: ['PAGATA', 'ANNULLATA'],
  PAGATA: ['RINNOVATA', 'ANNULLATA'],
  RINNOVATA: ['PAGATA'],
  ANNULLATA: [],
}

export const caseService = {
  async findAll(params: {
    page: number
    limit: number
    search?: string
    status?: string
    partnerId?: string
    collaboratorId?: string
    caseType?: string
    customerId?: string
    vehicleId?: string
    dateFrom?: Date
    dateTo?: Date
    expiringDays?: number
  }) {
    const { page, limit, search, status, partnerId, collaboratorId, caseType, customerId, vehicleId, dateFrom, dateTo, expiringDays } = params
    const skip = buildSkip(page, limit)

    const where: any = {}
    if (status) where.status = status
    if (partnerId) where.partnerId = partnerId
    if (collaboratorId) where.collaboratorId = collaboratorId
    if (caseType) where.caseType = caseType
    if (customerId) where.customerId = customerId
    if (vehicleId) where.vehicleId = vehicleId
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = dateFrom
      if (dateTo) where.createdAt.lte = dateTo
    }
    if (expiringDays) {
      const limit = new Date()
      limit.setDate(limit.getDate() + expiringDays)
      where.expiryDate = { lte: limit, gte: new Date() }
    }
    if (search) {
      where.OR = [
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { vehicle: { licensePlate: { contains: search.toUpperCase() } } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.insuranceCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, companyName: true } },
          vehicle: { select: { id: true, licensePlate: true, brand: true, model: true } },
          partner: { select: { id: true, name: true } },
          collaborator: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.insuranceCase.count({ where }),
    ])

    return { items, meta: buildPaginationMeta(total, page, limit) }
  },

  async findById(id: string) {
    return prisma.insuranceCase.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        partner: true,
        collaborator: true,
        policy: true,
        cashMovements: { orderBy: { movementDate: 'desc' }, include: { cashAccount: true } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        events: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        tasks: { where: { status: { not: 'ANNULLATO' } }, orderBy: { dueDate: 'asc' } },
      },
    })
  },

  async create(data: any, userId: string) {
    const caseNumber = await generateCaseNumber()
    const created = await prisma.insuranceCase.create({
      data: { ...data, caseNumber },
    })

    await prisma.caseEvent.create({
      data: {
        caseId: created.id,
        eventType: 'STATUS_CHANGE',
        description: 'Pratica creata',
        metadata: { newStatus: 'BOZZA' },
        userId,
      },
    })

    return created
  },

  async update(id: string, data: any) {
    return prisma.insuranceCase.update({ where: { id }, data })
  },

  async updateStatus(id: string, newStatus: CaseStatus, note: string | undefined, userId: string) {
    const existing = await prisma.insuranceCase.findUnique({ where: { id } })
    if (!existing) throw new Error('Pratica non trovata')

    const allowed = VALID_TRANSITIONS[existing.status] || []
    if (!allowed.includes(newStatus)) {
      throw new Error(`Transizione non valida da ${existing.status} a ${newStatus}`)
    }

    const [updated] = await prisma.$transaction([
      prisma.insuranceCase.update({ where: { id }, data: { status: newStatus } }),
      prisma.caseEvent.create({
        data: {
          caseId: id,
          eventType: 'STATUS_CHANGE',
          description: note || `Stato cambiato da ${existing.status} a ${newStatus}`,
          metadata: { oldStatus: existing.status, newStatus },
          userId,
        },
      }),
    ])

    return updated
  },

  async addNote(id: string, note: string, userId: string) {
    return prisma.caseEvent.create({
      data: {
        caseId: id,
        eventType: 'NOTE_ADDED',
        description: note,
        userId,
      },
    })
  },

  async getEvents(id: string) {
    return prisma.caseEvent.findMany({
      where: { caseId: id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    })
  },
}
