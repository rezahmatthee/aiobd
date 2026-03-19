# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Yes    |

## Reporting a Vulnerability

**Please do not file public GitHub issues for security vulnerabilities.**

Report security issues to **security@aiobd.co** with:

1. A description of the vulnerability
2. Steps to reproduce
3. Affected component(s) and version(s)
4. Potential impact assessment
5. Any suggested mitigations (optional)

We aim to acknowledge reports within **48 hours** and provide a fix or mitigation within **14 days** for critical issues.

---

## Security Architecture

### Authentication & Authorization

- **JWT access tokens** expire in 15 minutes; **refresh tokens** expire in 7 days
- **Token rotation** on every refresh — old tokens are immediately revoked
- **Token reuse detection**: reusing a revoked refresh token triggers revocation of all sessions for that user
- **Argon2id** password hashing (time cost 3, memory 64 MB, 4 threads)
- Minimum **12-character passwords** with uppercase, lowercase, digit, and special character requirements
- **Password history** prevents reuse of the last 5 passwords
- **Password expiry** after 90 days with forced reset on first login
- **Account lockout** after 5 failed attempts (30-minute lockout)
- **MFA/2FA** via TOTP (RFC 6238) with QR code provisioning
- Maximum **3 concurrent sessions** per user (oldest session auto-revoked on new login)

### HTTP Security Headers

All responses include the following headers (via [Helmet](https://helmetjs.github.io/)):

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'; …` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-XSS-Protection` | `0` (modern CSP supersedes this) |
| `Cache-Control` | `no-store, no-cache, must-revalidate` |

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Global | 100 req / min per IP |
| Auth (`/api/auth/*`) | 5 req / 15 min per IP |
| Token refresh | 5 req / hour per IP |
| API endpoints | 60 req / min per user |
| File uploads | 10 uploads / hour per user |

### Input Validation & Sanitization

- All API inputs validated against **Joi schemas** — unknown fields are stripped
- **NoSQL injection prevention** via `express-mongo-sanitize`
- **HTTP Parameter Pollution** prevention via `hpp`
- Request body size capped at **10 MB**
- Frontend HTML **stripped** from user inputs before rendering

### Data Protection

- PII fields (email, phone, VIN) stored **AES-256-GCM encrypted** at rest
- Email lookups use a SHA-256 hash index (never the plaintext)
- **Secrets never logged** — password, token, and authorization fields are masked
- **PII masked** in log output

### CORS

Requests from unlisted origins are rejected. Configure `CORS_ALLOWED_ORIGINS` with a comma-separated list of trusted origins.

### Audit Logging

All security-relevant events are logged as structured JSON:

- Successful and failed login attempts
- Password changes
- MFA enable/disable
- Session creation and revocation
- Token reuse detection
- Authorization failures

Audit logs are stored for **90 days** (TTL index) and are append-only.

### Automotive Diagnostic Security

- OBD command whitelisting prevents execution of dangerous commands
- ECU session established with HMAC-SHA256 message authentication
- Diagnostic sessions time out after 15 minutes of inactivity

---

## Dependency Management

- `npm audit` is run as part of CI and blocks merges on high/critical vulnerabilities
- `overrides` in `package.json` pin transitive dependencies to patched versions
- No known high/critical vulnerabilities in the production dependency tree

---

## Incident Response

1. **Identify** — Security team reviews logs and alerts
2. **Contain** — Affected accounts locked; suspicious tokens revoked
3. **Eradicate** — Root cause patched and deployed
4. **Recover** — Affected users notified; passwords reset if necessary
5. **Post-Mortem** — Timeline documented; controls improved

---

## Compliance

| Standard | Status |
|----------|--------|
| OWASP Top 10 (A01-A10) | Addressed |
| GDPR (data minimisation, right to erasure) | Partial — see roadmap |
| ISO/SAE 21434 (automotive cyber) | Partial — see roadmap |
