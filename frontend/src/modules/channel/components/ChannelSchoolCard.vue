<script setup lang="ts">
import type { Channel, ChannelStage } from '../types'

defineProps<{ channel: Channel }>()

defineEmits<{
  (e: 'remove', channel: Channel): void
}>()

const stageLabels: Record<ChannelStage, string> = {
  to_contact: '待接触',
  entered_school: '已进校',
  leads_collected: '已获客',
  trialing: '体验中',
  converted: '已转化',
  paused: '暂停',
}

function formatRate(value: number) {
  return `${Math.round(value * 100)}%`
}
</script>

<template>
  <article class="channel-card">
    <div class="channel-card__main">
      <div>
        <p class="channel-card__school">{{ channel.schoolName }}</p>
        <p class="channel-card__meta">
          {{ channel.city }} / {{ channel.agentName }} / {{ channel.agentOwner }}
        </p>
      </div>
      <span class="channel-card__stage">{{ stageLabels[channel.stage] }}</span>
    </div>

    <div class="channel-card__metrics">
      <span>线索 {{ channel.leadCount }}</span>
      <span>体验 {{ channel.trialCount }}</span>
      <span>付费 {{ channel.paidCount }}</span>
      <span>转化 {{ formatRate(channel.conversionRate) }}</span>
    </div>

    <p v-if="channel.nextFollowUpAt" class="channel-card__follow">
      下次跟进：{{ channel.nextFollowUpAt.slice(0, 10) }}
    </p>
    <p v-if="channel.note" class="channel-card__note">{{ channel.note }}</p>

    <button
      type="button"
      class="channel-card__remove"
      aria-label="删除学校推进记录"
      @click="$emit('remove', channel)"
    >
      &times;
    </button>
  </article>
</template>

<style lang="less" scoped>
.channel-card {
  position: relative;
  padding: @space-lg;
  border-bottom: 1px solid @color-border;
  background-color: @color-bg-elevated;

  &:last-child {
    border-bottom: 0;
  }

  &__main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: @space-md;
    padding-right: @space-xl;
  }

  &__school {
    color: @color-text;
    font-size: @font-size-lg;
    font-weight: 600;
  }

  &__meta,
  &__follow,
  &__note {
    color: @color-text-secondary;
    font-size: @font-size-sm;
    margin-top: @space-xs;
  }

  &__stage {
    border: 1px solid @color-border-strong;
    border-radius: @radius-sm;
    color: @color-text;
    font-size: @font-size-sm;
    padding: @space-xs @space-sm;
    white-space: nowrap;
  }

  &__metrics {
    display: flex;
    flex-wrap: wrap;
    gap: @space-sm;
    margin-top: @space-md;

    span {
      background: @color-bg-muted;
      border-radius: @radius-sm;
      color: @color-text-secondary;
      font-size: @font-size-sm;
      padding: @space-xs @space-sm;
    }
  }

  &__remove {
    position: absolute;
    right: @space-md;
    top: @space-md;
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
