import { pino } from 'pino'
import { env } from '@/config/env'

/**
 * Process-wide logger. Fastify gets its own instance via the logger plugin;
 * use this one for code paths outside the request lifecycle (boot,
 * migrations, scheduled tasks).
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined,
})
