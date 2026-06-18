<script setup lang="ts">
import type { BaseEmptyProps } from './types'

withDefaults(defineProps<BaseEmptyProps>(), { description: 'No data' })
</script>

<template>
  <div class="base-empty">
    <div class="base-empty__icon" aria-hidden="true">&#9745;</div>
    <slot>
      <div class="base-empty__desc">{{ description }}</div>
    </slot>
  </div>
</template>

<style lang="less" scoped src="./style.less" />
