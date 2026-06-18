import { defineStore } from 'pinia'
import { ref } from 'vue'
import { channelApi } from '../api'
import type { Channel, ChannelCreateInput, ChannelUpdateInput } from '../types'

export const useChannelStore = defineStore('channel', () => {
  const items = ref<Channel[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await channelApi.list()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function create(input: ChannelCreateInput) {
    const channel = await channelApi.create(input)
    items.value = [channel, ...items.value]
    return channel
  }

  async function update(id: string, input: ChannelUpdateInput) {
    const next = await channelApi.update(id, input)
    items.value = items.value.map((it) => (it.id === id ? next : it))
    return next
  }

  async function remove(id: string) {
    await channelApi.remove(id)
    items.value = items.value.filter((it) => it.id !== id)
  }

  return { items, loading, error, fetchAll, create, update, remove }
})
