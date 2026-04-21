import { createClient } from 'redis'
import { env } from './env'

export const redisClient = createClient({ url: env.REDIS_URL })

redisClient.on('connect', () => {
  console.log('✅ Redis connesso')
})

redisClient.on('error', (err) => {
  console.error('❌ Errore Redis:', err.message)
})
