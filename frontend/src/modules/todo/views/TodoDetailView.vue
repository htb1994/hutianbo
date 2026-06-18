<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton/index.vue'
import { todoApi } from '../api'
import type { Todo } from '../types'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const todo = ref<Todo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  const id = String(route.params.id)
  loading.value = true
  error.value = null
  try {
    todo.value = await todoApi.get(id)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="todo-detail">
    <BaseButton variant="ghost" @click="router.back()">&lsaquo; Back</BaseButton>

    <div v-if="loading" class="todo-detail__state">Loading...</div>
    <div v-else-if="error" class="todo-detail__state todo-detail__state--error">
      {{ error }}
    </div>
    <article v-else-if="todo" class="todo-detail__card">
      <h2>{{ todo.title }}</h2>
      <dl>
        <dt>Status</dt>
        <dd>{{ todo.done ? 'Done' : 'Pending' }}</dd>
        <dt>Created</dt>
        <dd>{{ formatDate(todo.createdAt) }}</dd>
        <dt>ID</dt>
        <dd>{{ todo.id }}</dd>
      </dl>
    </article>
  </section>
</template>

<style lang="less" scoped>
.todo-detail {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: @space-lg;

  &__state {
    padding: @space-xxl;
    text-align: center;
    color: @color-text-secondary;

    &--error {
      color: @color-danger;
    }
  }

  &__card {
    background-color: @color-bg-elevated;
    border: 1px solid @color-border;
    border-radius: @radius-md;
    padding: @space-xl;

    h2 {
      margin-bottom: @space-lg;
    }

    dl {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: @space-sm @space-lg;
    }

    dt {
      color: @color-text-secondary;
    }
  }
}
</style>
