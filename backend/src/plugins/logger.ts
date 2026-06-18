import fp from 'fastify-plugin'

/**
 * Per-request logging is built into Fastify; this plugin is a hook for
 * customising context (correlation ids, user ids, ...). Add fields here as
 * the project grows.
 */
export default fp(async (app) => {
  app.addHook('onRequest', async (req) => {
    req.log.debug({ url: req.url, method: req.method }, 'incoming request')
  })
})
