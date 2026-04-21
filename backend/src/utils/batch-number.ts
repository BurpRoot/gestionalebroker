import { prisma } from '../config/database'

export async function generateBatchNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `BATCH-${year}-`

  const last = await prisma.paymentBatch.findFirst({
    where: { batchNumber: { startsWith: prefix } },
    orderBy: { batchNumber: 'desc' },
  })

  let seq = 1
  if (last) {
    const parts = last.batchNumber.split('-')
    seq = parseInt(parts[2] || '0', 10) + 1
  }

  return `${prefix}${String(seq).padStart(4, '0')}`
}
