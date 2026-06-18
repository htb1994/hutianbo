/**
 * Lightweight fetch wrapper. The single allowed entry point for backend HTTP
 * traffic in this app. Module `api/*` files MUST go through `request()`; views
 * and stores must NOT call `fetch` directly (see top-level AGENTS.md).
 *
 * Backend response contract: `{ code: number, data: T, message: string }`.
 * Non-zero `code` is mapped to a thrown `ApiError`.
 */

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export class ApiError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Plain object that will be JSON-stringified into the request body. */
  body?: unknown
  /** Query parameters appended to the URL. `undefined` values are skipped. */
  query?: Record<string, string | number | boolean | undefined | null>
  /** Optional `AbortSignal` for cancellation. */
  signal?: AbortSignal
  /** Override base URL (rarely needed). */
  baseURL?: string
}

const DEFAULT_BASE_URL = '/api'

function buildUrl(input: string, query?: RequestOptions['query'], baseURL = DEFAULT_BASE_URL) {
  const url = input.startsWith('http') ? input : `${baseURL}${input.startsWith('/') ? '' : '/'}${input}`
  if (!query) return url
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue
    search.append(k, String(v))
  }
  const qs = search.toString()
  return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url
}

export async function request<T>(input: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, baseURL, headers, ...rest } = options
  const url = buildUrl(input, query, baseURL)
  const isJsonBody = body !== undefined && !(body instanceof FormData)

  const res = await fetch(url, {
    ...rest,
    headers: {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      Accept: 'application/json',
      ...headers,
    },
    body: isJsonBody ? JSON.stringify(body) : (body as BodyInit | undefined),
  })

  let payload: ApiResponse<T> | undefined
  try {
    payload = (await res.json()) as ApiResponse<T>
  } catch {
    if (!res.ok) throw new ApiError(res.status, res.statusText || 'Network error', res.status)
    throw new ApiError(-1, 'Invalid JSON response', res.status)
  }

  if (!res.ok) {
    throw new ApiError(payload?.code ?? res.status, payload?.message ?? res.statusText, res.status)
  }
  if (payload && payload.code !== 0) {
    throw new ApiError(payload.code, payload.message, res.status)
  }
  return payload!.data
}

export const http = {
  get: <T>(url: string, opts?: RequestOptions) => request<T>(url, { ...opts, method: 'GET' }),
  post: <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: 'POST', body }),
  patch: <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: 'PATCH', body }),
  put: <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: 'PUT', body }),
  delete: <T>(url: string, opts?: RequestOptions) => request<T>(url, { ...opts, method: 'DELETE' }),
}
