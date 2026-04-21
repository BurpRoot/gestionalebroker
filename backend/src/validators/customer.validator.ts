import { z } from 'zod'

export const createCustomerSchema = z.object({
  type: z.enum(['PERSONA_FISICA', 'PERSONA_GIURIDICA', 'DITTA_INDIVIDUALE']).default('PERSONA_FISICA'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  fiscalCode: z.string().optional(),
  vatNumber: z.string().optional(),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  pec: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().max(2).optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  privacyConsent: z.boolean().default(false),
})

export const updateCustomerSchema = createCustomerSchema.partial()

export const customerFiltersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  search: z.string().optional(),
  city: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
})
