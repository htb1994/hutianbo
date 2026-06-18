import type { RouteRecordRaw } from 'vue-router'

export const channelRoutes: RouteRecordRaw[] = [
  {
    path: 'channel',
    name: 'channel-list',
    component: () => import('./views/ChannelBoardView.vue'),
  },
  {
    path: 'channel/:id',
    name: 'channel-detail',
    component: () => import('./views/ChannelSchoolDetailView.vue'),
  },
]
