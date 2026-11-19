import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getEnv } from './env'

function jwtSecret(): string {
  return getEnv().JWT_SECRET
}
function passwordHash(): string | null {
  const v = getEnv().PASSWORD_HASH
  return v ? v.trim() : null
}
function adminPasswordHash(): string | null {
  const v = getEnv().ADMIN_PASSWORD_HASH
  return v ? v.trim() : null
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = passwordHash()
  if (!password || !hash) {
    console.error('Password verification failed: missing password or hash')
    return false
  }
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = adminPasswordHash()
  if (!password || !hash) {
    console.error('Admin password verification failed: missing password or hash')
    return false
  }
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Admin password verification error:', error)
    return false
  }
}

export function generateToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: '1h' })
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    return jwt.verify(token, jwtSecret()) as Record<string, unknown>
  } catch {
    return null
  }
}

export function getClientIP(event: { headers: Record<string, string | undefined> }): string {
  return (
    event.headers['x-forwarded-for']?.split(',')[0] ||
    event.headers['x-real-ip'] ||
    'unknown'
  )
}

const LOCKOUT_DURATION = 24 * 60 * 60 * 1000
const MAX_ATTEMPTS = 3

export interface RateCheck {
  allowed: boolean
  locked: boolean
  timeRemaining: number
  remainingAttempts: number
  shouldLock?: boolean
  lockExpiry?: number | null
}

export function checkRateLimit(attemptData: { locked?: boolean; lockExpiry?: number | null; attempts?: number } | null): RateCheck {
  const now = Date.now()

  if (attemptData && attemptData.locked) {
    if (attemptData.lockExpiry && now < attemptData.lockExpiry) {
      return {
        allowed: false,
        locked: true,
        timeRemaining: attemptData.lockExpiry - now,
        remainingAttempts: 0,
      }
    }
    return {
      allowed: true,
      locked: false,
      timeRemaining: 0,
      remainingAttempts: MAX_ATTEMPTS,
    }
  }

  const attempts = attemptData?.attempts || 0
  const remainingAttempts = MAX_ATTEMPTS - attempts

  if (remainingAttempts <= 0) {
    return {
      allowed: false,
      locked: true,
      timeRemaining: LOCKOUT_DURATION,
      remainingAttempts: 0,
      shouldLock: true,
      lockExpiry: now + LOCKOUT_DURATION,
    }
  }

  return {
    allowed: true,
    locked: false,
    timeRemaining: 0,
    remainingAttempts,
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}
