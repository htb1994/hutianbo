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
export type SummerSopUpdateInput = z.infer<typeof SummerSopUpdateSchema>
export type SummerSopIdParam = z.infer<typeof SummerSopIdSchema>
