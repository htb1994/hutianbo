#!/usr/bin/env node
/**
 * Module structure, boundaries, and registration checks.
 * Usage: node check-modules.mjs [repoRoot]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  fail,
  pass,
  listDirs,
  walkFiles,
  readText,
  resolveRequiredFiles,
  extractImportPaths,
  pascalCase,
} from './_lib.mjs'

const ROOT = path.resolve(process.argv[2] ?? path.join(process.cwd(), '../..'))
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const anatomy = JSON.parse(readText(path.join(__dirname, '../references/module-anatomy.json')))

const BE_MODULES = path.join(ROOT, 'backend/src/modules')
const FE_MODULES = path.join(ROOT, 'frontend/src/modules')
const BE_ROUTES = path.join(ROOT, 'backend/src/routes.ts')
const FE_ROUTER = path.join(ROOT, 'frontend/src/router/index.ts')

const routesText = readText(BE_ROUTES)
const routerText = readText(FE_ROUTER)

function checkBackendModules() {
  for (const name of listDirs(BE_MODULES)) {
    const modDir = path.join(BE_MODULES, name)
    const missing = resolveRequiredFiles(modDir, name, anatomy.backend.requiredFiles)
    if (missing.length) {
      fail('MOD-ANATOMY', `backend module "${name}" missing: ${missing.join(', ')}`)
    }

    const files = walkFiles(modDir, '.ts')
    for (const file of files) {
      const rel = path.relative(modDir, file)
      const src = readText(file)
      const imports = extractImportPaths(src)

      for (const imp of imports) {
        const cross = imp.match(/modules\/([^/'"]+)/)
        if (cross && cross[1] !== name) {
          fail('MOD-XIMPORT', `${name}/${rel} imports another module: ${imp}`)
        }
        for (const forbidden of anatomy.backend.forbiddenImportsInModule) {
          if (imp.includes(forbidden)) {
            fail('MOD-BE-DRIVER', `${name}/${rel} imports forbidden driver: ${imp}`)
          }
        }
      }

      const layer = rel.split('/')[0] ?? rel
      const base = path.basename(file)
      if (base.endsWith('.service.ts') || base.endsWith('.controller.ts')) {
        const sqlPatterns = [
          /\bSELECT\s+.+\s+FROM\b/i,
          /\bINSERT\s+INTO\b/i,
          /\bUPDATE\s+\w+\s+SET\b/i,
          /\bDELETE\s+FROM\b/i,
        ]
        if (sqlPatterns.some((re) => re.test(src))) {
          fail('MOD-BE-SQL', `${name}/${rel} contains SQL (belongs in repository only)`)
        }
      }

      if (base.endsWith('.repository.ts') && /\$\d+/.test(src)) {
        fail('MOD-BE-SQL', `${name}/${rel} uses $N placeholders (use ? only)`)
      }
    }

    const importPatterns = [
      `modules/${name}`,
      `modules/${name}/index`,
      `./modules/${name}`,
    ]
    if (!importPatterns.some((p) => routesText.includes(p))) {
      fail('MOD-REGISTER-BE', `backend module "${name}" not registered in src/routes.ts`)
    }
  }
  pass(`backend modules (${listDirs(BE_MODULES).length}) anatomy + boundaries`)
}

function checkFrontendModules() {
  for (const name of listDirs(FE_MODULES)) {
    const modDir = path.join(FE_MODULES, name)
    const missing = resolveRequiredFiles(modDir, name, anatomy.frontend.requiredFiles)
    if (missing.length) {
      fail('MOD-ANATOMY', `frontend module "${name}" missing: ${missing.join(', ')}`)
    }

    const scanDirs = ['views', 'components', 'store', 'composables']
    for (const sub of scanDirs) {
      const subDir = path.join(modDir, sub)
      if (!fs.existsSync(subDir)) continue
      for (const file of walkFiles(subDir)) {
        if (!/\.(vue|ts)$/.test(file)) continue
        const src = readText(file)
        if (/\bfetch\s*\(/.test(src)) {
          fail('MOD-FE-FETCH', `${name}/${path.relative(modDir, file)} calls fetch() directly`)
        }
        if (/@\/utils\/request|from ['"]@\/utils\/request['"]/.test(src)) {
          fail('MOD-FE-HTTP', `${name}/${path.relative(modDir, file)} imports request outside api/`)
        }
      }
    }

    for (const file of walkFiles(modDir, '.ts')) {
      const rel = path.relative(modDir, file)
      if (rel.startsWith('api/')) continue
      const src = readText(file)
      const imports = extractImportPaths(src)
      for (const imp of imports) {
        const cross = imp.match(/modules\/([^/'"]+)/)
        if (cross && cross[1] !== name) {
          fail('MOD-XIMPORT', `frontend ${name}/${rel} imports module: ${imp}`)
        }
      }
    }

    const routeExport = `${name}Routes`
    const altExport = pascalCase(name) + 'Routes'
    if (!routerText.includes(routeExport) && !routerText.includes(altExport) && !routerText.includes(`modules/${name}`)) {
      fail('MOD-REGISTER-FE', `frontend module "${name}" routes not registered in router/index.ts`)
    }
  }
  pass(`frontend modules (${listDirs(FE_MODULES).length}) anatomy + boundaries`)
}

checkBackendModules()
checkFrontendModules()
