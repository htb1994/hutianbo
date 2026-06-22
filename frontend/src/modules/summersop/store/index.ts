import { defineStore } from 'pinia'
import { ref } from 'vue'
import { summerSopApi } from '../api'
import type { SummerSop, SummerSopCreateInput, SummerSopUpdateInput } from '../types'

export const useSummerSopStore = defineStore('summer-sop', () => {
  const items = ref<SummerSop[]>([])
  const current = ref<SummerSop | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await summerSopApi.list()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function create(input: SummerSopCreateInput) {
    const sop = await summerSopApi.create(input)
    current.value = sop
    items.value = [sop, ...items.value]
    return sop
  }

  async function update(id: string, input: SummerSopUpdateInput) {
    const next = await summerSopApi.update(id, input)
    current.value = next
    items.value = items.value.map((it) => (it.id === id ? next : it))
    return next
  }

  async function remove(id: string) {
    await summerSopApi.remove(id)
    items.value = items.value.filter((it) => it.id !== id)
    if (current.value?.id === id) current.value = null
  }

  return { items, current, loading, error, fetchAll, create, update, remove }
})
