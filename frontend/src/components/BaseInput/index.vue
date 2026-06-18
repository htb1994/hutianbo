<script setup lang="ts">
import { computed } from 'vue'
import type { BaseInputProps } from './types'

const props = withDefaults(defineProps<BaseInputProps>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
  placeholder: '',
  disabled: false,
  readonly: false,
  invalid: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
  (e: 'enter', value: string | number): void
}>()

const wrapperClasses = computed(() => [
  'base-input',
  `base-input--${props.size}`,
  { 'base-input--disabled': props.disabled, 'base-input--invalid': props.invalid },
])

function onInput(ev: Event) {
  const target = ev.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

function onChange(ev: Event) {
  const target = ev.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('change', value)
}

function onEnter(ev: KeyboardEvent) {
  const target = ev.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('enter', value)
}
</script>

<template>
  <span :class="wrapperClasses">
    <input
      class="base-input__inner"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="onInput"
      @change="onChange"
      @keydown.enter="onEnter"
    />
  </span>
</template>

<style lang="less" scoped src="./style.less" />
