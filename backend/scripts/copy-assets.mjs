// Copy non-TS assets (currently: module migration .sql files) from `src/`
// into `dist/` so the built migrator can locate them at runtime.
//
// This script is portable across macOS / Linux / Windows.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(here, '..', 'src')
const DIST = path.resolve(here, '..', 'dist')

/** Recursively copy `src` into `dest`, keeping only files matching `predicate`. */
function copyTree(src, dest, predicate) {
  if (!fs.existsSync(src)) return 0
  const entries = fs.readdirSync(src, { withFileTypes: true })
  let count = 0
  for (const entry of entries) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      count += copyTree(from, to, predicate)
    } else if (predicate(from)) {
      fs.mkdirSync(dest, { recursive: true })
      fs.copyFileSync(from, to)
      count += 1
    }
  }
  return count
}

const isMigration = (file) => /[\\/]migrations[\\/].+\.sql$/.test(file)
const copied = copyTree(SRC, DIST, isMigration)
console.log(`copy-assets: ${copied} migration file(s) copied.`)
