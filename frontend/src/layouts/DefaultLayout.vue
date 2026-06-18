<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="layout">
    <header class="layout__header">
      <RouterLink to="/" class="layout__brand">vibeCoding</RouterLink>
      <nav class="layout__nav">
        <RouterLink to="/todos" active-class="is-active">Todos</RouterLink>
      </nav>
    </header>
    <main class="layout__main">
      <RouterView />
    </main>
  </div>
</template>

<style lang="less" scoped>
.layout {
  min-height: 100%;
  display: flex;
  flex-direction: column;

  &__header {
    height: 56px;
    padding: 0 @space-xl;
    background-color: @color-bg-elevated;
    border-bottom: 1px solid @color-border;
    display: flex;
    align-items: center;
    gap: @space-xl;
    box-shadow: @shadow-sm;
  }

  &__brand {
    font-weight: 700;
    font-size: @font-size-lg;
    color: @color-text;
  }

  &__nav {
    display: flex;
    gap: @space-lg;

    a {
      color: @color-text-secondary;
      padding: @space-xs @space-sm;
      border-radius: @radius-sm;

      &.is-active {
        color: @color-primary;
        background-color: rgba(59, 130, 246, 0.08);
      }
    }
  }

  &__main {
    flex: 1;
    padding: @space-xl;
  }
}
</style>
