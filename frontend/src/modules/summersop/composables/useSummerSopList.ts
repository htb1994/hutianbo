import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSummerSopStore } from '../store'

export function useSummerSopList() {
  const store = useSummerSopStore()
  const { items, current, loading, error } = storeToRefs(store)

  const latest = computed(() => current.value ?? items.value[0] ?? null)

  return {
    items,
    current,
    latest,
    loading,
    error,
    fetchAll: store.fetchAll,
    create: store.create,
    update: store.update,
    remove: store.remove,
  }
}
