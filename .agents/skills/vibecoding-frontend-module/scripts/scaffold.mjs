#!/usr/bin/env node
/**
 * Scaffold a new frontend module from the todo template.
 * Usage: node scaffold.mjs <module-name>
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../../..')
const TEMPLATE = path.join(REPO_ROOT, 'frontend/src/modules/todo')

const name = process.argv[2]
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: node scaffold.mjs <module-name>  (lowercase, e.g. note)')
  process.exit(1)
}

const Name = name.charAt(0).toUpperCase() + name.slice(1)
const TARGET = path.join(REPO_ROOT, 'frontend/src/modules', name)

if (fs.existsSync(TARGET)) {
  console.error(`Module already exists: ${TARGET}`)
  process.exit(1)
}

function replaceAll(content) {
  return content
    .replace(/\btodo\b/g, name)
    .replace(/\bTodo\b/g, Name)
    .replace(/todo-list/g, `${name}-list`)
    .replace(/todo-detail/g, `${name}-detail`)
}

function copyTree(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    let toName = entry.name.replace(/\bTodo\b/g, Name).replace(/\btodo\b/g, name)
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

console.log(`Scaffolded frontend module: frontend/src/modules/${name}/`)
console.log('')
console.log('Next steps:')
console.log(`  1. Align types/index.ts fields with backend ${Name}Schema`)
console.log(`  2. Update api/index.ts paths (must start with /${name})`)
console.log(`  3. Register in frontend/src/router/index.ts:`)
console.log(`     import { ${name}Routes } from '@/modules/${name}'`)
console.log(`     ...${name}Routes in layout children`)
console.log(`  4. Run: bash .agents/skills/vibecoding-verify/scripts/verify.sh`)
