import { randomUUID } from 'crypto'

export function requestId(): string {
  return randomUUID()
}

export function log(level: 'info' | 'warn' | 'error', msg: string, meta?: Record<string, unknown>) {
  const entry = { level, msg, ...meta, ts: new Date().toISOString() }
  if (level === 'error') console.error(JSON.stringify(entry))
  else if (level === 'warn') console.warn(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}
