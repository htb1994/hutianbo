import type { App } from 'vue'
import BaseButton from './BaseButton/index.vue'
import BaseInput from './BaseInput/index.vue'
import BaseModal from './BaseModal/index.vue'
import BaseTable from './BaseTable/index.vue'
import BaseEmpty from './BaseEmpty/index.vue'

export { BaseButton, BaseInput, BaseModal, BaseTable, BaseEmpty }
export * from './BaseButton/types'
export * from './BaseInput/types'
export * from './BaseModal/types'
export * from './BaseTable/types'
export * from './BaseEmpty/types'

/**
 * Globally register the base components. Called once from `main.ts`.
 * Module-level views may also import them directly; both styles are allowed.
 */
export function registerBaseComponents(app: App): void {
  app.component('BaseButton', BaseButton)
  app.component('BaseInput', BaseInput)
  app.component('BaseModal', BaseModal)
  app.component('BaseTable', BaseTable)
  app.component('BaseEmpty', BaseEmpty)
}
