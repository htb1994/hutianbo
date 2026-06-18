import type { FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/utils/response'
import { todoService } from './todo.service'
import { TodoCreateSchema, TodoIdSchema, TodoUpdateSchema } from './todo.schema'

/**
 * Controllers parse `req` with zod, delegate to the service, and wrap the
 * result with `success()`. They MUST NOT contain business logic.
 */
export const todoController = {
  async list(_req: FastifyRequest, reply: FastifyReply) {
    const data = await todoService.list()
    return reply.send(success(data))
  },

  async get(req: FastifyRequest, reply: FastifyReply) {
    const { id } = TodoIdSchema.parse(req.params)
    const data = await todoService.get(id)
    return reply.send(success(data))
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const input = TodoCreateSchema.parse(req.body)
    const data = await todoService.create(input)
    return reply.status(201).send(success(data, 'created'))
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = TodoIdSchema.parse(req.params)
    const input = TodoUpdateSchema.parse(req.body)
    const data = await todoService.update(id, input)
    return reply.send(success(data, 'updated'))
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const { id } = TodoIdSchema.parse(req.params)
    const data = await todoService.remove(id)
    return reply.send(success(data, 'deleted'))
  },
}
