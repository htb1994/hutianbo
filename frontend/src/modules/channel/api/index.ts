import { http } from '@/utils/request'
import type { Channel, ChannelCreateInput, ChannelUpdateInput } from '../types'

export const channelApi = {
  list: (signal?: AbortSignal) => http.get<Channel[]>('/channel', { signal }),
  get: (id: string, signal?: AbortSignal) => http.get<Channel>(`/channel/${id}`, { signal }),
  create: (input: ChannelCreateInput) => http.post<Channel>('/channel', input),
  update: (id: string, input: ChannelUpdateInput) =>
    http.patch<Channel>(`/channel/${id}`, input),
  remove: (id: string) => http.delete<{ id: string }>(`/channel/${id}`),
}
