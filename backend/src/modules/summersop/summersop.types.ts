import type { z } from 'zod'
import type { SummersopSchema } from './summersop.schema'

export type SummerSop = z.infer<typeof SummersopSchema>

export interface SummerSopRow {
  id: string
  stage: SummerSop['stage']
  grade: SummerSop['grade']
  goal: SummerSop['goal']
  tone: SummerSop['tone']
  topic: string
  community_notice: string
  group_script: string
  moments_copy: string
  private_chat_script: string
  execution_checklist: string
  created_at: string | Date
  updated_at: string | Date
}
