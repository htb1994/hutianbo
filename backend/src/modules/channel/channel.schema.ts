import { z } from 'zod'

/**
 * Schemas are the single source of truth for the wire format. Types used by
 * the rest of the module are inferred from these schemas via `z.infer`.
 */

export const ChannelCreateSchema = z.object({
  agentName: z.string().min(1).max(80),
  agentOwner: z.string().min(1).max(40),
  city: z.string().min(1).max(40),
  schoolName: z.string().min(1).max(120),
  stage: z
    .enum(['to_contact', 'entered_school', 'leads_collected', 'trialing', 'converted', 'paused'])
    .default('to_contact'),
  leadCount: z.number().int().min(0).default(0),
  trialCount: z.number().int().min(0).default(0),
  paidCount: z.number().int().min(0).default(0),
  nextFollowUpAt: z.string().optional().nullable(),
  note: z.string().max(500).optional().default(''),
})

export const ChannelUpdateSchema = z
  .object({
    agentName: z.string().min(1).max(80).optional(),
    agentOwner: z.string().min(1).max(40).optional(),
    city: z.string().min(1).max(40).optional(),
    schoolName: z.string().min(1).max(120).optional(),
    stage: z
      .enum(['to_contact', 'entered_school', 'leads_collected', 'trialing', 'converted', 'paused'])
      .optional(),
    leadCount: z.number().int().min(0).optional(),
    trialCount: z.number().int().min(0).optional(),
    paidCount: z.number().int().min(0).optional(),
    nextFollowUpAt: z.string().optional().nullable(),
    note: z.string().max(500).optional(),
  })
  .refine((v) => Object.values(v).some((value) => value !== undefined), {
    message: 'At least one channel field is required',
  })

export const ChannelIdSchema = z.object({
  id: z.string().min(1),
})

export const ChannelSchema = z.object({
  id: z.string(),
  agentName: z.string(),
  agentOwner: z.string(),
  city: z.string(),
  schoolName: z.string(),
  stage: z.enum(['to_contact', 'entered_school', 'leads_collected', 'trialing', 'converted', 'paused']),
  leadCount: z.number(),
  trialCount: z.number(),
  paidCount: z.number(),
  conversionRate: z.number(),
  nextFollowUpAt: z.string().nullable(),
  note: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ChannelCreateInput = z.infer<typeof ChannelCreateSchema>
export type ChannelUpdateInput = z.infer<typeof ChannelUpdateSchema>
export type ChannelIdParam = z.infer<typeof ChannelIdSchema>
