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

const gradePain: Record<SummerSopCreateInput['grade'], string> = {
  primary: '小学阶段最怕的是暑假一放松，计算、阅读和学习习惯一起掉线，开学后家长再补就会很吃力。',
  middle: '初中暑假不是简单预习，真正要解决的是基础漏洞、做题方法和新学期节奏，不然开学很容易被进度推着走。',
  high: '高中暑假每一周都很关键，知识漏洞、刷题效率和选科/考试节奏都会直接影响后面一轮复习和成绩稳定性。',
}

const gradeValue: Record<SummerSopCreateInput['grade'], string> = {
  primary: '洋葱学园更适合先把知识点拆小，让孩子用短视频和练习把薄弱点补上，再慢慢建立自主学习节奏。',
  middle: '洋葱学园的优势是把重难点讲清楚，再配合练习巩固，适合暑假做查漏补缺和新学期衔接。',
  high: '洋葱学园适合用来做专题复盘和薄弱点回看，帮助孩子把不会的地方从“听过”变成“真的能做对”。',
}

const stageFocus: Record<SummerSopCreateInput['stage'], string> = {
  warmup: '今天先不急着推课，先把家长的暑假焦虑问出来，让大家意识到暑假需要规划。',
  invite: '今天重点把“体验/诊断”约出去，让家长先迈出第一步，不要一上来就谈长期报名。',
  attendance: '今天重点提高到课率，让已经报名体验的家长知道时间、价值和需要准备什么。',
  feedback: '今天重点做课后反馈，把孩子的问题说具体，把下一步学习建议说清楚。',
  conversion: '今天重点转化，先复盘孩子收获，再给出暑促名额和报名动作。',
  last_call: '今天重点收口，提醒截止时间和名额，帮犹豫家长做最后决策。',
}

const toneGuide: Record<SummerSopCreateInput['tone'], { opener: string; cta: string; pressure: string }> = {
  balanced: {
    opener: '先帮家长看清孩子问题，再顺势给出体验课入口。',
    cta: '想先了解的家长，回复“规划”，我按孩子年级逐个给建议。',
    pressure: '本轮暑促名额有限，建议先锁定体验，再决定是否继续。',
  },
  trust_first: {
    opener: '先建立专业感和信任感，不急着催报名。',
    cta: '愿意的话可以发孩子年级和薄弱科目，我先帮您做个初步判断。',
    pressure: '适合再报名，不适合也至少能明确暑假该补哪里。',
  },
  conversion_push: {
    opener: '直接围绕暑促名额、体验课和报名动作推进。',
    cta: '想占一个体验名额的家长，直接回复“报名”，我马上登记。',
    pressure: '今天先统计第一批名单，名额满了就只能排下一轮。',
  },
  agent_ground: {
    opener: '话术要短、口语化，方便代理商在学校家长群和朋友圈直接发。',
    cta: '有兴趣的家长直接私信我“体验”，我发安排。',
    pressure: '暑假班排期比较紧，先报先安排时间。',
  },
}

function buildCommunityNotice(input: SummerSopCreateInput): string {
  const stage = stageLabels[input.stage]
  const tone = toneGuide[input.tone]
  return [
    `【洋葱学园${stage}】`,
    `各位家长，7月暑假马上进入关键期，今天我们重点聊「${input.topic}」。`,
    gradePain[input.grade],
    gradeValue[input.grade],
    tone.pressure,
    tone.cta,
  ].join('\n')
}

function buildGroupScript(input: SummerSopCreateInput): string {
  const grade = gradeLabels[input.grade]
  const focus = stageFocus[input.stage]
  const tone = toneGuide[input.tone]
  return [
    `今晚群里我们不刷屏，先做一个${grade}暑假小诊断。`,
    focus,
    '家长可以按这个格式回复：年级 + 最担心的科目 + 暑假想解决的问题。',
    `我会优先挑 3-5 个典型情况，在群里给大家拆解：问题在哪里、暑假怎么安排、洋葱学园体验课适不适合。`,
    tone.cta,
  ].join('\n')
}

function buildMomentsCopy(input: SummerSopCreateInput): string {
  const grade = gradeLabels[input.grade]
  const tone = toneGuide[input.tone]
  return [
    `7月暑假，很多${grade}家长最容易犯的错：一上来就买一堆资料，最后孩子做不完，问题也没解决。`,
    gradePain[input.grade],
    `洋葱学园这次暑促更建议先做一次体验/诊断：看孩子薄弱点，再定学习节奏。`,
    tone.pressure,
    `需要「${input.topic}」方案的家长，私信我“暑假规划”。`,
  ].join('\n')
}

function buildPrivateChatScript(input: SummerSopCreateInput): string {
  const grade = gradeLabels[input.grade]
  return [
    `您好，我看到您关注${grade}暑假学习。先跟您说实话：暑假报不报课不是第一步，第一步是看孩子到底卡在哪里。`,
    `我一般会先问三个问题：现在最弱的科目是什么？平时是不会做，还是会但总错？暑假每天能稳定拿出多少学习时间？`,
    `如果孩子适合洋葱学园，我们可以先安排一次体验/诊断课，让您看到孩子听不听得进去、题能不能跟上。`,
    `如果您方便，我先帮您登记一个体验名额：孩子年级 + 薄弱科目 + 可上课时间。`,
  ].join('\n')
}

function buildChecklist(input: SummerSopCreateInput): string[] {
  const goal = goalLabels[input.goal]
  return [
    `09:00 给代理商同步今日目标：${goal}，说明今天主推「${input.topic}」`,
    '10:30 发朋友圈，配合 1 张孩子学习/暑假规划相关图片',
    '14:00 私聊前一天在群里互动过的家长，按“问题诊断 -> 体验邀约”推进',
    '19:20 群内预告今晚小诊断，提醒家长准备孩子年级和薄弱科目',
    '19:40 发群公告，收集回复“规划/体验/报名”的家长',
    '20:30 对回复家长做分层：围观、想体验、已体验未报名、临近成交',
    '21:20 汇总四个数：群互动人数、私聊人数、体验预约数、付费意向数',
    '22:00 给城市经理反馈今日问题和明日需要支持的话术/素材',
  ]
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
