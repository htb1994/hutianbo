/**
 * Formatters for date, number and currency. No third-party dependency.
 */

const PAD = (n: number, w = 2) => String(n).padStart(w, '0')

/**
 * Format a `Date | number | string` to `YYYY-MM-DD HH:mm:ss`-style strings.
 * Pattern tokens: YYYY, MM, DD, HH, mm, ss.
 */
export function formatDate(input: Date | number | string, pattern = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  return pattern
    .replace('YYYY', String(d.getFullYear()))
    .replace('MM', PAD(d.getMonth() + 1))
    .replace('DD', PAD(d.getDate()))
    .replace('HH', PAD(d.getHours()))
    .replace('mm', PAD(d.getMinutes()))
    .replace('ss', PAD(d.getSeconds()))
}

/** Format a number with thousands separators and fixed decimals. */
export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '-'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Format a currency amount (default CNY). */
export function formatCurrency(value: number, currency = 'CNY', locale = 'zh-CN'): string {
  if (!Number.isFinite(value)) return '-'
  return value.toLocaleString(locale, { style: 'currency', currency })
}

/** Truncate a string with an ellipsis when longer than `max`. */
export function truncate(input: string, max = 32, suffix = '...'): string {
  if (input.length <= max) return input
  return input.slice(0, Math.max(0, max - suffix.length)) + suffix
}
