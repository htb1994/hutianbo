export type ChannelStage =
  | 'to_contact'
  | 'entered_school'
  | 'leads_collected'
  | 'trialing'
  | 'converted'
  | 'paused'

export interface Channel {
  id: string
  agentName: string
  agentOwner: string
  city: string
  schoolName: string
  stage: ChannelStage
  leadCount: number
  trialCount: number
  paidCount: number
  conversionRate: number
  nextFollowUpAt: string | null
  note: string
  createdAt: string
  updatedAt: string
}

export interface ChannelCreateInput {
  agentName: string
  agentOwner: string
  city: string
  schoolName: string
  stage?: ChannelStage
  leadCount?: number
  trialCount?: number
  paidCount?: number
  nextFollowUpAt?: string | null
  note?: string
}

export interface ChannelUpdateInput {
  agentName?: string
  agentOwner?: string
  city?: string
  schoolName?: string
  stage?: ChannelStage
  leadCount?: number
  trialCount?: number
  paidCount?: number
  nextFollowUpAt?: string | null
  note?: string
}
