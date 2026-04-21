import { z } from 'zod'

export const createCollaboratorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  fiscalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  iban: z.string().optional(),
  defaultCommission: z.coerce.number().min(0).max(100).optional(),
  commissionType: z.enum(['PERCENTUALE', 'FISSO']).default('PERCENTUALE'),
  notes: z.string().optional(),
  userId: z.string().cuid().optional(),
})

export const updateCollaboratorSchema = createCollaboratorSchema.partial()
