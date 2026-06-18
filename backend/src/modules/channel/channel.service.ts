import { NotFoundError } from '@/utils/http-error'
import { channelRepository } from './channel.repository'
import type { Channel } from './channel.types'
import type { ChannelCreateInput, ChannelUpdateInput } from './channel.schema'

/**
 * Business rules. Keep this layer free of HTTP/Fastify concerns. Throw
 * `AppError` subclasses for domain failures; the global handler translates
 * them into HTTP responses.
 */
export const channelService = {
  list(): Promise<Channel[]> {
    return channelRepository.list()
  },

  async get(id: string): Promise<Channel> {
    const channel = await channelRepository.findById(id)
    if (!channel) throw NotFoundError('channel')
    return channel
  },

  create(input: ChannelCreateInput): Promise<Channel> {
    return channelRepository.create(input)
  },

  async update(id: string, input: ChannelUpdateInput): Promise<Channel> {
    const exists = await channelRepository.findById(id)
    if (!exists) throw NotFoundError('channel')
    const updated = await channelRepository.update(id, input)
    if (!updated) throw NotFoundError('channel')
    return updated
  },

  async remove(id: string): Promise<{ id: string }> {
    const ok = await channelRepository.remove(id)
    if (!ok) throw NotFoundError('channel')
    return { id }
  },
}
