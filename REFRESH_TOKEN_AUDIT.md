# Refresh Token System Audit

**Date:** July 1, 2026  
**Status:** ⚠️ PARTIAL IMPLEMENTATION  
**Score:** 65/100

---

## System Overview

```
Login Flow:
┌─────────────────────────────────────────────────────────┐
│ 1. User submits credentials (email, password, role)     │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. /api/front-end/login endpoint validates              │
│    - Checks user exists                                 │
│    - Verifies password with bcrypt                      │
│    - Checks role matches                                │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Issues TWO tokens:                                   │
│    - ACCESS TOKEN: JWT 1h expiry (for API calls)       │
│    - REFRESH TOKEN: JWT 7d expiry (stored in DB)       │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Client stores in session via NextAuth               │
│    - session.user.token = access token                 │
│    (Refresh token should be stored securely)           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Client uses token in API requests                   │
│    Authorization: Bearer {accessToken}                  │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 6. If 401 Unauthorized → Use refresh token             │
│    POST /api/auth/refresh-token with refreshToken      │
│    Returns new access token                             │
└─────────────────────────────────────────────────────────┘
```

---

## Backend Implementation ✅

### 1. Login Endpoint: `/api/front-end/login`

**Status:** ✅ GOOD

```typescript
// Issues TWO tokens on successful login:

const accessToken = jwt.sign(
  { id, email, roleId, roleName },
  JWT_SECRET,
  { expiresIn: "1h" }  // ✅ 1 hour - good
);

const refreshTokenString = jwt.sign(
  { id, type: "refresh" },
  JWT_SECRET,
  { expiresIn: "7d" }  // ⚠️ 7 days - too long (should be 3d)
);

// Stores refresh token in database
await prisma.refreshToken.create({
  data: {
    token: refreshTokenString,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isRevoked: false,
  },
});

// Returns both tokens to client
return NextResponse.json({
  message: "Login successful",
  user: { ... },
  accessToken,        // ✅ For API calls
  refreshToken,       // ✅ For token refresh
});
```

**Issues Found:**
- ⚠️ Refresh token expiry is 7 days (should be 3-4 days max)
- ⚠️ No rate limiting on this endpoint (allows brute force)

---

### 2. Refresh Token Endpoint: `/api/auth/refresh-token`

**Status:** ✅ GOOD (Secure Implementation)

```typescript
export async function POST(req: Request) {
  const { refreshToken } = await req.json();

  // 1. Validate refresh token is provided
  if (!refreshToken) return 400; // ✅ Required

  // 2. Verify JWT signature
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_SECRET);
  } catch {
    return 401; // ✅ Invalid/expired signature
  }

  // 3. Check token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: { include: { role: true, affiliate: true } } },
  });

  // 4. Validate token is not revoked & not expired
  if (
    !storedToken ||
    storedToken.isRevoked ||       // ✅ Check revoke status
    new Date() > storedToken.expiresAt  // ✅ Check DB expiry
  ) {
    return 401;
  }

  // 5. Issue NEW access token
  const newAccessToken = jwt.sign(
    { id, email, roleId, roleName },
    JWT_SECRET,
    { expiresIn: "1h" }  // ✅ Fresh 1-hour token
  );

  return NextResponse.json({
    message: "Token refreshed successfully",
    accessToken: newAccessToken,  // ✅ New token for next hour
    user: { ... },
  });
}
```

**Security Features:** ✅
- ✅ Validates JWT signature
- ✅ Checks database for token existence
- ✅ Checks revoke status
- ✅ Checks expiration date
- ✅ Issues fresh access token
- ✅ Returns user data with new token
- ✅ No new refresh token issued (prevents accumulation)

**Issues Found:**
- ❌ **NO rate limiting** (allows infinite refresh attempts)
- ❌ **NO logging** (can't detect token refresh abuse)

---

## Client-Side Implementation ⚠️

### Current State: INCOMPLETE

**Token Storage:**

```typescript
// In NextAuth session callback:
session.user = {
  id: token.id,
  name: token.name,
  email: token.email,
  token: token.token,          // ✅ Access token stored
  role: token.role,
  affiliateId: token.affiliateId,
  // ❌ MISSING: refreshToken NOT stored in session!
};
```

**Problem:** 
- Access token IS stored in session
- ❌ **Refresh token is NOT stored on client**
- Client can't refresh tokens automatically on 401

---

### Token Usage in Services:

**Example: `/src/lib/services/seller/productService.ts`**

```typescript
async getAll(token: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,  // ✅ Uses token
    },
  });

  if (!res.ok) throw new Error("Failed to fetch");  // ❌ No retry logic
  return await res.json();
}
```

**Issues:**
- ✅ Token is passed in Authorization header
- ❌ **No automatic retry on 401**
- ❌ **No token refresh logic**
- ❌ **No error handling for expired token**

---

## Missing: Automatic Token Refresh

**What's Missing:**

```typescript
// ❌ NOT IMPLEMENTED: Fetch interceptor for 401 handling

// Should look like this:
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
});

if (response.status === 401) {
  // 1. Try to refresh token
  const refreshResponse = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  if (refreshResponse.ok) {
    const { accessToken } = await refreshResponse.json();
    
    // 2. Retry original request with new token
    return fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } else {
    // 3. Redirect to login if refresh fails
    router.push('/login');
  }
}
```

---

## Issues Summary

### 🔴 CRITICAL (Fix Before Production)

| Issue | File | Severity | Fix Time |
|-------|------|----------|----------|
| Refresh token 7 days too long | `/api/front-end/login` | HIGH | 15 mins |
| No rate limiting on refresh endpoint | `/api/auth/refresh-token` | CRITICAL | 1-2 hrs |
| No rate limiting on login endpoint | `/api/front-end/login` | CRITICAL | 1-2 hrs |

### 🟡 HIGH (Should Implement)

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| Refresh token not stored on client | NextAuth config | Can't auto-refresh | 30 mins |
| No 401 retry logic in services | All services | Worse UX on token expiry | 2-3 hrs |
| No token refresh interceptor | Client-side | Manual logout needed | 2-3 hrs |
| No refresh token logging | Backend | Can't detect abuse | 1 hour |

### 🟠 MEDIUM (Nice-to-Have)

| Issue | Impact | Fix |
|-------|--------|-----|
| No refresh token rotation | Slightly better security | 1 hour |
| No token revocation endpoint | Can't logout from other devices | 1 hour |
| No refresh token cleanup (expired tokens still in DB) | DB bloat over time | 30 mins (add cron job) |

---

## Database Schema Check

**RefreshToken Model in Prisma:**

```prisma
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique  // ✅ Unique constraint
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime  // ✅ Expiration tracked
  isRevoked Boolean   @default(false)  // ✅ Revoke support
  createdAt DateTime  @default(now())
}
```

**Status:** ✅ GOOD - Proper schema with all necessary fields

---

## Security Test Results

From `security-fixes.test.ts`:

```typescript
✅ Access token issued with 1-hour expiration
✅ Refresh token successfully issued new access token
✅ Expired token properly rejected
```

**Test Coverage:** 
- ✅ Token creation works
- ✅ Token refresh works
- ✅ Expired tokens rejected
- ❌ Missing: Revocation tests
- ❌ Missing: Rate limit tests
- ❌ Missing: Concurrent refresh tests

---

## Recommended Implementation Order

### Phase 1: Security Hardening (URGENT - 1-2 hours)

```
Priority: 🔴 CRITICAL

1. Add rate limiting to login endpoint (prevent brute force)
   Time: 1-2 hours
   Impact: ⭐⭐⭐⭐⭐

2. Add rate limiting to refresh endpoint (prevent token refresh abuse)
   Time: 1-2 hours
   Impact: ⭐⭐⭐⭐

3. Reduce refresh token expiry from 7d to 3d
   Time: 15 minutes
   Impact: ⭐⭐⭐
```

### Phase 2: Client-Side Implementation (HIGH - 3-4 hours)

```
Priority: 🟡 HIGH

1. Store refresh token in secure http-only cookie
   Time: 1 hour
   Impact: Better security

2. Add fetch interceptor for 401 handling
   Time: 2 hours
   Impact: Auto token refresh, better UX

3. Update all services to handle token refresh
   Time: 1-2 hours
   Impact: Seamless auth experience
```

### Phase 3: Production-Ready (MEDIUM - 2-3 hours)

```
Priority: 🟠 MEDIUM

1. Add login attempt logging (for abuse detection)
   Time: 1 hour

2. Add refresh token cleanup cron job
   Time: 1 hour

3. Add logout-all-devices endpoint (revoke all tokens)
   Time: 1 hour
```

---

## Code Examples for Implementation

### Add Refresh Token Storage on Client

```typescript
// In NextAuth callback
async session({ session, token }: any) {
  session.user = {
    id: token.id,
    email: token.email,
    token: token.token,
    role: token.role,
    // Store refresh token (ideally in httpOnly cookie, but for now in session)
    refreshToken: token.refreshToken,
  };
  return session;
}
```

### Add Token Refresh Logic

```typescript
// Create reusable fetch wrapper
async function fetchWithRefresh(
  url: string,
  options: RequestInit = {},
  refreshToken?: string
) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.user.token}`,
    },
  });

  if (response.status === 401 && refreshToken) {
    // Try to refresh token
    const refreshResponse = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      const { accessToken } = await refreshResponse.json();
      
      // Update session with new token
      await update({ user: { ...session.user, token: accessToken } });

      // Retry original request
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } else {
      // Redirect to login
      signOut();
    }
  }

  return response;
}
```

---

## Final Score Breakdown

| Category | Score | Status |
|----------|-------|--------|
| Backend Implementation | 85/100 | ✅ Good (needs rate limiting) |
| Token Security | 80/100 | ⚠️ Good (7d expiry too long) |
| Database Schema | 95/100 | ✅ Excellent |
| Client-Side Storage | 30/100 | ❌ Poor (refresh token not stored) |
| Auto-Refresh Logic | 0/100 | ❌ Not implemented |
| Rate Limiting | 0/100 | 🔴 CRITICAL |
| Error Handling | 40/100 | ⚠️ Minimal |
| **OVERALL** | **65/100** | ⚠️ PARTIAL |

---

## Verdict

✅ **Backend is solid** - Refresh token endpoint is secure and works  
❌ **Client-side is incomplete** - No automatic token refresh  
🔴 **Missing rate limiting** - CRITICAL security issue  

**Recommended:** 
1. Add rate limiting FIRST (2 hours) - security critical
2. Add client-side auto-refresh (3-4 hours) - UX improvement
3. Reduce token expiry (15 minutes) - security hardening

**Total to Production-Ready:** ~6-7 hours

Would you like me to implement any of these fixes?
