import path from 'node:path'
import fs from 'node:fs'
import BetterSqlite3, { type Database as SqliteDb } from 'better-sqlite3'
import type { Database as DbInterface, QueryResult } from '../types'

export interface SqliteAdapterOptions {
  file: string
}

/**
 * Wraps the synchronous `better-sqlite3` driver behind the async `Database`
 * interface. Synchronous calls are wrapped in `Promise.resolve` for a uniform
 * API; this is intentional and has no measurable cost.
 */
export async function createSqliteAdapter(options: SqliteAdapterOptions): Promise<DbInterface> {
  const file = path.resolve(options.file)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const conn: SqliteDb = new BetterSqlite3(file)
  conn.pragma('journal_mode = WAL')
  conn.pragma('foreign_keys = ON')

  function makeApi(executor: SqliteDb): DbInterface {
    return {
      dialect: 'sqlite',
      async query<T>(sql: string, params: unknown[] = []) {
        return executor.prepare(sql).all(...(params as never[])) as T[]
      },
      async queryOne<T>(sql: string, params: unknown[] = []) {
        const row = executor.prepare(sql).get(...(params as never[])) as T | undefined
        return row ?? null
      },
      async execute(sql: string, params: unknown[] = []): Promise<QueryResult> {
        const info = executor.prepare(sql).run(...(params as never[]))
        return {
          rowsAffected: info.changes,
          lastInsertId:
            typeof info.lastInsertRowid === 'bigint'
              ? Number(info.lastInsertRowid)
              : info.lastInsertRowid,
        }
      },
      async executeScript(sql: string) {
        executor.exec(sql)
      },
      async transaction<T>(fn: (tx: DbInterface) => Promise<T>) {
        executor.exec('BEGIN')
        try {
          const result = await fn(makeApi(executor))
          executor.exec('COMMIT')
          return result
        } catch (err) {
          executor.exec('ROLLBACK')
          throw err
        }
      },
      async close() {
        executor.close()
      },
    }
  }

  return makeApi(conn)
}
