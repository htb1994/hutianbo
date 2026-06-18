<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="nf">
    <h1>404</h1>
    <p>Page not found.</p>
    <RouterLink to="/">Back to home</RouterLink>
  </div>
</template>

<style lang="less" scoped>
.nf {
  text-align: center;
  padding: @space-xxl;
  color: @color-text-secondary;

  h1 {
    font-size: 64px;
    color: @color-text;
  }
}
</style>
