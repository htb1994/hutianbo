<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/BaseButton/index.vue'
import BaseInput from '@/components/BaseInput/index.vue'
import BaseEmpty from '@/components/BaseEmpty/index.vue'
import SummerSopCard from '../components/SummerSopCard.vue'
import { useSummerSopList } from '../composables/useSummerSopList'
import type { SummerSopCreateInput, SummerSopGoal, SummerSopGrade, SummerSopStage } from '../types'

const { items, latest, loading, fetchAll, create, remove } = useSummerSopList()
const submitting = ref(false)
const copiedLabel = ref('')
const form = reactive<Required<SummerSopCreateInput>>({
  stage: 'warmup',
  grade: 'primary',
  goal: 'activate_group',
  tone: 'trust_conversion',
  topic: '7月暑促学习规划',
})

const stageOptions: Array<{ value: SummerSopStage; label: string }> = [
  { value: 'warmup', label: '暑促预热' },
  { value: 'invite', label: '体验课邀约' },
  { value: 'attendance', label: '到课提醒' },
  { value: 'feedback', label: '课后反馈' },
  { value: 'conversion', label: '限时转化' },
  { value: 'last_call', label: '最后催单' },
]

const gradeOptions: Array<{ value: SummerSopGrade; label: string }> = [
  { value: 'primary', label: '小学' },
  { value: 'middle', label: '初中' },
  { value: 'high', label: '高中' },
]

const goalOptions: Array<{ value: SummerSopGoal; label: string }> = [
  { value: 'activate_group', label: '拉群活跃' },
  { value: 'trial_signup', label: '体验课报名' },
  { value: 'attendance_reminder', label: '提醒到课' },
  { value: 'after_class_conversion', label: '课后转化' },
  { value: 'deal_closing', label: '续报成交' },
]

onMounted(() => fetchAll())

async function onGenerate() {
  submitting.value = true
  copiedLabel.value = ''
  try {
    await create({ ...form, topic: form.topic.trim() || '7月暑促学习规划' })
  } finally {
    submitting.value = false
  }
}

function onCopied(label: string) {
  copiedLabel.value = `${label}已复制`
  window.setTimeout(() => {
    copiedLabel.value = ''
  }, 1800)
}
</script>

<template>
  <section class="summer-sop">
    <header class="summer-sop__header">
      <div>
        <h2>暑促社群 SOP 生成器</h2>
        <p>城市经理生成内容包，代理商直接复制执行</p>
      </div>
      <span v-if="copiedLabel" class="summer-sop__toast">{{ copiedLabel }}</span>
    </header>

    <div class="summer-sop__workspace">
      <form class="summer-sop__panel" @submit.prevent="onGenerate">
        <label>
          <span>运营阶段</span>
          <select v-model="form.stage">
            <option v-for="stage in stageOptions" :key="stage.value" :value="stage.value">
              {{ stage.label }}
            </option>
          </select>
        </label>
        <label>
          <span>年级</span>
          <select v-model="form.grade">
            <option v-for="grade in gradeOptions" :key="grade.value" :value="grade.value">
              {{ grade.label }}
            </option>
          </select>
        </label>
        <label>
          <span>今日目标</span>
          <select v-model="form.goal">
            <option v-for="goal in goalOptions" :key="goal.value" :value="goal.value">
              {{ goal.label }}
            </option>
          </select>
        </label>
        <label>
          <span>主题</span>
          <BaseInput v-model="form.topic" placeholder="例如：7月暑促学习规划" />
        </label>
        <BaseButton type="submit" :loading="submitting" block>生成 SOP 内容包</BaseButton>
      </form>

      <div class="summer-sop__output">
        <div v-if="loading && !latest" class="summer-sop__state">加载中...</div>
        <BaseEmpty v-else-if="!latest" description="选择阶段、年级和目标后生成第一份 SOP" />
        <template v-else>
          <SummerSopCard title="群公告" :content="latest.communityNotice" @copied="onCopied" />
          <SummerSopCard title="群内互动话术" :content="latest.groupScript" @copied="onCopied" />
          <SummerSopCard title="朋友圈文案" :content="latest.momentsCopy" @copied="onCopied" />
          <SummerSopCard title="家长私聊话术" :content="latest.privateChatScript" @copied="onCopied" />
          <SummerSopCard
            title="代理商当日执行清单"
            :checklist="latest.executionChecklist"
            @copied="onCopied"
          />
        </template>
      </div>
    </div>

    <section class="summer-sop__history">
      <h3>最近生成</h3>
      <div v-if="items.length === 0" class="summer-sop__history-empty">暂无记录</div>
      <article v-for="item in items.slice(0, 6)" :key="item.id" class="summer-sop__history-item">
        <div>
          <strong>{{ item.topic }}</strong>
          <span>{{ item.createdAt.slice(0, 10) }}</span>
        </div>
        <button type="button" @click="remove(item.id)">删除</button>
      </article>
    </section>
  </section>
</template>

<style lang="less" scoped>
.summer-sop {
  max-width: 1180px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: @space-md;
    margin-bottom: @space-xl;

    h2 {
      font-size: @font-size-xxl;
      line-height: 1.25;
    }

    p {
      color: @color-text-secondary;
      font-size: @font-size-sm;
      margin-top: @space-xs;
    }
  }

  &__toast {
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.35);
    border-radius: @radius-md;
    color: @color-success;
    font-size: @font-size-sm;
    padding: @space-sm @space-md;
  }

  &__workspace {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: @space-lg;
    align-items: flex-start;
  }

  &__panel {
    background: @color-bg-elevated;
    border: 1px solid @color-border;
    border-radius: @radius-md;
    display: flex;
    flex-direction: column;
    gap: @space-md;
    padding: @space-lg;

    label {
      display: flex;
      flex-direction: column;
      gap: @space-xs;
    }

    span {
      color: @color-text-secondary;
      font-size: @font-size-sm;
    }

    select {
      background: @color-bg-elevated;
      border: 1px solid @color-border;
      border-radius: @radius-md;
      color: @color-text;
      font-size: @font-size-md;
      min-height: 38px;
      padding: 0 @space-md;
    }
  }

  &__output {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: @space-md;
  }

  &__state {
    color: @color-text-secondary;
    padding: @space-xxl;
    text-align: center;
  }

  &__history {
    margin-top: @space-xl;

    h3 {
      font-size: @font-size-lg;
      margin-bottom: @space-md;
    }
  }

  &__history-empty,
  &__history-item {
    background: @color-bg-elevated;
    border: 1px solid @color-border;
    border-radius: @radius-md;
    padding: @space-md;
  }

  &__history-empty {
    color: @color-text-secondary;
  }

  &__history-item {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: @space-sm;

    div {
      display: flex;
      flex-direction: column;
      gap: @space-xs;
    }

    span {
      color: @color-text-secondary;
      font-size: @font-size-sm;
    }

    button {
      background: transparent;
      border: 0;
      color: @color-danger;
      cursor: pointer;
    }
  }

  @media (max-width: 860px) {
    &__workspace,
    &__output {
      grid-template-columns: 1fr;
    }
  }
}
</style>
