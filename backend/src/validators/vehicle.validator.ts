import { z } from 'zod'

export const createVehicleSchema = z.object({
  licensePlate: z.string().min(1).transform((v) => v.toUpperCase().replace(/\s/g, '')),
  customerId: z.string().cuid(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  engineCC: z.coerce.number().optional(),
  powerKw: z.coerce.number().optional(),
  fuelType: z.string().optional(),
  vin: z.string().optional(),
  usage: z.string().optional(),
  notes: z.string().optional(),
})

export const updateVehicleSchema = createVehicleSchema.omit({ customerId: true }).partial()

export const vehicleFiltersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  search: z.string().optional(),
  customerId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
})
