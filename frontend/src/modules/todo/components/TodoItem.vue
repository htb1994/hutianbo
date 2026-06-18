<script setup lang="ts">
import type { Todo } from '../types'

defineProps<{ todo: Todo }>()

defineEmits<{
  (e: 'toggle', todo: Todo): void
  (e: 'remove', todo: Todo): void
}>()
</script>

<template>
  <div class="todo-item" :class="{ 'todo-item--done': todo.done }">
    <label class="todo-item__check">
      <input type="checkbox" :checked="todo.done" @change="$emit('toggle', todo)" />
      <span class="todo-item__title">{{ todo.title }}</span>
    </label>
    <button
      type="button"
      class="todo-item__remove"
      aria-label="Remove"
      @click="$emit('remove', todo)"
    >
      &times;
    </button>
  </div>
</template>

<style lang="less" scoped>
.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @space-md @space-lg;
  border-bottom: 1px solid @color-border;
  background-color: @color-bg-elevated;

  &:last-child {
    border-bottom: 0;
  }

  &--done .todo-item__title {
    color: @color-text-disabled;
    text-decoration: line-through;
  }

  &__check {
    display: flex;
    align-items: center;
    gap: @space-md;
    cursor: pointer;
    flex: 1;
  }

  &__title {
    color: @color-text;
  }

  &__remove {
    background: transparent;
    border: 0;
    color: @color-text-secondary;
    cursor: pointer;
    font-size: @font-size-xl;
    line-height: 1;
    padding: 0 @space-sm;

    &:hover {
      color: @color-danger;
    }
  }
}
</style>
