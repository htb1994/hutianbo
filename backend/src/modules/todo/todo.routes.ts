import type { FastifyInstance } from 'fastify'
import { todoController } from './todo.controller'

export async function todoRoutes(app: FastifyInstance) {
  app.get('/', todoController.list)
  app.get('/:id', todoController.get)
  app.post('/', todoController.create)
  app.patch('/:id', todoController.update)
  app.delete('/:id', todoController.remove)
}
