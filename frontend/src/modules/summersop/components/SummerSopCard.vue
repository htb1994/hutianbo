<script setup lang="ts">
const props = defineProps<{
  title: string
  content?: string
  checklist?: string[]
}>()

const emit = defineEmits<{
  (e: 'copied', label: string): void
}>()

async function copyContent() {
  const text = props.checklist?.length
    ? props.checklist.map((item, index) => `${index + 1}. ${item}`).join('\n')
    : props.content ?? ''
  if (!text) return
  await navigator.clipboard.writeText(text)
  emit('copied', props.title)
}
</script>

<template>
  <article class="sop-card">
    <header class="sop-card__header">
      <h3>{{ title }}</h3>
      <button type="button" @click="copyContent">复制</button>
    </header>
    <ol v-if="checklist?.length" class="sop-card__list">
      <li v-for="item in checklist" :key="item">{{ item }}</li>
    </ol>
    <p v-else class="sop-card__content">{{ content }}</p>
  </article>
</template>

<style lang="less" scoped>
.sop-card {
  background: @color-bg-elevated;
  border: 1px solid @color-border;
  border-radius: @radius-md;
  padding: @space-lg;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: @space-md;
    margin-bottom: @space-md;

    h3 {
      font-size: @font-size-lg;
      line-height: 1.3;
    }

    button {
      background: @color-primary;
      border: 0;
      border-radius: @radius-sm;
      color: @color-text-inverse;
      cursor: pointer;
      font-size: @font-size-sm;
      padding: @space-xs @space-sm;
      white-space: nowrap;
    }
  }

  &__content,
  &__list {
    color: @color-text;
    font-size: @font-size-md;
    line-height: 1.7;
    white-space: pre-wrap;
  }

  &__list {
    margin: 0;
    padding-left: @space-xl;
  }
}
</style>
