import session from 'express-session'
import RedisStore from 'connect-redis'
import { redisClient } from './redis'
import { env } from './env'

export const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient as any }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'gb.sid',
  cookie: {
    httpOnly: true,
    secure: env.SESSION_COOKIE_SECURE,
    sameSite: env.SESSION_COOKIE_SAME_SITE,
    maxAge: env.SESSION_MAX_AGE_MS,
  },
})
