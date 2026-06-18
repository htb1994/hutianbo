import { customAlphabet, nanoid as defaultNanoid } from 'nanoid'

/**
 * Default 21-char URL-safe ID. Use this for new entity IDs unless you have a
 * compelling reason to use a different generator.
 */
export const nanoid = defaultNanoid

/** Shorter (12 chars) human-readable ID, useful for display codes. */
export const shortId = customAlphabet('0123456789abcdefghjkmnpqrstvwxyz', 12)
