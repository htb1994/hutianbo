import { customRef, onScopeDispose } from 'vue'

/**
 * `useDebounce` — a debounced ref. Reading is synchronous; writing schedules
 * a delayed update, coalescing rapid writes within `delay` ms.
 */
export function useDebounce<T>(value: T, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null
  onScopeDispose(() => {
    if (timer) clearTimeout(timer)
  })
  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        value = newValue
        trigger()
        timer = null
      }, delay)
    },
  }))
}

/**
 * Plain debounce helper for callbacks (not refs).
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 300,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
