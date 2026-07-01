/**
 * Authentication Logging
 * Tracks login attempts, failures, and security events
 */

export enum AuthEventType {
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGIN_RATE_LIMITED = "LOGIN_RATE_LIMITED",
  SIGNUP_SUCCESS = "SIGNUP_SUCCESS",
  SIGNUP_FAILED = "SIGNUP_FAILED",
  SIGNUP_RATE_LIMITED = "SIGNUP_RATE_LIMITED",
  TOKEN_REFRESH_SUCCESS = "TOKEN_REFRESH_SUCCESS",
  TOKEN_REFRESH_FAILED = "TOKEN_REFRESH_FAILED",
  TOKEN_REFRESH_RATE_LIMITED = "TOKEN_REFRESH_RATE_LIMITED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_ROLE = "INVALID_ROLE",
  USER_NOT_FOUND = "USER_NOT_FOUND",
}

interface AuthLogEntry {
  timestamp: string;
  eventType: AuthEventType;
  email?: string;
  ip: string;
  userAgent?: string;
  userId?: number;
  role?: string;
  reason?: string;
  statusCode?: number;
}

/**
 * Extract client IP from request
 */
export function getClientIpFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Extract user agent from request
 */
export function getUserAgentFromRequest(req: Request): string {
  return req.headers.get("user-agent") || "unknown";
}

/**
 * Log authentication event
 * In production, send to centralized logging service (Sentry, DataDog, etc.)
 */
export function logAuthEvent(entry: AuthLogEntry): void {
  const logLevel = entry.eventType.includes("FAILED") || entry.eventType.includes("RATE_LIMITED") ? "warn" : "info";

  const logMessage = {
    timestamp: entry.timestamp,
    event: entry.eventType,
    email: entry.email || "unknown",
    ip: entry.ip,
    userId: entry.userId || "anonymous",
    role: entry.role || "unknown",
    reason: entry.reason,
    statusCode: entry.statusCode,
  };

  if (logLevel === "warn") {
    console.warn(`[AUTH] ${entry.eventType}:`, JSON.stringify(logMessage));
  } else {
    console.info(`[AUTH] ${entry.eventType}:`, JSON.stringify(logMessage));
  }

  // TODO: Send to centralized logging in production
  // sendToSentry(logMessage);
  // sendToDataDog(logMessage);
  // sendToCloudWatch(logMessage);
}

/**
 * Log login attempt
 */
export function logLoginAttempt(
  req: Request,
  email: string,
  success: boolean,
  reason?: string
): void {
  const ip = getClientIpFromRequest(req);
  const userAgent = getUserAgentFromRequest(req);

  logAuthEvent({
    timestamp: new Date().toISOString(),
    eventType: success ? AuthEventType.LOGIN_SUCCESS : AuthEventType.LOGIN_FAILED,
    email,
    ip,
    userAgent,
    reason,
    statusCode: success ? 200 : 401,
  });
}

/**
 * Log signup attempt
 */
export function logSignupAttempt(
  req: Request,
  email: string,
  success: boolean,
  reason?: string
): void {
  const ip = getClientIpFromRequest(req);

  logAuthEvent({
    timestamp: new Date().toISOString(),
    eventType: success ? AuthEventType.SIGNUP_SUCCESS : AuthEventType.SIGNUP_FAILED,
    email,
    ip,
    reason,
    statusCode: success ? 201 : 400,
  });
}

/**
 * Log token refresh attempt
 */
export function logTokenRefresh(
  req: Request,
  userId: number,
  success: boolean,
  reason?: string
): void {
  const ip = getClientIpFromRequest(req);

  logAuthEvent({
    timestamp: new Date().toISOString(),
    eventType: success ? AuthEventType.TOKEN_REFRESH_SUCCESS : AuthEventType.TOKEN_REFRESH_FAILED,
    ip,
    userId,
    reason,
    statusCode: success ? 200 : 401,
  });
}

/**
 * Log rate limit event
 */
export function logRateLimited(
  req: Request,
  endpoint: string,
  email?: string
): void {
  const ip = getClientIpFromRequest(req);

  let eventType = AuthEventType.LOGIN_RATE_LIMITED;
  if (endpoint === "signup") eventType = AuthEventType.SIGNUP_RATE_LIMITED;
  if (endpoint === "refresh") eventType = AuthEventType.TOKEN_REFRESH_RATE_LIMITED;

  logAuthEvent({
    timestamp: new Date().toISOString(),
    eventType,
    email,
    ip,
    reason: `Rate limit exceeded on ${endpoint} endpoint`,
    statusCode: 429,
  });
}

/**
 * Log suspicious activity (for future monitoring)
 */
export function logSuspiciousActivity(
  req: Request,
  activityType: string,
  details: Record<string, any>
): void {
  const ip = getClientIpFromRequest(req);

  console.warn(`[SECURITY] Suspicious Activity: ${activityType}`, {
    ip,
    details,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send alerts to security team
  // alertSecurityTeam({ activityType, ip, details });
}
