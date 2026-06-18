import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTodoStore } from '../store'

/**
 * Convenience composable that exposes the module store with derived values.
 * Views should prefer this hook over importing the store directly.
 */
export function useTodoList() {
  const store = useTodoStore()
  const { items, loading, error } = storeToRefs(store)

  const remaining = computed(() => items.value.filter((it) => !it.done).length)

  return {
    items,
    loading,
    error,
    remaining,
    fetchAll: store.fetchAll,
    create: store.create,
    update: store.update,
    remove: store.remove,
  }
}
