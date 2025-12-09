"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MAX_BODY_LENGTH = exports.DEFAULT_MASK_PATTERN = exports.DEFAULT_SENSITIVE_FIELDS = void 0;
exports.safeStringify = safeStringify;
exports.maskSensitiveData = maskSensitiveData;
exports.sanitizePayload = sanitizePayload;
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
];
exports.DEFAULT_SENSITIVE_FIELDS = DEFAULT_SENSITIVE_FIELDS;
const DEFAULT_MASK_PATTERN = '[REDACTED]';
exports.DEFAULT_MASK_PATTERN = DEFAULT_MASK_PATTERN;
const DEFAULT_MAX_BODY_LENGTH = 2048;
exports.DEFAULT_MAX_BODY_LENGTH = DEFAULT_MAX_BODY_LENGTH;
function safeStringify(obj, maxLength) {
    if (obj === undefined || obj === null) {
        return '';
    }
    try {
        const seen = new WeakSet();
        const result = JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
            }
            return value;
        });
        if (maxLength && result.length > maxLength) {
            return result.substring(0, maxLength) + '...[TRUNCATED]';
        }
        return result;
    }
    catch {
        return '[Unserializable]';
    }
}
function maskSensitiveData(data, sensitiveFields = DEFAULT_SENSITIVE_FIELDS, maskPattern = DEFAULT_MASK_PATTERN) {
    if (!data || typeof data !== 'object') {
        return data;
    }
    const masked = { ...data };
    const lowerCaseSensitiveFields = sensitiveFields.map((f) => f.toLowerCase());
    for (const key of Object.keys(masked)) {
        const lowerKey = key.toLowerCase();
        if (lowerCaseSensitiveFields.some((field) => lowerKey.includes(field))) {
            masked[key] = maskPattern;
        }
        else if (typeof masked[key] === 'object' && masked[key] !== null) {
            masked[key] = maskSensitiveData(masked[key], sensitiveFields, maskPattern);
        }
    }
    return masked;
}
function sanitizePayload(payload, options = {}) {
    const { maxLength = DEFAULT_MAX_BODY_LENGTH, sensitiveFields = DEFAULT_SENSITIVE_FIELDS, maskPattern = DEFAULT_MASK_PATTERN, } = options;
    if (payload === undefined || payload === null) {
        return '';
    }
    if (typeof payload === 'string') {
        try {
            const parsed = JSON.parse(payload);
            const masked = maskSensitiveData(parsed, sensitiveFields, maskPattern);
            return safeStringify(masked, maxLength);
        }
        catch {
            if (payload.length > maxLength) {
                return payload.substring(0, maxLength) + '...[TRUNCATED]';
            }
            return payload;
        }
    }
    if (typeof payload === 'object') {
        const masked = maskSensitiveData(payload, sensitiveFields, maskPattern);
        return safeStringify(masked, maxLength);
    }
    return String(payload);
}
//# sourceMappingURL=sanitizer.util.js.map