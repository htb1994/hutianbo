import { NotFoundError } from '@/utils/http-error'
import { todoRepository } from './todo.repository'
import type { Todo } from './todo.types'
import type { TodoCreateInput, TodoUpdateInput } from './todo.schema'

/**
 * Business rules. Keep this layer free of HTTP/Fastify concerns. Throw
 * `AppError` subclasses for domain failures; the global handler translates
 * them into HTTP responses.
 */
export const todoService = {
  list(): Promise<Todo[]> {
    return todoRepository.list()
  },

  async get(id: string): Promise<Todo> {
    const todo = await todoRepository.findById(id)
    if (!todo) throw NotFoundError('todo')
    return todo
  },

  create(input: TodoCreateInput): Promise<Todo> {
    return todoRepository.create(input)
  },

  async update(id: string, input: TodoUpdateInput): Promise<Todo> {
    const exists = await todoRepository.findById(id)
    if (!exists) throw NotFoundError('todo')
    const updated = await todoRepository.update(id, input)
    if (!updated) throw NotFoundError('todo')
    return updated
  },

  async remove(id: string): Promise<{ id: string }> {
    const ok = await todoRepository.remove(id)
    if (!ok) throw NotFoundError('todo')
    return { id }
  },
}
