import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useChannelStore } from '../store'

/**
 * Convenience composable that exposes the module store with derived values.
 * Views should prefer this hook over importing the store directly.
 */
export function useChannelBoard() {
  const store = useChannelStore()
  const { items, loading, error } = storeToRefs(store)

  const totalLeads = computed(() => items.value.reduce((sum, it) => sum + it.leadCount, 0))
  const totalTrials = computed(() => items.value.reduce((sum, it) => sum + it.trialCount, 0))
  const totalPaid = computed(() => items.value.reduce((sum, it) => sum + it.paidCount, 0))
  const conversionRate = computed(() =>
    totalLeads.value === 0 ? 0 : Number((totalPaid.value / totalLeads.value).toFixed(4)),
  )
  const activeSchools = computed(
    () => items.value.filter((it) => !['converted', 'paused'].includes(it.stage)).length,
  )
  const dueFollowUps = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return items.value.filter((it) => it.nextFollowUpAt && it.nextFollowUpAt.slice(0, 10) <= today)
  })

  return {
    items,
    loading,
    error,
    totalLeads,
    totalTrials,
    totalPaid,
    conversionRate,
    activeSchools,
    dueFollowUps,
    fetchAll: store.fetchAll,
    create: store.create,
    update: store.update,
    remove: store.remove,
  }
}
