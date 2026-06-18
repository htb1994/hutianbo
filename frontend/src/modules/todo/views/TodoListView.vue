<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/BaseButton/index.vue'
import BaseInput from '@/components/BaseInput/index.vue'
import BaseEmpty from '@/components/BaseEmpty/index.vue'
import TodoItem from '../components/TodoItem.vue'
import { useTodoList } from '../composables/useTodoList'
import type { Todo } from '../types'

const { items, loading, remaining, fetchAll, create, update, remove } = useTodoList()
const draft = ref('')
const submitting = ref(false)

onMounted(() => fetchAll())

async function onAdd() {
  const title = draft.value.trim()
  if (!title) return
  submitting.value = true
  try {
    await create({ title })
    draft.value = ''
  } finally {
    submitting.value = false
  }
}

function onToggle(todo: Todo) {
  void update(todo.id, { done: !todo.done })
}

function onRemove(todo: Todo) {
  void remove(todo.id)
}
</script>

<template>
  <section class="todo-page">
    <header class="todo-page__header">
      <h2>Todos</h2>
      <span class="todo-page__count">{{ remaining }} remaining</span>
    </header>

    <form class="todo-page__form" @submit.prevent="onAdd">
      <BaseInput
        v-model="draft"
        placeholder="What needs to be done?"
        @enter="onAdd"
      />
      <BaseButton type="submit" :loading="submitting" :disabled="!draft.trim()">
        Add
      </BaseButton>
    </form>

    <div class="todo-page__list">
      <div v-if="loading && items.length === 0" class="todo-page__loading">Loading...</div>
      <BaseEmpty v-else-if="items.length === 0" description="No todos yet. Add one above." />
      <template v-else>
        <TodoItem
          v-for="todo in items"
          :key="todo.id"
          :todo="todo"
          @toggle="onToggle"
          @remove="onRemove"
        />
      </template>
    </div>
  </section>
</template>

<style lang="less" scoped>
.todo-page {
  max-width: 720px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: @space-xl;

    h2 {
      font-size: @font-size-xxl;
    }
  }

  &__count {
    color: @color-text-secondary;
    font-size: @font-size-sm;
  }

  &__form {
    display: flex;
    gap: @space-md;
    margin-bottom: @space-lg;
  }

  &__list {
    background-color: @color-bg-elevated;
    border: 1px solid @color-border;
    border-radius: @radius-md;
    overflow: hidden;
  }

  &__loading {
    padding: @space-xxl;
    text-align: center;
    color: @color-text-secondary;
  }
}
</style>
