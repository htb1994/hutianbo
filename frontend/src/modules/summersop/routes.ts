import type { RouteRecordRaw } from 'vue-router'

export const summerSopRoutes: RouteRecordRaw[] = [
  {
    path: 'summer-sop',
    name: 'summer-sop-list',
    component: () => import('./views/SummerSopView.vue'),
  },
  {
    path: 'summer-sop/:id',
    name: 'summer-sop-detail',
    component: () => import('./views/SummerSopDetailView.vue'),
  },
]
