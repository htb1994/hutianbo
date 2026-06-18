import { http } from '@/utils/request'
import type { Todo, TodoCreateInput, TodoUpdateInput } from '../types'

export const todoApi = {
  list: (signal?: AbortSignal) => http.get<Todo[]>('/todo', { signal }),
  get: (id: string, signal?: AbortSignal) => http.get<Todo>(`/todo/${id}`, { signal }),
  create: (input: TodoCreateInput) => http.post<Todo>('/todo', input),
  update: (id: string, input: TodoUpdateInput) => http.patch<Todo>(`/todo/${id}`, input),
  remove: (id: string) => http.delete<{ id: string }>(`/todo/${id}`),
}
