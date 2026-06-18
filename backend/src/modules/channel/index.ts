import fp from 'fastify-plugin'
import { channelRoutes } from './channel.routes'

/**
 * The module's only public surface. Mounts the module's routes under a
 * stable URL prefix. Register from `src/routes.ts`.
 */
export default fp(
  async (app) => {
    await app.register(channelRoutes, { prefix: '/api/channel' })
  },
  { name: 'module-channel' },
)

export type { Channel } from './channel.types'
export { ChannelCreateSchema, ChannelUpdateSchema, ChannelSchema } from './channel.schema'
