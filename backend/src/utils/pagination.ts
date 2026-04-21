import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
})

export type PaginationParams = z.infer<typeof paginationSchema>

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  }
}

export function buildSkip(page: number, limit: number): number {
  return (page - 1) * limit
}

export function parsePageLimit(query: Record<string, any>, defaultLimit = 20): { page: number; limit: number } {
  return {
    page: Math.max(1, parseInt(query.page, 10) || 1),
    limit: Math.min(200, Math.max(1, parseInt(query.limit, 10) || defaultLimit)),
  }
}
