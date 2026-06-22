import type { FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/utils/response'
import { summerSopService } from './summersop.service'
import {
  SummerSopCreateSchema,
  SummerSopIdSchema,
  SummerSopUpdateSchema,
} from './summersop.schema'

export const summerSopController = {
  async list(_req: FastifyRequest, reply: FastifyReply) {
    const data = await summerSopService.list()
    return reply.send(success(data))
  },

  async get(req: FastifyRequest, reply: FastifyReply) {
    const { id } = SummerSopIdSchema.parse(req.params)
    const data = await summerSopService.get(id)
    return reply.send(success(data))
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const input = SummerSopCreateSchema.parse(req.body)
    const data = await summerSopService.create(input)
    return reply.status(201).send(success(data, 'created'))
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = SummerSopIdSchema.parse(req.params)
    const input = SummerSopUpdateSchema.parse(req.body)
    const data = await summerSopService.update(id, input)
    return reply.send(success(data, 'updated'))
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const { id } = SummerSopIdSchema.parse(req.params)
    const data = await summerSopService.remove(id)
    return reply.send(success(data, 'deleted'))
  },
}
