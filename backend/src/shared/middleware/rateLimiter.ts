import rateLimit from 'express-rate-limit';

const RATE_LIMIT_MESSAGE = {
  success: false,
  error: 'Too many requests, please try again later',
  code: 429,
};

/**
 * Global rate limiter — 100 requests per 15 minutes per IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMIT_MESSAGE,
});

/**
 * Stricter rate limiter for mutating HTTP methods — 10 requests per minute per IP.
 */
export const writeRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMIT_MESSAGE,
});

/** HTTP methods that modify server state. */
const WRITE_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

/**
 * Applies write rate limiting only to POST, PUT, DELETE, and PATCH requests.
 */
export function writeRateLimiterMiddleware(
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction,
): void {
  if (WRITE_METHODS.has(req.method)) {
    writeRateLimiter(req, res, next);
    return;
  }
  next();
}
