<script setup lang="ts">
import { computed } from 'vue'
import type { BaseButtonProps } from './types'

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
  type: 'button',
})

defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

const classes = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  { 'base-button--block': props.block, 'base-button--loading': props.loading },
])
</script>

<template>
  <button
    :class="classes"
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style lang="less" scoped src="./style.less" />
