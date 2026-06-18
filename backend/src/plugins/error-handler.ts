import fp from 'fastify-plugin'
import { ZodError } from 'zod'
import { AppError } from '@/utils/http-error'
import { fail } from '@/utils/response'

/**
 * Normalises errors into the unified `{ code, data, message }` envelope.
 *
 *   - `AppError`               -> uses its `statusCode` and `code`
 *   - `ZodError` (validation)  -> 422 with `code = 42200`
 *   - Fastify validation error -> 400 with `code = 40000`
 *   - Anything else            -> 500 with `code = 50000`
 */
export default fp(async (app) => {
  app.setErrorHandler((error, req, reply) => {
    if (error instanceof AppError) {
      req.log.warn({ err: error }, 'app error')
      return reply.status(error.statusCode).send(fail(error.code, error.message))
    }

    if (error instanceof ZodError) {
      req.log.warn({ issues: error.issues }, 'validation error')
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
      return reply.status(422).send(fail(42200, message || 'Validation failed'))
    }

    const fastifyErr = error as { validation?: unknown; message?: string }
    if (fastifyErr.validation) {
      req.log.warn({ err: error }, 'fastify validation error')
      return reply.status(400).send(fail(40000, fastifyErr.message ?? 'Validation failed'))
    }

    req.log.error({ err: error }, 'unhandled error')
    return reply.status(500).send(fail(50000, 'Internal Server Error'))
  })

  app.setNotFoundHandler((req, reply) => {
    return reply.status(404).send(fail(40400, `Route not found: ${req.method} ${req.url}`))
  })
})
