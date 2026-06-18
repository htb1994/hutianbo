import Fastify, { type FastifyInstance } from 'fastify'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { env } from '@/config/env'
import corsPlugin from '@/plugins/cors'
import loggerPlugin from '@/plugins/logger'
import errorHandlerPlugin from '@/plugins/error-handler'
import { success } from '@/utils/response'
import routes from './routes'

const staticTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
}

function safeStaticPath(publicDir: string, rawPath: string): string {
  const cleanPath = decodeURIComponent(rawPath.split('?')[0] ?? '/')
  const requested = cleanPath === '/' ? '/index.html' : cleanPath
  const resolved = path.resolve(publicDir, `.${requested}`)
  return resolved.startsWith(publicDir) ? resolved : path.join(publicDir, 'index.html')
}

async function registerStaticFrontend(app: FastifyInstance) {
  const publicDir = path.resolve(process.cwd(), 'public')
  const indexFile = path.join(publicDir, 'index.html')
  if (!existsSync(indexFile)) return

  app.get('/*', async (req, reply) => {
    const requestedFile = safeStaticPath(publicDir, req.raw.url ?? '/')
    const file = existsSync(requestedFile) ? requestedFile : indexFile
    const ext = path.extname(file)
    const body = await readFile(file)
    return reply.type(staticTypes[ext] ?? 'application/octet-stream').send(body)
  })
}

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
  await registerStaticFrontend(app)

  return app
}
