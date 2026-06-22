<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton/index.vue'
import SummerSopCard from '../components/SummerSopCard.vue'
import { summerSopApi } from '../api'
import type { SummerSop } from '../types'

const route = useRoute()
const router = useRouter()
const sop = ref<SummerSop | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    sop.value = await summerSopApi.get(String(route.params.id))
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="summer-sop-detail">
    <BaseButton variant="ghost" @click="router.back()">&lsaquo; 返回</BaseButton>
    <div v-if="loading" class="summer-sop-detail__state">加载中...</div>
    <div v-else-if="error" class="summer-sop-detail__state summer-sop-detail__state--error">
      {{ error }}
    </div>
    <template v-else-if="sop">
      <h2>{{ sop.topic }}</h2>
      <SummerSopCard title="群公告" :content="sop.communityNotice" />
      <SummerSopCard title="群内互动话术" :content="sop.groupScript" />
      <SummerSopCard title="朋友圈文案" :content="sop.momentsCopy" />
      <SummerSopCard title="家长私聊话术" :content="sop.privateChatScript" />
      <SummerSopCard title="代理商当日执行清单" :checklist="sop.executionChecklist" />
    </template>
  </section>
</template>

<style lang="less" scoped>
.summer-sop-detail {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: @space-md;

  h2 {
    font-size: @font-size-xxl;
  }

  &__state {
    color: @color-text-secondary;
    padding: @space-xxl;
    text-align: center;

    &--error {
      color: @color-danger;
    }
  }
}
</style>
