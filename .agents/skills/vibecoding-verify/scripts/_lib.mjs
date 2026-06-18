import fs from 'node:fs'
import path from 'node:path'

export function fail(code, message) {
  console.error(`[ARCH] ${code}: ${message}`)
  process.exit(1)
}

export function warn(code, message) {
  console.warn(`[ARCH] WARN ${code}: ${message}`)
}

export function pass(label) {
  console.log(`[ARCH] OK: ${label}`)
}

export function listDirs(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
}

export function walkFiles(dir, ext = null) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkFiles(full, ext))
    else if (!ext || full.endsWith(ext)) out.push(full)
  }
  return out
}

export function readText(file) {
  return fs.readFileSync(file, 'utf8')
}

export function globOne(dir, pattern) {
  // pattern like "migrations/sqlite/*.sql" relative to moduleDir
  const parts = pattern.split('/')
  let current = dir
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]
    if (p === '*') break
    if (p.includes('*')) {
      const re = new RegExp('^' + p.replace(/\*/g, '.*') + '$')
      const matches = fs.readdirSync(current).filter((f) => re.test(f))
      return matches.map((m) => path.join(current, m))
    }
    current = path.join(current, p)
    if (!fs.existsSync(current)) return []
  }
  const last = parts[parts.length - 1]
  if (last.includes('*')) {
    const re = new RegExp('^' + last.replace(/\*/g, '.*') + '$')
    return fs.readdirSync(current).filter((f) => re.test(f)).map((f) => path.join(current, f))
  }
  return fs.existsSync(current) ? [current] : []
}

export function resolveRequiredFiles(moduleDir, name, patterns) {
  const missing = []
  for (const pat of patterns) {
    const resolved = pat.replace(/\{name\}/g, name)
    const matches = globOne(moduleDir, resolved)
    if (matches.length === 0) missing.push(resolved)
  }
  return missing
}

export function extractImportPaths(source) {
  const paths = []
  const re = /from\s+['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(source))) paths.push(m[1])
  return paths
}

export function extractZodObjectKeys(source, schemaName) {
  const re = new RegExp(
    `export\\s+const\\s+${schemaName}\\s*=\\s*z\\.object\\(\\{([\\s\\S]*?)\\}\\)`,
  )
  const m = source.match(re)
  if (!m) return []
  const body = m[1]
  const keys = []
  const keyRe = /^\s*(\w+)\s*:/gm
  let km
  while ((km = keyRe.exec(body))) keys.push(km[1])
  return keys
}

export function extractInterfaceFields(source, ifaceName = null) {
  let block
  if (ifaceName) {
    const re = new RegExp(`export\\s+interface\\s+${ifaceName}\\s*\\{([\\s\\S]*?)\\}`)
    const m = source.match(re)
    if (!m) return []
    block = m[1]
  } else {
    const m = source.match(/export\s+interface\s+\w+\s*\{([\s\S]*?)\}/)
    if (!m) return []
    block = m[1]
  }
  const keys = []
  const keyRe = /^\s*(\w+)\??\s*:/gm
  let km
  while ((km = keyRe.exec(block))) keys.push(km[1])
  return keys
}

export function pascalCase(name) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}
