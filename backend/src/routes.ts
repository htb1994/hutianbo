import fp from 'fastify-plugin'
import channelModule from './modules/channel'
import todoModule from './modules/todo'

/**
 * Aggregates every business module's plugin. To add a new module, register
 * its default-exported plugin here. The module decides its own URL prefix.
 */
export default fp(
  async (app) => {
    await app.register(channelModule)
    await app.register(todoModule)
  },
  { name: 'app-routes' },
)
