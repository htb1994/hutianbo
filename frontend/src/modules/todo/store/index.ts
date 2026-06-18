import { defineStore } from 'pinia'
import { ref } from 'vue'
import { todoApi } from '../api'
import type { Todo, TodoCreateInput, TodoUpdateInput } from '../types'

export const useTodoStore = defineStore('todo', () => {
  const items = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await todoApi.list()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function create(input: TodoCreateInput) {
    const todo = await todoApi.create(input)
    items.value = [todo, ...items.value]
    return todo
  }

  async function update(id: string, input: TodoUpdateInput) {
    const next = await todoApi.update(id, input)
    items.value = items.value.map((it) => (it.id === id ? next : it))
    return next
  }

  async function remove(id: string) {
    await todoApi.remove(id)
    items.value = items.value.filter((it) => it.id !== id)
  }

  return { items, loading, error, fetchAll, create, update, remove }
})
