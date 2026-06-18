import { db } from '@/db'
import { nanoid } from '@/utils/id'
import type { Channel, ChannelRow } from './channel.types'
import type { ChannelCreateInput, ChannelUpdateInput } from './channel.schema'

function toIso(value: string | Date | null): string | null {
  if (value === null) return null
  return value instanceof Date ? value.toISOString() : value
}

function toDomain(row: ChannelRow): Channel {
  const leadCount = Number(row.lead_count)
  const paidCount = Number(row.paid_count)
  return {
    id: row.id,
    agentName: row.agent_name,
    agentOwner: row.agent_owner,
    city: row.city,
    schoolName: row.school_name,
    stage: row.stage,
    leadCount,
    trialCount: Number(row.trial_count),
    paidCount,
    conversionRate: leadCount === 0 ? 0 : Number((paidCount / leadCount).toFixed(4)),
    nextFollowUpAt: toIso(row.next_follow_up_at),
    note: row.note,
    createdAt: toIso(row.created_at) ?? '',
    updatedAt: toIso(row.updated_at) ?? '',
  }
}

export const channelRepository = {
  async list(): Promise<Channel[]> {
    const rows = await db.query<ChannelRow>(
      'SELECT * FROM channel ORDER BY next_follow_up_at IS NULL, next_follow_up_at ASC, updated_at DESC',
    )
    return rows.map(toDomain)
  },

  async findById(id: string): Promise<Channel | null> {
    const row = await db.queryOne<ChannelRow>('SELECT * FROM channel WHERE id = ?', [id])
    return row ? toDomain(row) : null
  },

  async create(input: ChannelCreateInput): Promise<Channel> {
    const id = nanoid()
    const now = new Date().toISOString()
    await db.execute(
      `INSERT INTO channel (
        id, agent_name, agent_owner, city, school_name, stage, lead_count,
        trial_count, paid_count, next_follow_up_at, note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.agentName,
        input.agentOwner,
        input.city,
        input.schoolName,
        input.stage,
        input.leadCount,
        input.trialCount,
        input.paidCount,
        input.nextFollowUpAt ?? null,
        input.note,
        now,
        now,
      ],
    )
    const created = await this.findById(id)
    if (!created) throw new Error('Failed to create channel record')
    return created
  },

  async update(id: string, input: ChannelUpdateInput): Promise<Channel | null> {
    const sets: string[] = []
    const params: unknown[] = []
    const fieldMap: Array<[keyof ChannelUpdateInput, string]> = [
      ['agentName', 'agent_name'],
      ['agentOwner', 'agent_owner'],
      ['city', 'city'],
      ['schoolName', 'school_name'],
      ['stage', 'stage'],
      ['leadCount', 'lead_count'],
      ['trialCount', 'trial_count'],
      ['paidCount', 'paid_count'],
      ['nextFollowUpAt', 'next_follow_up_at'],
      ['note', 'note'],
    ]
    for (const [inputKey, column] of fieldMap) {
      if (input[inputKey] !== undefined) {
        sets.push(`${column} = ?`)
        params.push(input[inputKey] ?? null)
      }
    }
    if (sets.length === 0) return this.findById(id)
    sets.push('updated_at = ?')
    params.push(new Date().toISOString())
    params.push(id)
    await db.execute(`UPDATE channel SET ${sets.join(', ')} WHERE id = ?`, params)
    return this.findById(id)
  },

  async remove(id: string): Promise<boolean> {
    const result = await db.execute('DELETE FROM channel WHERE id = ?', [id])
    return result.rowsAffected > 0
  },
}
