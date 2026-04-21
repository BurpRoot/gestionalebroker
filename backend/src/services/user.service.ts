import bcrypt from 'bcrypt'
import { UserRole } from '@prisma/client'
import { prisma } from '../config/database'
import { buildSkip, buildPaginationMeta } from '../utils/pagination'

export const userService = {
  async findAll(params: { page: number; limit: number }) {
    const { page, limit } = params
    const skip = buildSkip(page, limit)
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { lastName: 'asc' },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
      }),
      prisma.user.count(),
    ])
    return { items, meta: buildPaginationMeta(total, page, limit) }
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
    })
  },

  async create(data: { email: string; password: string; firstName: string; lastName: string; role: UserRole }) {
    const passwordHash = await bcrypt.hash(data.password, 12)
    return prisma.user.create({
      data: { ...data, passwordHash, password: undefined } as any,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    })
  },

  async update(id: string, data: Partial<{ email: string; firstName: string; lastName: string; role: UserRole; isActive: boolean }>) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    })
  },

  async resetPassword(id: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 12)
    return prisma.user.update({ where: { id }, data: { passwordHash } })
  },
}
