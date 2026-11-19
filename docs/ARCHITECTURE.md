# Architecture

## Overview
React (Vite) frontend talks to Netlify Functions (TypeScript). Functions use MongoDB Atlas for metadata/rate limits and Google Drive (service account) for file storage.

## Drive upload error — root cause and fix
Cause: service account cannot own storage; the target folder must live in a regular user's Drive and be shared with the service account with Editor permission. Additional failure modes: missing/incorrect `GOOGLE_DRIVE_FOLDER_ID`, missing scopes, and non-streamed base64 bodies on large payloads.
Fix in `netlify/functions/_shared/drive.ts`: stream upload via PassThrough, explicit MIME, `supportsAllDrives`, folder validation, retries with backoff, typed errors. See `docs/SECURITY.md` for permissions.

## Versioning
Atomic version increments via Mongo counter (`findOneAndUpdate` $inc). Each version stores fileId, checksum (SHA-256), size, createdAt, isLatest. Migration defaults existing records to version 1.
