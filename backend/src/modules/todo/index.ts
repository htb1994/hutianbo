import fp from 'fastify-plugin'
import { todoRoutes } from './todo.routes'

/**
 * The module's only public surface. Mounts the module's routes under a
 * stable URL prefix. Register from `src/routes.ts`.
 */
export default fp(
  async (app) => {
    await app.register(todoRoutes, { prefix: '/api/todo' })
  },
  { name: 'module-todo' },
)

export type { Todo } from './todo.types'
export { TodoCreateSchema, TodoUpdateSchema, TodoSchema } from './todo.schema'
