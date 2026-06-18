<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/BaseButton/index.vue'
import BaseInput from '@/components/BaseInput/index.vue'
import BaseEmpty from '@/components/BaseEmpty/index.vue'
import ChannelSchoolCard from '../components/ChannelSchoolCard.vue'
import { useChannelBoard } from '../composables/useChannelBoard'
import type { Channel, ChannelCreateInput, ChannelStage } from '../types'

const {
  items,
  loading,
  totalLeads,
  totalTrials,
  totalPaid,
  conversionRate,
  activeSchools,
  dueFollowUps,
  fetchAll,
  create,
  remove,
} = useChannelBoard()
const submitting = ref(false)
const form = reactive<ChannelCreateInput>({
  agentName: '',
  agentOwner: '',
  city: '',
  schoolName: '',
  stage: 'to_contact',
  leadCount: 0,
  trialCount: 0,
  paidCount: 0,
  nextFollowUpAt: null,
  note: '',
})

const stageOptions: Array<{ value: ChannelStage; label: string }> = [
  { value: 'to_contact', label: '待接触' },
  { value: 'entered_school', label: '已进校' },
  { value: 'leads_collected', label: '已获客' },
  { value: 'trialing', label: '体验中' },
  { value: 'converted', label: '已转化' },
  { value: 'paused', label: '暂停' },
]

const canSubmit = computed(
  () =>
    form.agentName.trim() &&
    form.agentOwner.trim() &&
    form.city.trim() &&
    form.schoolName.trim(),
)

onMounted(() => fetchAll())

async function onAdd() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    await create({
      agentName: form.agentName.trim(),
      agentOwner: form.agentOwner.trim(),
      city: form.city.trim(),
      schoolName: form.schoolName.trim(),
      stage: form.stage,
      leadCount: Number(form.leadCount) || 0,
      trialCount: Number(form.trialCount) || 0,
      paidCount: Number(form.paidCount) || 0,
      nextFollowUpAt: form.nextFollowUpAt || null,
      note: form.note?.trim() ?? '',
    })
    form.schoolName = ''
    form.leadCount = 0
    form.trialCount = 0
    form.paidCount = 0
    form.nextFollowUpAt = null
    form.note = ''
  } finally {
    submitting.value = false
  }
}

function onRemove(channel: Channel) {
  void remove(channel.id)
}

function formatRate(value: number) {
  return `${Math.round(value * 100)}%`
}
</script>

<template>
  <section class="channel-page">
    <header class="channel-page__header">
      <div>
        <h2>渠道转化作战台</h2>
        <p>城市经理学校推进看板</p>
      </div>
      <span class="channel-page__count">今日待跟进 {{ dueFollowUps.length }}</span>
    </header>

    <div class="channel-page__metrics">
      <div>
        <strong>{{ items.length }}</strong>
        <span>学校</span>
      </div>
      <div>
        <strong>{{ activeSchools }}</strong>
        <span>推进中</span>
      </div>
      <div>
        <strong>{{ totalLeads }}</strong>
        <span>线索</span>
      </div>
      <div>
        <strong>{{ totalTrials }}</strong>
        <span>体验</span>
      </div>
      <div>
        <strong>{{ totalPaid }}</strong>
        <span>付费</span>
      </div>
      <div>
        <strong>{{ formatRate(conversionRate) }}</strong>
        <span>转化率</span>
      </div>
    </div>

    <form class="channel-page__form" @submit.prevent="onAdd">
      <BaseInput v-model="form.city" placeholder="城市/区域" />
      <BaseInput v-model="form.agentName" placeholder="代理商" />
      <BaseInput v-model="form.agentOwner" placeholder="负责人" />
      <BaseInput v-model="form.schoolName" placeholder="学校名称" />
      <select v-model="form.stage" class="channel-page__select">
        <option v-for="stage in stageOptions" :key="stage.value" :value="stage.value">
          {{ stage.label }}
        </option>
      </select>
      <BaseInput v-model="form.leadCount" type="number" placeholder="线索数" />
      <BaseInput v-model="form.trialCount" type="number" placeholder="体验数" />
      <BaseInput v-model="form.paidCount" type="number" placeholder="付费数" />
      <BaseInput v-model="form.nextFollowUpAt" type="date" placeholder="下次跟进" />
      <BaseInput v-model="form.note" placeholder="下一步动作" />
      <BaseButton type="submit" :loading="submitting" :disabled="!canSubmit">
        新增推进
      </BaseButton>
    </form>

    <div class="channel-page__list">
      <div v-if="loading && items.length === 0" class="channel-page__loading">加载中...</div>
      <BaseEmpty v-else-if="items.length === 0" description="暂无学校推进记录" />
      <template v-else>
        <ChannelSchoolCard
          v-for="channel in items"
          :key="channel.id"
          :channel="channel"
          @remove="onRemove"
        />
      </template>
    </div>
  </section>
</template>

<style lang="less" scoped>
.channel-page {
  max-width: 1120px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: @space-xl;

    h2 {
      font-size: @font-size-xxl;
    }

    p {
      color: @color-text-secondary;
      font-size: @font-size-sm;
      margin-top: @space-xs;
    }
  }

  &__count {
    color: @color-text-secondary;
    font-size: @font-size-sm;
  }

  &__metrics {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: @space-md;
    margin-bottom: @space-lg;

    div {
      background-color: @color-bg-elevated;
      border: 1px solid @color-border;
      border-radius: @radius-md;
      padding: @space-lg;
    }

    strong {
      color: @color-text;
      display: block;
      font-size: @font-size-xl;
      line-height: 1.2;
    }

    span {
      color: @color-text-secondary;
      font-size: @font-size-sm;
    }
  }

  &__form {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: @space-md;
    margin-bottom: @space-lg;
  }

  &__select {
    background: @color-bg-elevated;
    border: 1px solid @color-border;
    border-radius: @radius-md;
    color: @color-text;
    font-size: @font-size-md;
    min-height: 38px;
    padding: 0 @space-md;
  }

  &__list {
    background-color: @color-bg-elevated;
    border: 1px solid @color-border;
    border-radius: @radius-md;
    overflow: hidden;
  }

  &__loading {
    padding: @space-xxl;
    text-align: center;
    color: @color-text-secondary;
  }

  @media (max-width: 900px) {
    &__metrics,
    &__form {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    &__header {
      align-items: flex-start;
      flex-direction: column;
      gap: @space-sm;
    }

    &__metrics,
    &__form {
      grid-template-columns: 1fr;
    }
  }
}
</style>
