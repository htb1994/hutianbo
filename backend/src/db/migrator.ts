import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from '@/config/env'
import { logger } from '@/utils/logger'
import { createSqliteAdapter } from './adapters/sqlite.adapter'
import { createPgAdapter } from './adapters/pg.adapter'
import type { Database, Dialect } from './types'

interface MigrationFile {
  /** Filename, e.g. `0001_create_todo.sql`. Globally unique across modules. */
  name: string
  /** Module that owns this migration, e.g. `todo`. */
  module: string
  /** Absolute path to the .sql file. */
  fullPath: string
}

const MIGRATIONS_TABLE_DDL: Record<Dialect, string> = {
  sqlite: `CREATE TABLE IF NOT EXISTS _migrations (
    name        TEXT PRIMARY KEY,
    module      TEXT NOT NULL,
    applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );`,
  postgres: `CREATE TABLE IF NOT EXISTS _migrations (
    name        TEXT PRIMARY KEY,
    module      TEXT NOT NULL,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
}

/** Compute the modules directory in a way that works under tsx and after build. */
function modulesDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(here, '..', 'modules')
}

function discoverMigrations(dialect: Dialect): MigrationFile[] {
  const root = modulesDir()
  if (!fs.existsSync(root)) return []
  const files: MigrationFile[] = []
  for (const moduleName of fs.readdirSync(root)) {
    const dir = path.join(root, moduleName, 'migrations', dialect)
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.sql')) continue
      files.push({ name: f, module: moduleName, fullPath: path.join(dir, f) })
    }
  }
  files.sort((a, b) => a.name.localeCompare(b.name))
  return files
}

async function ensureMigrationsTable(db: Database): Promise<void> {
  await db.execute(MIGRATIONS_TABLE_DDL[db.dialect])
}

async function appliedSet(db: Database): Promise<Set<string>> {
  const rows = await db.query<{ name: string }>('SELECT name FROM _migrations')
  return new Set(rows.map((r) => r.name))
}

/**
 * Apply all pending migrations against `db`. Idempotent. Used both by the
 * CLI (`db:migrate`) and, in development with sqlite, automatically on boot
 * from `initDb()`.
 *
 * Each migration runs in its own transaction; on failure the transaction is
 * rolled back and the migrator throws.
 */
export async function runMigrations(db: Database): Promise<{ applied: string[] }> {
  await ensureMigrationsTable(db)
  const already = await appliedSet(db)
  const all = discoverMigrations(db.dialect)
  const pending = all.filter((m) => !already.has(m.name))

  const applied: string[] = []
  for (const mig of pending) {
    const sql = fs.readFileSync(mig.fullPath, 'utf8')
    logger.info({ migration: mig.name, module: mig.module }, 'applying migration')
    await db.transaction(async (tx) => {
      await tx.executeScript(sql)
      await tx.execute('INSERT INTO _migrations (name, module) VALUES (?, ?)', [
        mig.name,
        mig.module,
      ])
    })
    applied.push(mig.name)
  }
  if (applied.length > 0) logger.info({ applied }, 'migrations applied')
  else logger.info('no pending migrations')
  return { applied }
}

export async function migrationStatus(
  db: Database,
): Promise<{ applied: string[]; pending: string[] }> {
  await ensureMigrationsTable(db)
  const already = await appliedSet(db)
  const all = discoverMigrations(db.dialect)
  return {
    applied: [...already].sort(),
    pending: all.filter((m) => !already.has(m.name)).map((m) => m.name),
  }
}

// =====================================================
// CLI: `tsx src/db/migrator.ts up | status`
// =====================================================
async function main() {
  const cmd = process.argv[2] ?? 'up'
  const db: Database =
    env.DB_DIALECT === 'sqlite'
      ? await createSqliteAdapter({ file: env.DB_SQLITE_FILE })
      : await createPgAdapter({ url: env.DATABASE_URL! })

  try {
    if (cmd === 'up') {
      const { applied } = await runMigrations(db)
      logger.info({ count: applied.length }, 'migrate up done')
    } else if (cmd === 'status') {
      const status = await migrationStatus(db)
      logger.info(status, 'migration status')
    } else {
      logger.error({ cmd }, 'unknown command. use "up" or "status"')
      process.exitCode = 1
    }
  } finally {
    await db.close()
  }
}

const invokedFile = process.argv[1] ? path.basename(process.argv[1]) : ''
const isCli = invokedFile === 'migrator.ts' || invokedFile === 'migrator.js'

if (isCli) {
  main().catch((err) => {
    logger.error({ err }, 'migrator failed')
    process.exit(1)
  })
}
