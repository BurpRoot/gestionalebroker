import { z } from 'zod'

export const createPartnerSchema = z.object({
  name: z.string().min(1),
  type: z.string().default('compagnia'),
  code: z.string().optional(),
  fiscalCode: z.string().optional(),
  vatNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  pec: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  contactName: z.string().optional(),
  iban: z.string().optional(),
  paymentTermsDays: z.coerce.number().int().optional(),
  notes: z.string().optional(),
})

export const updatePartnerSchema = createPartnerSchema.partial()
