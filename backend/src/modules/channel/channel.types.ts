import type { z } from 'zod'
import type { ChannelSchema } from './channel.schema'

export type Channel = z.infer<typeof ChannelSchema>

export interface ChannelRow {
  id: string
  agent_name: string
  agent_owner: string
  city: string
  school_name: string
  stage: Channel['stage']
  lead_count: number
  trial_count: number
  paid_count: number
  next_follow_up_at: string | Date | null
  note: string
  created_at: string | Date
  updated_at: string | Date
}
