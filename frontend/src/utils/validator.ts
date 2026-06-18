/**
 * Common field validators. Each returns a boolean. Combine in your own
 * higher-order rule when you need messages or async checks.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CN_PHONE_RE = /^1[3-9]\d{9}$/
const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i

export const isEmail = (s: string) => EMAIL_RE.test(s.trim())
export const isCnPhone = (s: string) => CN_PHONE_RE.test(s.trim())
export const isUrl = (s: string) => URL_RE.test(s.trim())
export const isNonEmpty = (s: unknown) =>
  s != null && (typeof s === 'string' ? s.trim().length > 0 : true)
export const lengthBetween = (s: string, min: number, max: number) =>
  s.length >= min && s.length <= max

export const validator = { isEmail, isCnPhone, isUrl, isNonEmpty, lengthBetween }
