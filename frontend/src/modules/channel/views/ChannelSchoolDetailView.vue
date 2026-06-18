<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton/index.vue'
import { channelApi } from '../api'
import type { Channel, ChannelStage } from '../types'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const channel = ref<Channel | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  const id = String(route.params.id)
  loading.value = true
  error.value = null
  try {
    channel.value = await channelApi.get(id)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

onMounted(load)

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
  <section class="channel-detail">
    <BaseButton variant="ghost" @click="router.back()">&lsaquo; 返回</BaseButton>

    <div v-if="loading" class="channel-detail__state">加载中...</div>
    <div v-else-if="error" class="channel-detail__state channel-detail__state--error">
      {{ error }}
    </div>
    <article v-else-if="channel" class="channel-detail__card">
      <h2>{{ channel.schoolName }}</h2>
      <dl>
        <dt>城市</dt>
        <dd>{{ channel.city }}</dd>
        <dt>代理商</dt>
        <dd>{{ channel.agentName }}</dd>
        <dt>负责人</dt>
        <dd>{{ channel.agentOwner }}</dd>
        <dt>阶段</dt>
        <dd>{{ stageLabels[channel.stage] }}</dd>
        <dt>线索</dt>
        <dd>{{ channel.leadCount }}</dd>
        <dt>体验</dt>
        <dd>{{ channel.trialCount }}</dd>
        <dt>付费</dt>
        <dd>{{ channel.paidCount }}</dd>
        <dt>转化率</dt>
        <dd>{{ formatRate(channel.conversionRate) }}</dd>
        <dt>下次跟进</dt>
        <dd>{{ channel.nextFollowUpAt ? channel.nextFollowUpAt.slice(0, 10) : '-' }}</dd>
        <dt>下一步</dt>
        <dd>{{ channel.note || '-' }}</dd>
        <dt>创建</dt>
        <dd>{{ formatDate(channel.createdAt) }}</dd>
        <dt>ID</dt>
        <dd>{{ channel.id }}</dd>
      </dl>
    </article>
  </section>
</template>

<style lang="less" scoped>
.channel-detail {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: @space-lg;

  &__state {
    padding: @space-xxl;
    text-align: center;
    color: @color-text-secondary;

    &--error {
      color: @color-danger;
    }
  }

  &__card {
    background-color: @color-bg-elevated;
    border: 1px solid @color-border;
    border-radius: @radius-md;
    padding: @space-xl;

    h2 {
      margin-bottom: @space-lg;
    }

    dl {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: @space-sm @space-lg;
    }

    dt {
      color: @color-text-secondary;
    }
  }
}
</style>
