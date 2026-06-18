import { env } from '@/config/env'
import { closeDb, initDb } from '@/db'
import { logger } from '@/utils/logger'
import { buildApp } from './app'

async function main() {
  await initDb()
  const app = await buildApp()

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'shutting down')
    try {
      await app.close()
      await closeDb()
    } catch (err) {
      logger.error({ err }, 'error during shutdown')
    } finally {
      process.exit(0)
    }
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))

  await app.listen({ port: env.PORT, host: env.HOST })
}

main().catch((err) => {
  logger.error({ err }, 'failed to start server')
  process.exit(1)
})
