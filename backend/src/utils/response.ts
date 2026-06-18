/**
 * Unified API response shape. Controllers should return values via
 * `success(data)`; the error handler emits `fail(...)` automatically.
 */
export interface ApiResponse<T> {
  code: number
  data: T | null
  message: string
}

export function success<T>(data: T, message = 'OK'): ApiResponse<T> {
  return { code: 0, data, message }
}

export function fail(code: number, message: string): ApiResponse<null> {
  return { code, data: null, message }
}
