import { db } from '@/db'
import { nanoid } from '@/utils/id'
import type { Todo, TodoRow } from './todo.types'
import type { TodoCreateInput, TodoUpdateInput } from './todo.schema'

/**
 * Repositories own SQL. Use `?` placeholders only — the pg adapter rewrites
 * them to `$N`. Booleans are stored as 0/1 (sqlite) or BOOLEAN (pg); the
 * `toDomain` helper normalises rows back into the domain `Todo` type.
 */

function toDomain(row: TodoRow): Todo {
  const created = row.created_at
  return {
    id: row.id,
    title: row.title,
    done: typeof row.done === 'number' ? row.done !== 0 : Boolean(row.done),
    createdAt: created instanceof Date ? created.toISOString() : created,
  }
}

export const todoRepository = {
  async list(): Promise<Todo[]> {
    const rows = await db.query<TodoRow>('SELECT * FROM todo ORDER BY created_at DESC')
    return rows.map(toDomain)
  },

  async findById(id: string): Promise<Todo | null> {
    const row = await db.queryOne<TodoRow>('SELECT * FROM todo WHERE id = ?', [id])
    return row ? toDomain(row) : null
  },

  async create(input: TodoCreateInput): Promise<Todo> {
    const id = nanoid()
    const createdAt = new Date().toISOString()
    const done = input.done ? 1 : 0
    await db.execute(
      'INSERT INTO todo (id, title, done, created_at) VALUES (?, ?, ?, ?)',
      [id, input.title, done, createdAt],
    )
    return { id, title: input.title, done: Boolean(input.done), createdAt }
  },

  async update(id: string, input: TodoUpdateInput): Promise<Todo | null> {
    const sets: string[] = []
    const params: unknown[] = []
    if (input.title !== undefined) {
      sets.push('title = ?')
      params.push(input.title)
    }
    if (input.done !== undefined) {
      sets.push('done = ?')
      params.push(input.done ? 1 : 0)
    }
    if (sets.length === 0) return this.findById(id)
    params.push(id)
    await db.execute(`UPDATE todo SET ${sets.join(', ')} WHERE id = ?`, params)
    return this.findById(id)
  },

  async remove(id: string): Promise<boolean> {
    const result = await db.execute('DELETE FROM todo WHERE id = ?', [id])
    return result.rowsAffected > 0
  },
}
