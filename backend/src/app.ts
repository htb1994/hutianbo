import Fastify, { type FastifyInstance } from 'fastify'
import { env } from '@/config/env'
import corsPlugin from '@/plugins/cors'
import loggerPlugin from '@/plugins/logger'
import errorHandlerPlugin from '@/plugins/error-handler'
import { success } from '@/utils/response'
import routes from './routes'

/**
 * Build the Fastify instance with all plugins and routes wired up. The
 * caller is responsible for `db.initDb()` (done in `server.ts`).
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
          : undefined,
    },
    disableRequestLogging: false,
  })

  await app.register(errorHandlerPlugin)
  await app.register(corsPlugin)
  await app.register(loggerPlugin)

  app.get('/health', async () => success({ status: 'ok', dialect: env.DB_DIALECT }))

  await app.register(routes)

  return app
}
