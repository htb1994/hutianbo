#!/usr/bin/env node
/**
 * API contract: backend prefix/schema/controller + frontend client + field alignment.
 */
import fs from 'node:fs'
import path from 'node:path'
import {
  fail,
  warn,
  pass,
  listDirs,
  readText,
  extractZodObjectKeys,
  extractInterfaceFields,
  pascalCase,
} from './_lib.mjs'

const ROOT = path.resolve(process.argv[2] ?? path.join(process.cwd(), '../..'))
const BE_MODULES = path.join(ROOT, 'backend/src/modules')
const FE_MODULES = path.join(ROOT, 'frontend/src/modules')

const beNames = new Set(listDirs(BE_MODULES))
const feNames = new Set(listDirs(FE_MODULES))

for (const name of beNames) {
  const modDir = path.join(BE_MODULES, name)
  const indexFile = path.join(modDir, 'index.ts')
  const schemaFile = path.join(modDir, `${name}.schema.ts`)
  const controllerFile = path.join(modDir, `${name}.controller.ts`)
  const routesFile = path.join(modDir, `${name}.routes.ts`)

  const indexSrc = readText(indexFile)
  const expectedPrefix = `/api/${name}`
  if (!indexSrc.includes(`'${expectedPrefix}'`) && !indexSrc.includes(`"${expectedPrefix}"`)) {
    fail('API-PREFIX', `backend module "${name}" must register prefix ${expectedPrefix} in index.ts`)
  }

  if (!fs.existsSync(schemaFile)) {
    fail('API-SCHEMA', `backend module "${name}" missing ${name}.schema.ts`)
  }
  const schemaSrc = readText(schemaFile)
  if (!/export\s+const\s+\w+Schema\s*=/.test(schemaSrc)) {
    fail('API-SCHEMA', `backend module "${name}" must export at least one *Schema from schema file`)
  }

  if (!fs.existsSync(controllerFile)) {
    fail('API-ZOD-PARSE', `backend module "${name}" missing controller`)
  } else {
    const ctrlSrc = readText(controllerFile)
    if (!/\.parse\s*\(/.test(ctrlSrc)) {
      fail('API-ZOD-PARSE', `backend module "${name}" controller must call schema.parse()`)
    }
    if (!ctrlSrc.includes('success(') || !ctrlSrc.includes('@/utils/response')) {
      fail('API-ENVELOPE', `backend module "${name}" controller must use success() from @/utils/response`)
    }
  }

  if (fs.existsSync(routesFile)) {
    const routesSrc = readText(routesFile)
    if (!/app\.(get|post|patch|put|delete)\s*\(/.test(routesSrc)) {
      fail('API-REST', `backend module "${name}" routes must register HTTP handlers`)
    }
  }
}

for (const name of feNames) {
  const apiFile = path.join(FE_MODULES, name, 'api/index.ts')
  const typesFile = path.join(FE_MODULES, name, 'types/index.ts')

  if (!fs.existsSync(apiFile)) {
    fail('API-CLIENT', `frontend module "${name}" missing api/index.ts`)
  } else {
    const apiSrc = readText(apiFile)
    if (!/http\.(get|post|patch|put|delete)\s*[<(]/.test(apiSrc)) {
      fail('API-CLIENT', `frontend module "${name}/api" must use http.get/post/patch/delete`)
    }
    const pathRe = /http\.\w+\s*<[^>]*>\s*\(\s*['"`]([^'"`]+)['"`]/g
    let pm
    while ((pm = pathRe.exec(apiSrc))) {
      const p = pm[1]
      if (!p.startsWith(`/${name}`) && !p.startsWith(`/${name}/`)) {
        fail('API-PATH', `frontend module "${name}" api path "${p}" must start with /${name}`)
      }
    }
  }

  if (!fs.existsSync(typesFile)) {
    fail('API-TYPES', `frontend module "${name}" missing types/index.ts`)
  }
}

for (const name of beNames) {
  if (!feNames.has(name)) {
    warn('API-ALIGN', `backend module "${name}" has no frontend counterpart`)
    continue
  }

  const schemaFile = path.join(BE_MODULES, name, `${name}.schema.ts`)
  const typesFile = path.join(FE_MODULES, name, 'types/index.ts')
  const schemaSrc = readText(schemaFile)
  const typesSrc = readText(typesFile)

  const schemaName = `${pascalCase(name)}Schema`
  let beFields = extractZodObjectKeys(schemaSrc, schemaName)
  if (beFields.length === 0) {
    const anySchema = schemaSrc.match(/export\s+const\s+(\w+Schema)\s*=\s*z\.object/)
    if (anySchema) {
      beFields = extractZodObjectKeys(schemaSrc, anySchema[1])
    }
  }

  const feFields = extractInterfaceFields(typesSrc, pascalCase(name))
  if (beFields.length === 0) {
    warn('API-ALIGN', `could not extract zod fields for ${name} response schema`)
    continue
  }
  if (feFields.length === 0) {
    fail('API-ALIGN', `frontend module "${name}" types missing ${pascalCase(name)} interface fields`)
  }

  const missing = beFields.filter((f) => !feFields.includes(f))
  if (missing.length) {
    fail(
      'API-ALIGN',
      `frontend module "${name}" types missing backend schema fields: ${missing.join(', ')}`,
    )
  }
}

for (const name of feNames) {
  if (!beNames.has(name)) {
    warn('API-ALIGN', `frontend module "${name}" has no backend counterpart`)
  }
}

pass(`API contracts (backend ${beNames.size}, frontend ${feNames.size})`)
