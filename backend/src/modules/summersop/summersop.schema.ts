import { z } from 'zod'

export const SummerSopStageSchema = z.enum([
  'warmup',
  'invite',
  'attendance',
  'feedback',
  'conversion',
  'last_call',
])

export const SummerSopGradeSchema = z.enum(['primary', 'middle', 'high'])

export const SummerSopGoalSchema = z.enum([
  'activate_group',
  'trial_signup',
  'attendance_reminder',
  'after_class_conversion',
  'deal_closing',
])

export const SummerSopCreateSchema = z.object({
  stage: SummerSopStageSchema.default('warmup'),
  grade: SummerSopGradeSchema.default('primary'),
  goal: SummerSopGoalSchema.default('activate_group'),
  tone: z
    .enum(['balanced', 'trust_first', 'conversion_push', 'agent_ground'])
    .default('balanced'),
  topic: z.string().min(1).max(80).default('7月暑促学习规划'),
})

export const SummerSopFeishuGenerateSchema = z.object({
  主题: z.string().min(1).max(80).default('7月暑促学习规划'),
  年级: z.enum(['小学', '初中', '高中']).default('小学'),
  阶段: z
    .enum(['暑促预热', '体验课邀约', '到课提醒', '课后反馈', '限时转化', '最后催单'])
    .default('暑促预热'),
  目标: z
    .enum(['拉群活跃', '体验课报名', '提醒到课', '课后转化', '续报成交'])
    .default('拉群活跃'),
  语气: z.enum(['均衡推进', '信任优先', '强转化', '代理商地推']).default('均衡推进'),
})

export const SummerSopFeishuGenerateResponseSchema = z.object({
  fields: z.object({
    群公告: z.string(),
    群内互动话术: z.string(),
    朋友圈文案: z.string(),
    私聊话术: z.string(),
    执行清单: z.string(),
    生成状态: z.literal('已生成'),
  }),
})

export const SummerSopUpdateSchema = z
  .object({
    stage: SummerSopStageSchema.optional(),
    grade: SummerSopGradeSchema.optional(),
    goal: SummerSopGoalSchema.optional(),
    tone: z.enum(['balanced', 'trust_first', 'conversion_push', 'agent_ground']).optional(),
    topic: z.string().min(1).max(80).optional(),
    communityNotice: z.string().min(1).max(1200).optional(),
    groupScript: z.string().min(1).max(1200).optional(),
    momentsCopy: z.string().min(1).max(1200).optional(),
    privateChatScript: z.string().min(1).max(1200).optional(),
    executionChecklist: z.array(z.string().min(1).max(160)).min(1).max(12).optional(),
  })
  .refine((v) => Object.values(v).some((value) => value !== undefined), {
    message: 'At least one summer SOP field is required',
  })

export const SummerSopIdSchema = z.object({
  id: z.string().min(1),
})

export const SummersopSchema = z.object({
  id: z.string(),
  stage: SummerSopStageSchema,
  grade: SummerSopGradeSchema,
  goal: SummerSopGoalSchema,
  tone: z.enum(['balanced', 'trust_first', 'conversion_push', 'agent_ground']),
  topic: z.string(),
  communityNotice: z.string(),
  groupScript: z.string(),
  momentsCopy: z.string(),
  privateChatScript: z.string(),
  executionChecklist: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type SummerSopCreateInput = z.infer<typeof SummerSopCreateSchema>
export type SummerSopFeishuGenerateInput = z.infer<typeof SummerSopFeishuGenerateSchema>
export type SummerSopFeishuGenerateResponse = z.infer<
  typeof SummerSopFeishuGenerateResponseSchema
>
export type SummerSopUpdateInput = z.infer<typeof SummerSopUpdateSchema>
export type SummerSopIdParam = z.infer<typeof SummerSopIdSchema>
