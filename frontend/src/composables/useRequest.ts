import { ref, shallowRef } from 'vue'
import { ApiError } from '@/utils/request'

/**
 * Wraps an async data-fetching function and exposes `loading / error / data`
 * plus a `refresh` callback. The fetcher receives an `AbortSignal` so callers
 * can pass it to `request()`.
 *
 * Usage:
 *   const { data, loading, error, refresh } = useRequest(({ signal }) =>
 *     api.listTodos({ signal }))
 */
export interface UseRequestOptions<T> {
  /** Initial value before the first call resolves. */
  initialData?: T
  /** Skip the first auto-call. Defaults to `false`. */
  manual?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: ApiError | Error) => void
}

export function useRequest<T>(
  fetcher: (ctx: { signal: AbortSignal }) => Promise<T>,
  options: UseRequestOptions<T> = {},
) {
  const data = shallowRef<T | undefined>(options.initialData)
  const loading = ref(false)
  const error = shallowRef<ApiError | Error | null>(null)
  let controller: AbortController | null = null

  const refresh = async (): Promise<T | undefined> => {
    controller?.abort()
    controller = new AbortController()
    loading.value = true
    error.value = null
    try {
      const result = await fetcher({ signal: controller.signal })
      data.value = result
      options.onSuccess?.(result)
      return result
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return undefined
      error.value = e as Error
      options.onError?.(e as Error)
      return undefined
    } finally {
      loading.value = false
    }
  }

  if (!options.manual) void refresh()

  return { data, loading, error, refresh }
}
