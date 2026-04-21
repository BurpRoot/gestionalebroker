import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { env } from './config/env'
import { sessionMiddleware } from './config/session'
import { errorMiddleware } from './middleware/error.middleware'
import routes from './routes/index'

const app = express()

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet())
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Sessions ──────────────────────────────────────────────────────────────────
app.use(sessionMiddleware)

// ── Rate limiting on auth ─────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'development' ? 1000 : 10,
  message: { error: 'Troppi tentativi. Riprova tra 15 minuti.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(`${env.API_PREFIX}/auth/login`, loginLimiter)

// ── Routes ────────────────────────────────────────────────────────────────────
app.use(env.API_PREFIX, routes)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' })
})

// ── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorMiddleware)

export default app
