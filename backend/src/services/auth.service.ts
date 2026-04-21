import bcrypt from 'bcrypt'
import { prisma } from '../config/database'

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) return null

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return null

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }
  },

  async me(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, lastLoginAt: true },
    })
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('Utente non trovato')

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new Error('Password attuale non corretta')

    const hash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } })
  },
}
