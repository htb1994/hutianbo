import type { FastifyInstance } from 'fastify'
import { channelController } from './channel.controller'

export async function channelRoutes(app: FastifyInstance) {
  app.get('/', channelController.list)
  app.get('/:id', channelController.get)
  app.post('/', channelController.create)
  app.patch('/:id', channelController.update)
  app.delete('/:id', channelController.remove)
}
