import type { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '@/utils/http-error'

/**
 * Skeleton auth `preHandler`. Replace the token verification block with
 * your real strategy (JWT verify, session lookup, OAuth introspection, ...).
 *
 * Usage in a module routes file:
 *   app.get('/secret', { preHandler: requireAuth }, handler)
 */
export async function requireAuth(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    throw UnauthorizedError('Missing bearer token')
  }
  const token = header.slice('Bearer '.length).trim()
  if (!token) {
    throw UnauthorizedError('Empty bearer token')
  }
  // TODO: verify token and attach the principal:
  //   req.user = await verifyToken(token)
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string }
  }
}
