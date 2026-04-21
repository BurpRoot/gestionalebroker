import { z } from 'zod'

export const createMovementSchema = z.object({
  type: z.enum(['ENTRATA', 'USCITA']),
  category: z
    .enum(['PREMIO_CLIENTE', 'RIMBORSO', 'PROVVIGIONE_COLLABORATORE', 'RIMESSA_COMPAGNIA', 'COSTO_OPERATIVO', 'ALTRO'])
    .default('ALTRO'),
  amount: z.coerce.number().positive(),
  description: z.string().min(1),
  movementDate: z.coerce.date().default(() => new Date()),
  valueDate: z.coerce.date().optional(),
  reference: z.string().optional(),
  caseId: z.string().cuid().optional(),
  cashAccountId: z.string().cuid(),
  notes: z.string().optional(),
})

export const updateMovementSchema = createMovementSchema.partial()

export const movementFiltersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
  type: z.enum(['ENTRATA', 'USCITA']).optional(),
  category: z.string().optional(),
  cashAccountId: z.string().optional(),
  caseId: z.string().optional(),
  isReconciled: z.coerce.boolean().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
})

export const cashSummarySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  cashAccountId: z.string().optional(),
})
