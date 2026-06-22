import fp from 'fastify-plugin'
import { summerSopRoutes } from './summersop.routes'

export default fp(
  async (app) => {
    await app.register(summerSopRoutes, { prefix: '/api/summersop' })
  },
  { name: 'module-summersop' },
)

export type { SummerSop } from './summersop.types'
export { SummerSopCreateSchema, SummersopSchema, SummerSopUpdateSchema } from './summersop.schema'
