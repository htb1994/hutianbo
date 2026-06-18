<script setup lang="ts">
import { computed } from 'vue'
import type { BaseModalProps } from './types'

const props = withDefaults(defineProps<BaseModalProps>(), {
  title: '',
  width: 480,
  closeOnMask: true,
  hideFooter: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const panelStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
}))

function close() {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="base-modal" role="dialog" aria-modal="true">
      <div class="base-modal__mask" @click="closeOnMask && close()" />
      <div class="base-modal__panel" :style="panelStyle">
        <header v-if="title || $slots.header" class="base-modal__header">
          <slot name="header">
            <span class="base-modal__title">{{ title }}</span>
          </slot>
          <button class="base-modal__close" type="button" aria-label="Close" @click="close">
            &times;
          </button>
        </header>
        <div class="base-modal__body">
          <slot />
        </div>
        <footer v-if="!hideFooter" class="base-modal__footer">
          <slot name="footer" :close="close" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style lang="less" scoped src="./style.less" />
