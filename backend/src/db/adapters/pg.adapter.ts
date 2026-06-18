import { Pool, type PoolClient } from 'pg'
import type { Database as DbInterface, QueryResult } from '../types'

export interface PgAdapterOptions {
  url: string
  max?: number
}

/**
 * Translates `?, ?, ?` placeholders into `$1, $2, $3` for `pg`. Module code
 * always writes `?` style; this rewriter keeps repositories portable.
 *
 * Quoting is respected: `?` inside a string literal or identifier is kept
 * verbatim. SQL comments are preserved (both `--` line comments and block
 * comments delimited by slash-star ... star-slash).
 */
export function normalizePlaceholders(sql: string): string {
  let out = ''
  let i = 0
  let n = 1
  const len = sql.length

  const peek = (offset: number) => (i + offset < len ? sql[i + offset] : '')

  while (i < len) {
    const ch = sql[i]

    if (ch === "'" || ch === '"') {
      const quote = ch
      out += ch
      i++
      while (i < len) {
        const c = sql[i]
        out += c
        i++
        if (c === quote) {
          if (sql[i] === quote) {
            out += quote
            i++
            continue
          }
          break
        }
      }
      continue
    }

    if (ch === '-' && peek(1) === '-') {
      while (i < len && sql[i] !== '\n') {
        out += sql[i]
        i++
      }
      continue
    }

    if (ch === '/' && peek(1) === '*') {
      out += '/*'
      i += 2
      while (i < len && !(sql[i] === '*' && peek(1) === '/')) {
        out += sql[i]
        i++
      }
      if (i < len) {
        out += '*/'
        i += 2
      }
      continue
    }

    if (ch === '?') {
      out += `$${n++}`
      i++
      continue
    }

    out += ch
    i++
  }

  return out
}

export async function createPgAdapter(options: PgAdapterOptions): Promise<DbInterface> {
  const pool = new Pool({ connectionString: options.url, max: options.max ?? 10 })

  function makeApi(executor: Pool | PoolClient): DbInterface {
    return {
      dialect: 'postgres',
      async query<T>(sql: string, params: unknown[] = []) {
        const res = await executor.query(normalizePlaceholders(sql), params)
        return res.rows as T[]
      },
      async queryOne<T>(sql: string, params: unknown[] = []) {
        const res = await executor.query(normalizePlaceholders(sql), params)
        return (res.rows[0] as T | undefined) ?? null
      },
      async execute(sql: string, params: unknown[] = []): Promise<QueryResult> {
        const res = await executor.query(normalizePlaceholders(sql), params)
        return { rowsAffected: res.rowCount ?? 0 }
      },
      async executeScript(sql: string) {
        // pg accepts multiple `;`-separated statements in a single query.
        await executor.query(sql)
      },
      async transaction<T>(fn: (tx: DbInterface) => Promise<T>) {
        const client = await pool.connect()
        try {
          await client.query('BEGIN')
          const result = await fn(makeApi(client))
          await client.query('COMMIT')
          return result
        } catch (err) {
          await client.query('ROLLBACK')
          throw err
        } finally {
          client.release()
        }
      },
      async close() {
        if (executor === pool) await pool.end()
      },
    }
  }

  return makeApi(pool)
}
