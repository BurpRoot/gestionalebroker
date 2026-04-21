import 'dotenv/config'
import { env } from './config/env'
import { redisClient } from './config/redis'
import { prisma } from './config/database'
import app from './app'

async function main() {
  // Connetti Redis
  await redisClient.connect()

  // Test DB connection
  await prisma.$connect()
  console.log('✅ Database connesso')

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server avviato su http://localhost:${env.PORT}${env.API_PREFIX}`)
    console.log(`🌍 Ambiente: ${env.NODE_ENV}`)
  })

  const shutdown = async () => {
    console.log('\n⏳ Spegnimento server...')
    server.close(async () => {
      await prisma.$disconnect()
      await redisClient.quit()
      console.log('✅ Server spento correttamente')
      process.exit(0)
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error('❌ Errore avvio server:', err)
  process.exit(1)
})
