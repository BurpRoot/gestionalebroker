import { z } from 'zod'

export const createCaseSchema = z.object({
  customerId: z.string().cuid(),
  vehicleId: z.string().cuid().optional(),
  partnerId: z.string().cuid().optional(),
  collaboratorId: z.string().cuid().optional(),
  caseType: z.string().optional(),
  productLine: z.string().optional(),
  grossPremium: z.coerce.number().optional(),
  partnerCost: z.coerce.number().optional(),
  additionalCosts: z.coerce.number().default(0),
  collaboratorCommissionValue: z.coerce.number().optional(),
  scudieriAmount: z.coerce.number().default(0),
  mobilityAmount: z.coerce.number().default(0),
  effectDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  renewalDate: z.coerce.date().optional(),
  paymentFrequency: z.string().optional(),
  paymentInMethod: z.string().optional(),
  paymentInReference: z.string().optional(),
  paymentOutMethod: z.string().optional(),
  paymentOutReference: z.string().optional(),
  bankAccount: z.string().optional(),
  notes: z.string().optional(),
})

export const updateCaseSchema = createCaseSchema.partial()

export const updateCaseStatusSchema = z.object({
  status: z.enum([
    'BOZZA',
    'IN_LAVORAZIONE',
    'IN_ATTESA_DOCUMENTI',
    'IN_ATTESA_COMPAGNIA',
    'EMESSA',
    'PAGATA',
    'RINNOVATA',
    'ANNULLATA',
  ]),
  note: z.string().optional(),
})

export const caseFiltersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  partnerId: z.string().optional(),
  collaboratorId: z.string().optional(),
  caseType: z.string().optional(),
  customerId: z.string().optional(),
  vehicleId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  expiringDays: z.coerce.number().optional(),
})
