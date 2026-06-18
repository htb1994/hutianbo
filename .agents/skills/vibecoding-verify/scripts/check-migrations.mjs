#!/usr/bin/env node
/**
 * Migration pair, global numbering, and filename checks.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fail, pass, listDirs, walkFiles, readText } from './_lib.mjs'

const ROOT = path.resolve(process.argv[2] ?? path.join(process.cwd(), '../..'))
const BE_MODULES = path.join(ROOT, 'backend/src/modules')

const NAME_RE = /^\d{4}_[a-z0-9_]+\.sql$/
const entries = []

for (const mod of listDirs(BE_MODULES)) {
  const migRoot = path.join(BE_MODULES, mod, 'migrations')
  if (!fs.existsSync(migRoot)) continue

  for (const dialect of ['sqlite', 'pg']) {
    const dir = path.join(migRoot, dialect)
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.sql')) continue
      if (!NAME_RE.test(f)) {
        fail('MIG-NAME', `${mod}/migrations/${dialect}/${f} must match NNNN_snake.sql`)
      }
      entries.push({ mod, dialect, file: f, full: path.join(dir, f) })
    }
  }
}

const byFile = new Map()
for (const e of entries) {
  const key = e.file
  if (!byFile.has(key)) byFile.set(key, { sqlite: null, pg: null, mods: new Set() })
  const rec = byFile.get(key)
  if (e.dialect === 'sqlite') rec.sqlite = e.full
  if (e.dialect === 'pg') rec.pg = e.full
  rec.mods.add(e.mod)
}

for (const [file, rec] of byFile) {
  if (!rec.sqlite) fail('MIG-PAIR', `missing sqlite migration for ${file}`)
  if (!rec.pg) fail('MIG-PAIR', `missing pg migration for ${file}`)
  if (rec.mods.size > 1) {
    fail('MIG-GLOBAL', `migration ${file} appears in multiple modules: ${[...rec.mods].join(', ')}`)
  }
}

const prefixes = [...byFile.keys()]
  .map((f) => parseInt(f.slice(0, 4), 10))
  .sort((a, b) => a - b)

const seen = new Set()
for (const n of prefixes) {
  if (seen.has(n)) fail('MIG-GLOBAL', `duplicate migration prefix ${String(n).padStart(4, '0')}`)
  seen.add(n)
}

for (let i = 0; i < prefixes.length; i++) {
  const expected = i + 1
  if (prefixes[i] !== expected) {
    fail(
      'MIG-GLOBAL',
      `migration prefixes must be contiguous from 0001; expected ${String(expected).padStart(4, '0')} at index ${i}, got ${String(prefixes[i]).padStart(4, '0')}`,
    )
  }
}

for (const e of entries) {
  if (!e.full.includes('/modules/') || !e.full.includes('/migrations/')) {
    fail('MIG-MODULE', `migration outside module directory: ${e.full}`)
  }
}

pass(`migrations (${prefixes.length} global prefix(es), all paired)`)
