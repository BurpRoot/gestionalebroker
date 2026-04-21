import Redis from 'ioredis'
import { env } from './env'

export const redisClient = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

redisClient.on('connect', () => {
  console.log('✅ Redis connesso')
})

redisClient.on('error', (err) => {
  console.error('❌ Errore Redis:', err.message)
})
