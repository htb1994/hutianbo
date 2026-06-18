/**
 * Typed wrapper around `localStorage` / `sessionStorage` with optional TTL.
 * Stored payload shape: `{ v: T, e?: number }` where `e` is an absolute
 * expiration timestamp (ms). Returns `null` when the key is missing or expired.
 */

type StorageKind = 'local' | 'session'

interface StoredEnvelope<T> {
  v: T
  e?: number
}

function backend(kind: StorageKind): Storage {
  return kind === 'session' ? window.sessionStorage : window.localStorage
}

export interface StorageOptions {
  /** Time-to-live in milliseconds. */
  ttl?: number
  kind?: StorageKind
}

export function setItem<T>(key: string, value: T, options: StorageOptions = {}): void {
  const { ttl, kind = 'local' } = options
  const envelope: StoredEnvelope<T> = { v: value }
  if (ttl != null) envelope.e = Date.now() + ttl
  backend(kind).setItem(key, JSON.stringify(envelope))
}

export function getItem<T>(key: string, options: { kind?: StorageKind } = {}): T | null {
  const { kind = 'local' } = options
  const raw = backend(kind).getItem(key)
  if (raw == null) return null
  try {
    const env = JSON.parse(raw) as StoredEnvelope<T>
    if (env.e != null && Date.now() > env.e) {
      backend(kind).removeItem(key)
      return null
    }
    return env.v
  } catch {
    return null
  }
}

export function removeItem(key: string, options: { kind?: StorageKind } = {}): void {
  backend(options.kind ?? 'local').removeItem(key)
}

export function clearStorage(options: { kind?: StorageKind } = {}): void {
  backend(options.kind ?? 'local').clear()
}

export const storage = { setItem, getItem, removeItem, clearStorage }
