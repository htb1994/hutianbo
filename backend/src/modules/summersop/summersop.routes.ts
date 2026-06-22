import type { FastifyInstance } from 'fastify'
import { summerSopController } from './summersop.controller'

export async function summerSopRoutes(app: FastifyInstance) {
  app.get('/', summerSopController.list)
  app.get('/:id', summerSopController.get)
  app.post('/', summerSopController.create)
  app.patch('/:id', summerSopController.update)
  app.delete('/:id', summerSopController.remove)
}
