# Resume Vault

Secure, versioned resume manager: password-gated downloads, brute-force protection, Google Drive storage, MongoDB metadata, 3D UI.

## Stack
- Frontend: React 18 + Vite + TypeScript, Tailwind, Three.js/r3f, Framer Motion
- Backend: Netlify Functions (TypeScript) in `netlify/functions`
- Storage: Google Drive (service account)
- DB: MongoDB Atlas
- Hosting: Netlify

## Quick start
```bash
npm install
cd netlify/functions && npm install && cd ../..
cp .env.example .env   # fill values
npm run setup:mongodb
npm run test:mongodb
npm run setup:hash      # run twice: user + admin
netlify dev            # http://localhost:8888
```

## Scripts
- `dev` / `build` / `preview`
- `lint` / `typecheck` / `test` / `audit` (after tooling phase)
- `setup:mongodb`, `test:mongodb`, `setup:hash`, `verify:hash`
- `deploy`

## Environment variables
See `.env.example`.

## Docs
See `docs/` (ARCHITECTURE, SECURITY, DEPLOYMENT, etc.).

## License
MIT
