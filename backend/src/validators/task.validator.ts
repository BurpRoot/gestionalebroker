import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['BASSA', 'MEDIA', 'ALTA', 'URGENTE']).default('MEDIA'),
  dueDate: z.coerce.date().optional(),
  caseId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
})

export const updateTaskSchema = createTaskSchema.partial()

export const updateTaskStatusSchema = z.object({
  status: z.enum(['APERTO', 'IN_CORSO', 'COMPLETATO', 'ANNULLATO']),
})

export const taskFiltersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().optional(),
  caseId: z.string().optional(),
  overdue: z.coerce.boolean().optional(),
})
