const DEFAULT_SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'authorization',
  'apiKey',
  'api_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'credential',
  'credentials',
  'private_key',
  'privateKey',
]

const DEFAULT_MASK_PATTERN = '[REDACTED]'
const DEFAULT_MAX_BODY_LENGTH = 2048

/**
 * Safely stringify an object, handling circular references
 */
export function safeStringify(obj: unknown, maxLength?: number): string {
  if (obj === undefined || obj === null) {
    return ''
  }

  try {
    const seen = new WeakSet()
    const result = JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]'
        }
        seen.add(value)
      }
      return value
    })

    if (maxLength && result.length > maxLength) {
      return result.substring(0, maxLength) + '...[TRUNCATED]'
    }

    return result
  } catch {
    return '[Unserializable]'
  }
}

/**
 * Mask sensitive fields in an object or array
 */
export function maskSensitiveData<T>(
  data: T,
  sensitiveFields: string[] = DEFAULT_SENSITIVE_FIELDS,
  maskPattern: string = DEFAULT_MASK_PATTERN
): T {
  if (!data || typeof data !== 'object') {
    return data
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) =>
      maskSensitiveData(item, sensitiveFields, maskPattern)
    ) as T
  }

  const masked = { ...data } as Record<string, unknown>
  const lowerCaseSensitiveFields = sensitiveFields.map((f) => f.toLowerCase())

  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase()

    if (lowerCaseSensitiveFields.some((field) => lowerKey.includes(field))) {
      masked[key] = maskPattern
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(
        masked[key] as Record<string, unknown>,
        sensitiveFields,
        maskPattern
      )
    }
  }

  return masked as T
}

/**
 * Sanitize and truncate a payload for logging
 */
export function sanitizePayload(
  payload: unknown,
  options: {
    maxLength?: number
    sensitiveFields?: string[]
    maskPattern?: string
  } = {}
): string {
  const {
    maxLength = DEFAULT_MAX_BODY_LENGTH,
    sensitiveFields = DEFAULT_SENSITIVE_FIELDS,
    maskPattern = DEFAULT_MASK_PATTERN,
  } = options

  if (payload === undefined || payload === null) {
    return ''
  }

  // If already a string, try to parse and sanitize
  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload)
      const masked = maskSensitiveData(parsed, sensitiveFields, maskPattern)
      return safeStringify(masked, maxLength)
    } catch {
      // Not valid JSON, just truncate
      if (payload.length > maxLength) {
        return payload.substring(0, maxLength) + '...[TRUNCATED]'
      }
      return payload
    }
  }

  // Object payload
  if (typeof payload === 'object') {
    const masked = maskSensitiveData(payload as Record<string, unknown>, sensitiveFields, maskPattern)
    return safeStringify(masked, maxLength)
  }

  return String(payload)
}

export { DEFAULT_SENSITIVE_FIELDS, DEFAULT_MASK_PATTERN, DEFAULT_MAX_BODY_LENGTH }
