export type SummerSopStage =
  | 'warmup'
  | 'invite'
  | 'attendance'
  | 'feedback'
  | 'conversion'
  | 'last_call'

export type SummerSopGrade = 'primary' | 'middle' | 'high'

export type SummerSopGoal =
  | 'activate_group'
  | 'trial_signup'
  | 'attendance_reminder'
  | 'after_class_conversion'
  | 'deal_closing'

export type SummerSopTone = 'balanced' | 'trust_first' | 'conversion_push' | 'agent_ground'

export interface Summersop {
  id: string
  stage: SummerSopStage
  grade: SummerSopGrade
  goal: SummerSopGoal
  tone: SummerSopTone
  topic: string
  communityNotice: string
  groupScript: string
  momentsCopy: string
  privateChatScript: string
  executionChecklist: string[]
  createdAt: string
  updatedAt: string
}

export type SummerSop = Summersop

export interface SummerSopCreateInput {
  stage?: SummerSopStage
  grade?: SummerSopGrade
  goal?: SummerSopGoal
  tone?: SummerSopTone
  topic?: string
}

export interface SummerSopUpdateInput {
  stage?: SummerSopStage
  grade?: SummerSopGrade
  goal?: SummerSopGoal
  tone?: SummerSopTone
  topic?: string
  communityNotice?: string
  groupScript?: string
  momentsCopy?: string
  privateChatScript?: string
  executionChecklist?: string[]
}
