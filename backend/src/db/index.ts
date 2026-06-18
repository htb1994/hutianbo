import { env } from '@/config/env'
import { createSqliteAdapter } from './adapters/sqlite.adapter'
import { createPgAdapter } from './adapters/pg.adapter'
import { runMigrations } from './migrator'
import type { Database } from './types'

let _db: Database | null = null

/**
 * Lazy-resolved singleton. Repository code can `import { db } from '@/db'`
 * at module scope; the actual driver is bound when `initDb()` runs at boot.
 * Accessing methods before init throws a clear error.
 */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    if (!_db) throw new Error('Database not initialized. Call initDb() first.')
    return Reflect.get(_db, prop, _db)
  },
})

export async function initDb(): Promise<void> {
  if (_db) return
  _db =
    env.DB_DIALECT === 'sqlite'
      ? await createSqliteAdapter({ file: env.DB_SQLITE_FILE })
      : await createPgAdapter({ url: env.DATABASE_URL! })

  if (env.DB_DIALECT === 'sqlite') {
    await runMigrations(_db)
  }
}

export async function closeDb(): Promise<void> {
  if (!_db) return
  await _db.close()
  _db = null
}

export type { Database } from './types'
