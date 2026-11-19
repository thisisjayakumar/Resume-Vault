# Security

## In-repo controls
- Passwords hashed with bcrypt; constant-time compare via bcrypt.compare.
- Per-IP rate limiting (3 attempts / 24h) stored in MongoDB (durable).
- Input validation with zod on every function; NoSQL injection guard by schema.
- Upload: auth required, MIME allowlist, magic-byte check, 10MB cap, filename not user-controlled.
- CORS allowlist via ALLOWED_ORIGIN.
- Security headers in netlify.toml (CSP, HSTS, etc.), no-store for functions.
- Secrets only via env vars; .env ignored.

## Dashboard-only actions
- Netlify: set env vars; enable HTTPS.
- Google: scope service account to one folder; share folder with service account Editor.
- MongoDB: user scoped to one DB/role; IP allowlist.
- Cloudflare (if proxied): Full (Strict) TLS, HSTS, WAF, rate limit rule on /.netlify/functions/*, Turnstile on password form, DNSSEC/CAA.
