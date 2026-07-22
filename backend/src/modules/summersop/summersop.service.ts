import { NotFoundError } from '@/utils/http-error'
import { summerSopRepository } from './summersop.repository'
import type { SummerSop } from './summersop.types'
import type { SummerSopCreateInput, SummerSopUpdateInput } from './summersop.schema'
import {
  buildChecklist,
  gradeCopy,
  gradeLabels,
  momentsHooks,
  privateChatOpeners,
  stageCopy,
  stageLabels,
  toneCopy,
} from './summersop.copy-library'

function buildCommunityNotice(input: SummerSopCreateInput): string {
  const stage = stageLabels[input.stage]
  const tone = toneCopy[input.tone]
  const grade = gradeCopy[input.grade]
  const stageMaterial = stageCopy[input.stage]
  return [
    `【洋葱学园${stage}】`,
    `各位家长，今天这条信息建议认真看一下，关系到孩子7月暑假怎么安排。`,
    `今天主题：${input.topic}`,
    grade.pain,
    grade.value,
    stageMaterial.question,
    tone.pressure,
    tone.cta,
  ].join('\n')
}

function buildGroupScript(input: SummerSopCreateInput): string {
  const grade = gradeLabels[input.grade]
  const stageMaterial = stageCopy[input.stage]
  const tone = toneCopy[input.tone]
  return [
    `今晚群里不刷屏，我们做一个${grade}暑假小诊断。`,
    tone.opener,
    stageMaterial.focus,
    '家长可以按这个格式回复：年级 + 最担心的科目 + 暑假想解决的问题。',
    `我会挑几个典型情况拆解：问题在哪里、暑假优先补什么、洋葱学园体验课适不适合。`,
    stageMaterial.close,
  ].join('\n')
}

function buildMomentsCopy(input: SummerSopCreateInput): string {
  const grade = gradeLabels[input.grade]
  const gradeMaterial = gradeCopy[input.grade]
  const tone = toneCopy[input.tone]
  return [
    momentsHooks[input.goal],
    `很多${grade}家长最容易犯的错：一上来买一堆资料，最后孩子做不完，问题也没解决。`,
    gradeMaterial.pain,
    gradeMaterial.proof,
    `洋葱学园这次暑促建议先做体验/诊断：看薄弱点，再定学习节奏。`,
    tone.pressure,
    `需要「${input.topic}」方案的家长，私信我“暑假规划”。`,
  ].join('\n')
}

function buildPrivateChatScript(input: SummerSopCreateInput): string {
  const grade = gradeLabels[input.grade]
  const tone = toneCopy[input.tone]
  return [
    `您好，${privateChatOpeners[input.goal]}`,
    `先跟您说实话：${grade}暑假报不报课不是第一步，第一步是看孩子到底卡在哪里。`,
    `我一般会先问三个问题：现在最弱的科目是什么？平时是不会做，还是会但总错？暑假每天能稳定拿出多少学习时间？`,
    `如果孩子适合洋葱学园，我们可以先安排一次体验/诊断课，让您看到孩子听不听得进去、题能不能跟上。`,
    tone.privateClose,
    `您方便的话，把孩子年级、薄弱科目、可上课时间发我，我先帮您登记。`,
  ].join('\n')
}

function generateSop(input: SummerSopCreateInput): Omit<SummerSop, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    stage: input.stage,
    grade: input.grade,
    goal: input.goal,
    tone: input.tone,
    topic: input.topic,
    communityNotice: buildCommunityNotice(input),
    groupScript: buildGroupScript(input),
    momentsCopy: buildMomentsCopy(input),
    privateChatScript: buildPrivateChatScript(input),
    executionChecklist: buildChecklist(input),
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
