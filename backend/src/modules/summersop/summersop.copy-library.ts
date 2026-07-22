import type { SummerSopCreateInput } from './summersop.schema'

type Stage = SummerSopCreateInput['stage']
type Grade = SummerSopCreateInput['grade']
type Goal = SummerSopCreateInput['goal']
type Tone = SummerSopCreateInput['tone']

export const stageLabels: Record<Stage, string> = {
  warmup: '暑促预热',
  invite: '体验课邀约',
  attendance: '到课提醒',
  feedback: '课后反馈',
  conversion: '限时转化',
  last_call: '最后催单',
}

export const gradeLabels: Record<Grade, string> = {
  primary: '小学',
  middle: '初中',
  high: '高中',
}

export const goalLabels: Record<Goal, string> = {
  activate_group: '拉群活跃',
  trial_signup: '体验课报名',
  attendance_reminder: '提醒到课',
  after_class_conversion: '课后转化',
  deal_closing: '续报成交',
}

export const gradeCopy: Record<Grade, { pain: string; value: string; proof: string }> = {
  primary: {
    pain: '小学孩子暑假最容易出现两件事：计算和阅读一放就生，学习习惯也容易散。开学后再追，家长会很累。',
    value: '洋葱学园适合把知识点拆小，用短视频讲清楚，再用练习巩固，让孩子先把“不会”变成“能听懂、能做对”。',
    proof: '特别适合基础不差但不稳定、做题容易粗心、需要建立学习节奏的孩子。',
  },
  middle: {
    pain: '初中暑假不是多刷几套题就够了，真正拉开差距的是基础漏洞、解题方法和新学期节奏。',
    value: '洋葱学园能把重难点拆开讲，再配合练习巩固，适合暑假查漏补缺和开学衔接。',
    proof: '尤其适合“听课好像懂、作业一做就错”的孩子，先把薄弱点找出来更关键。',
  },
  high: {
    pain: '高中暑假每一周都很关键，知识漏洞如果拖到开学，会直接影响后面复习节奏和成绩稳定。',
    value: '洋葱学园适合做专题复盘、薄弱点回看和错题相关知识点补强，帮孩子提高单点突破效率。',
    proof: '适合需要自主复盘、刷题后找不到问题根源、想提升学习效率的孩子。',
  },
}

export const stageCopy: Record<Stage, { focus: string; question: string; close: string }> = {
  warmup: {
    focus: '今天先不急着推课，先把家长的暑假焦虑问出来，让大家意识到“暑假需要规划，不是随便学学”。',
    question: '您家孩子暑假最想解决的是：基础漏洞、学习习惯、还是提前预习？',
    close: '先回复孩子年级和薄弱科目，我帮您判断暑假优先补哪一块。',
  },
  invite: {
    focus: '今天重点把体验/诊断约出去，让家长先迈出第一步，不要一上来就谈长期报名。',
    question: '如果有一次免费/低门槛诊断机会，您更想先看孩子哪一科的问题？',
    close: '想先体验的家长回复“体验”，我按年级安排时间。',
  },
  attendance: {
    focus: '今天重点提高到课率，让已经预约体验的家长知道时间、价值和准备事项。',
    question: '今晚体验前，家长可以先想一个问题：孩子目前最卡的是听不懂，还是会做但总错？',
    close: '已预约的家长回复“到课”，我把时间和注意事项再发您一遍。',
  },
  feedback: {
    focus: '今天重点做课后反馈，把孩子的问题说具体，把下一步学习建议说清楚。',
    question: '体验后您最想知道的是孩子知识点掌握情况，还是后续暑假怎么安排？',
    close: '已体验的家长我会逐一发反馈，建议当天看完当天决定下一步。',
  },
  conversion: {
    focus: '今天重点转化，先复盘孩子收获，再给出暑促名额和报名动作。',
    question: '如果孩子已经看到了问题，也愿意学，暑假最重要的就是把节奏定下来。',
    close: '想锁定暑促名额的家长回复“报名”，我先登记。',
  },
  last_call: {
    focus: '今天重点收口，提醒截止时间和名额，帮犹豫家长做最后决策。',
    question: '还在犹豫的家长可以问自己一句：这个暑假如果不系统补，开学后这个问题会不会更难处理？',
    close: '最后一轮名额今天统计，确定要参加的家长直接回复“确认”。',
  },
}

export const toneCopy: Record<Tone, { opener: string; cta: string; pressure: string; privateClose: string }> = {
  balanced: {
    opener: '先帮家长看清孩子问题，再顺势给出体验课入口。',
    cta: '想先了解的家长，回复“规划”，我按孩子年级逐个给建议。',
    pressure: '本轮暑促名额有限，建议先锁定体验，再决定是否继续。',
    privateClose: '如果您愿意，我先帮孩子占一个体验名额，体验完再决定，不会一上来让您直接报名。',
  },
  trust_first: {
    opener: '先建立专业感和信任感，不急着催报名。',
    cta: '愿意的话可以发孩子年级和薄弱科目，我先帮您做个初步判断。',
    pressure: '适合再报名，不适合也至少能明确暑假该补哪里。',
    privateClose: '我先帮您判断孩子适不适合，不合适就不建议您花这个钱。',
  },
  conversion_push: {
    opener: '直接围绕暑促名额、体验课和报名动作推进。',
    cta: '想占一个体验名额的家长，直接回复“报名”，我马上登记。',
    pressure: '今天先统计第一批名单，名额满了就只能排下一轮。',
    privateClose: '如果您基本确定想试，建议今天先锁名额，后面时间段会越来越紧。',
  },
  agent_ground: {
    opener: '话术要短、口语化，方便代理商在学校家长群和朋友圈直接发。',
    cta: '有兴趣的家长直接私信我“体验”，我发安排。',
    pressure: '暑假班排期比较紧，先报先安排时间。',
    privateClose: '我先给您占个时间，孩子能来听最重要，听完再看要不要继续。',
  },
}

export const momentsHooks: Record<Goal, string> = {
  activate_group: '暑假真正要抢的不是时间，是孩子愿意重新进入学习状态的那个窗口。',
  trial_signup: '先别急着报长期课，先用一次体验看孩子到底卡在哪里。',
  attendance_reminder: '体验课不是走流程，是帮家长看孩子到底听不听得懂、跟不跟得上。',
  after_class_conversion: '体验完最怕拖，孩子的问题当天看清，当天就该定下一步。',
  deal_closing: '暑促名额不是制造焦虑，而是排课时间真的有限，越早定越好安排。',
}

export const privateChatOpeners: Record<Goal, string> = {
  activate_group: '我看到您在群里关注了暑假规划，先不急着报课，我先帮您判断孩子现在最该补哪一块。',
  trial_signup: '您刚才提到想了解体验课，我建议先用一次诊断看看孩子薄弱点，这样比盲目报班更稳。',
  attendance_reminder: '您这边已经预约体验了，我再跟您确认一下时间，也提醒孩子提前准备一科最想解决的问题。',
  after_class_conversion: '孩子体验后的情况我看了一下，问题不是不能学，而是需要把薄弱点拆开补，暑假正好适合做这件事。',
  deal_closing: '我跟您直接说结论：如果这个暑假想系统补，建议今天先把名额定下来，后面主要是排课时间问题。',
}

export function buildChecklist(input: SummerSopCreateInput): string[] {
  const goal = goalLabels[input.goal]
  return [
    `09:00 给代理商同步今日目标：${goal}，统一主推「${input.topic}」`,
    '10:30 发朋友圈，配 1 张学习规划/体验课/孩子听课场景图片',
    '14:00 私聊前一天互动家长，按“问题诊断 -> 体验邀约 -> 名额登记”推进',
    '19:20 群内预告今晚小诊断，提醒家长准备年级和薄弱科目',
    '19:40 发群公告，收集回复“规划/体验/报名”的家长',
    '20:30 给家长分层：围观、想体验、已体验未报、可成交',
    '21:20 统计四个数：互动人数、私聊人数、体验预约数、付费意向数',
    '22:00 回传城市经理：今日有效话术、卡点问题、明日需要的素材',
  ]
}
