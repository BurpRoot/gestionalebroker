import { z } from 'zod'

export const createBatchSchema = z.object({
  partnerId: z.string().cuid(),
  description: z.string().optional(),
  notes: z.string().optional(),
})

export const createBatchItemSchema = z.object({
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
  collaboratorId: z.string().cuid().optional(),
})

export const updateBatchStatusSchema = z.object({
  status: z.enum(['BOZZA', 'INVIATA', 'CONFERMATA', 'PARZIALE']),
})
