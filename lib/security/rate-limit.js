// Simple memory-based rate limiter for Next.js API routes
// Note: In a production environment with multiple server instances, 
// this should be replaced with a Redis-backed solution.

const trackers = new Map();

/**
 * Checks if a request from a specific identifier (e.g. IP) should be limited.
 * 
 * @param {Object} options
 * @param {string} options.id - Unique identifier (e.g. IP address)
 * @param {number} options.limit - Max requests allowed in the window
 * @param {number} options.windowMs - Time window in milliseconds
 * @returns {Object} { allowed: boolean, remaining: number, reset: number }
 */
export function rateLimit({ id, limit, windowMs }) {
  const now = Date.now();
  const state = trackers.get(id) || { count: 0, reset: now + windowMs };

  // If window expired, reset tracker
  if (now > state.reset) {
    state.count = 0;
    state.reset = now + windowMs;
  }

  state.count += 1;
  trackers.set(id, state);

  return {
    allowed: state.count <= limit,
    remaining: Math.max(0, limit - state.count),
    reset: state.reset,
    count: state.count
  };
}

/**
 * Helper to get clean IP from request headers
 */
export function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}
