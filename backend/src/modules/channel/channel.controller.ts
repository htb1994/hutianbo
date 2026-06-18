import type { FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/utils/response'
import { channelService } from './channel.service'
import { ChannelCreateSchema, ChannelIdSchema, ChannelUpdateSchema } from './channel.schema'

/**
 * Controllers parse `req` with zod, delegate to the service, and wrap the
 * result with `success()`. They MUST NOT contain business logic.
 */
export const channelController = {
  async list(_req: FastifyRequest, reply: FastifyReply) {
    const data = await channelService.list()
    return reply.send(success(data))
  },

  async get(req: FastifyRequest, reply: FastifyReply) {
    const { id } = ChannelIdSchema.parse(req.params)
    const data = await channelService.get(id)
    return reply.send(success(data))
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const input = ChannelCreateSchema.parse(req.body)
    const data = await channelService.create(input)
    return reply.status(201).send(success(data, 'created'))
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = ChannelIdSchema.parse(req.params)
    const input = ChannelUpdateSchema.parse(req.body)
    const data = await channelService.update(id, input)
    return reply.send(success(data, 'updated'))
  },

  async remove(req: FastifyRequest, reply: FastifyReply) {
    const { id } = ChannelIdSchema.parse(req.params)
    const data = await channelService.remove(id)
    return reply.send(success(data, 'deleted'))
  },
}
