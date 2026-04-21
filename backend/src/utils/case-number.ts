import { prisma } from '../config/database'

export async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `${year}-`

  const last = await prisma.insuranceCase.findFirst({
    where: { caseNumber: { startsWith: prefix } },
    orderBy: { caseNumber: 'desc' },
  })

  let seq = 1
  if (last) {
    const parts = last.caseNumber.split('-')
    seq = parseInt(parts[1] || '0', 10) + 1
  }

  return `${prefix}${String(seq).padStart(6, '0')}`
}
