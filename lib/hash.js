// lib/hash.js — SHA-256 error fingerprinting
const crypto = require('crypto');

/**
 * Normalizes an error log by removing timestamps, PIDs,
 * memory addresses, and whitespace noise — so identical
 * errors hash identically even if logged at different times.
 */
function normalizeError(errorLog) {
  return errorLog
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?/g, '<TIMESTAMP>') // ISO dates
    .replace(/\d{2}:\d{2}:\d{2}/g, '<TIME>')                                    // HH:MM:SS
    .replace(/\bpid\s*[=:]?\s*\d+\b/gi, '<PID>')                                // PIDs
    .replace(/0x[0-9a-fA-F]+/g, '<ADDR>')                                       // hex addresses
    .replace(/\s+/g, ' ')                                                        // collapse whitespace
    .trim()
    .toLowerCase();
}

/**
 * Returns a SHA-256 hex digest of the normalized error log.
 * This acts as the unique fingerprint for DB lookups.
 */
function hashError(errorLog) {
  const normalized = normalizeError(errorLog);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

module.exports = { hashError, normalizeError };
