import type { RouteRecordRaw } from 'vue-router'

export const todoRoutes: RouteRecordRaw[] = [
  {
    path: 'todos',
    name: 'todo-list',
    component: () => import('./views/TodoListView.vue'),
  },
  {
    path: 'todos/:id',
    name: 'todo-detail',
    component: () => import('./views/TodoDetailView.vue'),
  },
]
