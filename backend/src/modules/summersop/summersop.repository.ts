import { db } from '@/db'
import { nanoid } from '@/utils/id'
import type { SummerSop, SummerSopRow } from './summersop.types'
import type { SummerSopCreateInput, SummerSopUpdateInput } from './summersop.schema'

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}

function parseChecklist(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function toDomain(row: SummerSopRow): SummerSop {
  return {
    id: row.id,
    stage: row.stage,
    grade: row.grade,
    goal: row.goal,
    tone: row.tone,
    topic: row.topic,
    communityNotice: row.community_notice,
    groupScript: row.group_script,
    momentsCopy: row.moments_copy,
    privateChatScript: row.private_chat_script,
    executionChecklist: parseChecklist(row.execution_checklist),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

export const summerSopRepository = {
  async list(): Promise<SummerSop[]> {
    const rows = await db.query<SummerSopRow>('SELECT * FROM summer_sop ORDER BY created_at DESC')
    return rows.map(toDomain)
  },

  async findById(id: string): Promise<SummerSop | null> {
    const row = await db.queryOne<SummerSopRow>('SELECT * FROM summer_sop WHERE id = ?', [id])
    return row ? toDomain(row) : null
  },

  async create(input: SummerSopCreateInput, generated: Omit<SummerSop, 'id' | 'createdAt' | 'updatedAt'>): Promise<SummerSop> {
    const id = nanoid()
    const now = new Date().toISOString()
    await db.execute(
      `INSERT INTO summer_sop (
        id, stage, grade, goal, tone, topic, community_notice, group_script,
        moments_copy, private_chat_script, execution_checklist, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.stage,
        input.grade,
        input.goal,
        input.tone,
        input.topic,
        generated.communityNotice,
        generated.groupScript,
        generated.momentsCopy,
        generated.privateChatScript,
        JSON.stringify(generated.executionChecklist),
        now,
        now,
      ],
    )
    const created = await this.findById(id)
    if (!created) throw new Error('Failed to create summer SOP')
    return created
  },

  async update(id: string, input: SummerSopUpdateInput): Promise<SummerSop | null> {
    const sets: string[] = []
    const params: unknown[] = []
    const fieldMap: Array<[keyof SummerSopUpdateInput, string]> = [
      ['stage', 'stage'],
      ['grade', 'grade'],
      ['goal', 'goal'],
      ['tone', 'tone'],
      ['topic', 'topic'],
      ['communityNotice', 'community_notice'],
      ['groupScript', 'group_script'],
      ['momentsCopy', 'moments_copy'],
      ['privateChatScript', 'private_chat_script'],
      ['executionChecklist', 'execution_checklist'],
    ]
    for (const [inputKey, column] of fieldMap) {
      if (input[inputKey] !== undefined) {
        sets.push(`${column} = ?`)
        const value = input[inputKey]
        params.push(Array.isArray(value) ? JSON.stringify(value) : value)
      }
    }
    if (sets.length === 0) return this.findById(id)
    sets.push('updated_at = ?')
    params.push(new Date().toISOString(), id)
    await db.execute(`UPDATE summer_sop SET ${sets.join(', ')} WHERE id = ?`, params)
    return this.findById(id)
  },

  async remove(id: string): Promise<boolean> {
    const result = await db.execute('DELETE FROM summer_sop WHERE id = ?', [id])
    return result.rowsAffected > 0
  },
}
