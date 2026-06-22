import { http } from '@/utils/request'
import type { SummerSop, SummerSopCreateInput, SummerSopUpdateInput } from '../types'

export const summerSopApi = {
  list: (signal?: AbortSignal) => http.get<SummerSop[]>('/summersop', { signal }),
  get: (id: string, signal?: AbortSignal) => http.get<SummerSop>(`/summersop/${id}`, { signal }),
  create: (input: SummerSopCreateInput) => http.post<SummerSop>('/summersop', input),
  update: (id: string, input: SummerSopUpdateInput) =>
    http.patch<SummerSop>(`/summersop/${id}`, input),
  remove: (id: string) => http.delete<{ id: string }>(`/summersop/${id}`),
}
