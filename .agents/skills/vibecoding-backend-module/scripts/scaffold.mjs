#!/usr/bin/env node
/**
 * Scaffold a new backend module from the todo template.
 * Usage: node scaffold.mjs <module-name>
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../../..')
const TEMPLATE = path.join(REPO_ROOT, 'backend/src/modules/todo')

const name = process.argv[2]
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: node scaffold.mjs <module-name>  (lowercase, e.g. note)')
  process.exit(1)
}

const Name = name.charAt(0).toUpperCase() + name.slice(1)
const TARGET = path.join(REPO_ROOT, 'backend/src/modules', name)

if (fs.existsSync(TARGET)) {
  console.error(`Module already exists: ${TARGET}`)
  process.exit(1)
}

function replaceAll(content) {
  return content
    .replace(/\btodo\b/g, name)
    .replace(/\bTodo\b/g, Name)
    .replace(/module-todo/g, `module-${name}`)
}

function nextMigrationPrefix() {
  let max = 0
  const modulesDir = path.join(REPO_ROOT, 'backend/src/modules')
  for (const mod of fs.readdirSync(modulesDir)) {
    for (const dialect of ['sqlite', 'pg']) {
      const dir = path.join(modulesDir, mod, 'migrations', dialect)
      if (!fs.existsSync(dir)) continue
      for (const f of fs.readdirSync(dir)) {
        const m = f.match(/^(\d{4})_/)
        if (m) max = Math.max(max, parseInt(m[1], 10))
      }
    }
  }
  return String(max + 1).padStart(4, '0')
}

function copyTree(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    let toName = entry.name.replace(/\btodo\b/g, name).replace(/\bTodo\b/g, Name)
    const to = path.join(dest, toName)
    if (entry.isDirectory()) {
      copyTree(from, to)
    } else {
      let content = fs.readFileSync(from, 'utf8')
      content = replaceAll(content)
      fs.writeFileSync(to, content)
    }
  }
}

copyTree(TEMPLATE, TARGET)

const prefix = nextMigrationPrefix()
for (const dialect of ['sqlite', 'pg']) {
  const dir = path.join(TARGET, 'migrations', dialect)
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.sql')) continue
    const newName = f.replace(/^\d{4}_create_todo\.sql$/, `${prefix}_create_${name}.sql`)
    if (newName !== f) {
      fs.renameSync(path.join(dir, f), path.join(dir, newName))
    }
  }
}

console.log(`Scaffolded backend module: backend/src/modules/${name}/`)
console.log(`Migration prefix: ${prefix}`)
console.log('')
console.log('Next steps:')
console.log(`  1. Edit ${name}.schema.ts for your API contract`)
console.log(`  2. Update migrations SQL (table: ${name})`)
console.log(`  3. Register in backend/src/routes.ts:`)
console.log(`     import ${name}Module from './modules/${name}'`)
console.log(`     await app.register(${name}Module)`)
console.log(`  4. Run: bash .agents/skills/vibecoding-verify/scripts/verify.sh`)
