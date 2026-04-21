import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_PREFIX: z.string().default('/api/v1'),

  DATABASE_URL: z.string().min(1),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  SESSION_SECRET: z.string().min(16),
  SESSION_MAX_AGE_MS: z.coerce.number().default(28800000),
  SESSION_COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  SESSION_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),

  UPLOAD_BASE_PATH: z.string().default('./uploads'),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().default(20),
  UPLOAD_ALLOWED_MIME_TYPES: z.string().default('application/pdf,image/jpeg,image/png,image/webp'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  BCRYPT_ROUNDS: z.coerce.number().default(12),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Variabili d\'ambiente non valide:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
