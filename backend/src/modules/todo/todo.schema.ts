import { z } from 'zod'

/**
 * Schemas are the single source of truth for the wire format. Types used by
 * the rest of the module are inferred from these schemas via `z.infer`.
 */

export const TodoCreateSchema = z.object({
  title: z.string().min(1).max(120),
  done: z.boolean().optional().default(false),
})

export const TodoUpdateSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    done: z.boolean().optional(),
  })
  .refine((v) => v.title !== undefined || v.done !== undefined, {
    message: 'At least one of `title` or `done` is required',
  })

export const TodoIdSchema = z.object({
  id: z.string().min(1),
})

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
  createdAt: z.string(),
})

export type TodoCreateInput = z.infer<typeof TodoCreateSchema>
export type TodoUpdateInput = z.infer<typeof TodoUpdateSchema>
export type TodoIdParam = z.infer<typeof TodoIdSchema>
