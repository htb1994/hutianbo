import type { z } from 'zod'
import type { TodoSchema } from './todo.schema'

export type Todo = z.infer<typeof TodoSchema>

/** Database row shape — booleans are stored as 0/1 in sqlite. */
export interface TodoRow {
  id: string
  title: string
  done: number | boolean
  created_at: string | Date
}
