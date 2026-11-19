# Baseline (Phase 0)

Date: 2026-11-19

## Install
- Root: `npm ci` succeeded (1481 packages). 77 vulnerabilities (2 low, 28 moderate, 40 high, 7 critical).
- netlify/functions: no lockfile; `npm install` succeeded (75 packages). 4 moderate vulnerabilities.

## Lint / Typecheck
- No ESLint or TypeScript configuration exists. Baseline = not configured (N/A).

## Build
- `npm run build` (Vite) succeeded in 7.17s.
- Output: dist/index.html + CSS 15.71 kB, JS chunks (index 154.5, react-three 294.45, three 666.43 kB).
- Warnings: baseline-browser-mapping data stale; browserslist data 12 months old. (non-blocking)

## Depcheck (root)
Unused deps: busboy, googleapis, jsonwebtoken, jwt-decode (root-level duplicates; functions use their own package.json).
Unused devDeps: autoprefixer, postcss, tailwindcss (likely false positives via config files).

## Secret scan
- Searched git history for "BEGIN PRIVATE KEY" and live-looking tokens. Only placeholder values found in docs. No secrets committed. Recommend running gitleaks/trufflehog in CI later.

## Notes
- `server/` present but unused by frontend (no references in src/).
- No tests exist.
