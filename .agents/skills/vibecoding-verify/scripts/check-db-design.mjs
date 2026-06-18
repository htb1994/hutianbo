#!/usr/bin/env node
/**
 * SQL DDL design rules for sqlite and pg migration files.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fail, pass, listDirs } from './_lib.mjs'
import { readText } from './_lib.mjs'

const ROOT = path.resolve(process.argv[2] ?? path.join(process.cwd(), '../..'))
const BE_MODULES = path.join(ROOT, 'backend/src/modules')

let checked = 0

for (const mod of listDirs(BE_MODULES)) {
  const migRoot = path.join(BE_MODULES, mod, 'migrations')
  if (!fs.existsSync(migRoot)) continue

  for (const dialect of ['sqlite', 'pg']) {
    const dir = path.join(migRoot, dialect)
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.sql'))) {
      checked++
      const sql = readText(path.join(dir, f))
      const label = `${mod}/migrations/${dialect}/${f}`

      if (/\bAUTOINCREMENT\b/i.test(sql)) {
        fail('DB-NO-AI', `${label} uses AUTOINCREMENT`)
      }

      if (dialect === 'pg' && /\b(SERIAL|BIGSERIAL)\b/i.test(sql) && /PRIMARY\s+KEY/i.test(sql)) {
        fail('DB-NO-AI', `${label} uses SERIAL/BIGSERIAL as primary key`)
      }

      if (dialect === 'sqlite' && /\bBOOLEAN\b/i.test(sql)) {
        fail('DB-BOOL', `${label} uses BOOLEAN (sqlite should use INTEGER 0/1)`)
      }

      if (dialect === 'pg' && /\bJSONB\b/i.test(sql)) {
        fail('DB-JSON', `${label} uses JSONB (use TEXT for cross-dialect compatibility)`)
      }

      const createRe = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\)/gi
      let cm
      while ((cm = createRe.exec(sql))) {
        const table = cm[1]
        const body = cm[2]
        if (!/^[a-z][a-z0-9_]*$/.test(table)) {
          fail('DB-TABLE', `${label} table "${table}" must be snake_case`)
        }
        if (!/\bid\s+TEXT\s+PRIMARY\s+KEY\b/i.test(body)) {
          fail('DB-ID', `${label} table "${table}" must declare id TEXT PRIMARY KEY`)
        }
        if (/\bdone\b/i.test(body)) {
          if (dialect === 'sqlite' && !/\bdone\s+INTEGER\b/i.test(body)) {
            fail('DB-BOOL', `${label} column done should be INTEGER in sqlite`)
          }
          if (dialect === 'pg' && !/\bdone\s+BOOLEAN\b/i.test(body)) {
            fail('DB-BOOL', `${label} column done should be BOOLEAN in pg`)
          }
        }
        if (/\bcreated_at\b/i.test(body)) {
          if (dialect === 'sqlite' && !/\bcreated_at\s+TEXT\b/i.test(body)) {
            fail('DB-TIME', `${label} column created_at should be TEXT in sqlite`)
          }
          if (dialect === 'pg' && !/\bcreated_at\s+TIMESTAMPTZ\b/i.test(body)) {
            fail('DB-TIME', `${label} column created_at should be TIMESTAMPTZ in pg`)
          }
        }
      }
    }
  }
}

pass(`database DDL rules (${checked} migration file(s) checked)`)
