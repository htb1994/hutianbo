import { NotFoundError } from '@/utils/http-error'
import { summerSopRepository } from './summersop.repository'
import type { SummerSop } from './summersop.types'
import type { SummerSopCreateInput, SummerSopUpdateInput } from './summersop.schema'

const stageLabels: Record<SummerSopCreateInput['stage'], string> = {
  warmup: '暑促预热',
  invite: '体验课邀约',
  attendance: '到课提醒',
  feedback: '课后反馈',
  conversion: '限时转化',
  last_call: '最后催单',
}

const gradeLabels: Record<SummerSopCreateInput['grade'], string> = {
  primary: '小学',
  middle: '初中',
  high: '高中',
}

const goalLabels: Record<SummerSopCreateInput['goal'], string> = {
  activate_group: '拉群活跃',
  trial_signup: '体验课报名',
  attendance_reminder: '提醒到课',
  after_class_conversion: '课后转化',
  deal_closing: '续报成交',
}

function generateSop(input: SummerSopCreateInput): Omit<SummerSop, 'id' | 'createdAt' | 'updatedAt'> {
  const stage = stageLabels[input.stage]
  const grade = gradeLabels[input.grade]
  const goal = goalLabels[input.goal]
  const topic = input.topic
  const trustHook = `${grade}家长最关心的不是暑假多刷多少题，而是孩子能不能把薄弱点补上、把学习节奏稳住。`
  const conversionHook = '本轮暑促体验名额有限，建议先锁定一次诊断和体验课，再根据孩子情况决定后续安排。'

  return {
    stage: input.stage,
    grade: input.grade,
    goal: input.goal,
    tone: input.tone,
    topic,
    communityNotice: `【洋葱学园${stage}】今天围绕「${topic}」做一次${grade}学习规划分享。${trustHook}${conversionHook} 有需要的家长可以在群里回复“规划”，我会逐一安排。`,
    groupScript: `各位家长晚上好，今天我们先聊一个很现实的问题：暑假只有两个月，孩子到底该补知识点，还是先调学习习惯？洋葱学园建议先做薄弱点诊断，再配合短周期目标。今晚大家可以发一下孩子当前年级和最头疼的科目，我帮大家做初步拆解。`,
    momentsCopy: `7月暑假学习规划开始啦。洋葱学园这次重点帮${grade}孩子做薄弱点诊断、学习节奏调整和体验课规划。先建立方法，再谈提分；先看孩子情况，再选择课程。想了解的家长可以私信我“暑假规划”。`,
    privateChatScript: `您好，我看到您关注了${grade}暑假学习规划。先不用急着报课，我建议先看孩子目前是哪类问题：基础漏洞、学习习惯、还是做题方法。我们可以先安排一次洋葱学园体验/诊断，适合再继续，不适合也能帮您明确暑假方向。`,
    executionChecklist: [
      `09:00 在代理商群同步今日目标：${goal}`,
      `10:30 发布朋友圈文案，重点突出${topic}`,
      '14:00 私聊昨日互动家长，优先邀约体验课',
      '19:30 在社群发布群公告和互动问题',
      '20:30 统计回复“规划/体验”的家长名单',
      '21:30 汇总线索数、体验预约数、待跟进名单',
    ],
  }
}

export const summerSopService = {
  list(): Promise<SummerSop[]> {
    return summerSopRepository.list()
  },

  async get(id: string): Promise<SummerSop> {
    const sop = await summerSopRepository.findById(id)
    if (!sop) throw NotFoundError('summer-sop')
    return sop
  },

  create(input: SummerSopCreateInput): Promise<SummerSop> {
    return summerSopRepository.create(input, generateSop(input))
  },

  async update(id: string, input: SummerSopUpdateInput): Promise<SummerSop> {
    const exists = await summerSopRepository.findById(id)
    if (!exists) throw NotFoundError('summer-sop')
    const updated = await summerSopRepository.update(id, input)
    if (!updated) throw NotFoundError('summer-sop')
    return updated
  },

  async remove(id: string): Promise<{ id: string }> {
    const ok = await summerSopRepository.remove(id)
    if (!ok) throw NotFoundError('summer-sop')
    return { id }
  },
}
