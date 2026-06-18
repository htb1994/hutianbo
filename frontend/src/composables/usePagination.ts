import { computed, ref } from 'vue'

/**
 * Pure pagination state machine. Decoupled from data fetching so it can be
 * combined with `useRequest`.
 */
export interface UsePaginationOptions {
  page?: number
  pageSize?: number
  total?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const page = ref(options.page ?? 1)
  const pageSize = ref(options.pageSize ?? 10)
  const total = ref(options.total ?? 0)

  const totalPages = computed(() =>
    pageSize.value > 0 ? Math.max(1, Math.ceil(total.value / pageSize.value)) : 1,
  )
  const hasPrev = computed(() => page.value > 1)
  const hasNext = computed(() => page.value < totalPages.value)

  const goto = (n: number) => {
    page.value = Math.min(Math.max(1, n), totalPages.value)
  }
  const next = () => hasNext.value && (page.value += 1)
  const prev = () => hasPrev.value && (page.value -= 1)
  const reset = () => {
    page.value = 1
    total.value = 0
  }

  return { page, pageSize, total, totalPages, hasPrev, hasNext, goto, next, prev, reset }
}
