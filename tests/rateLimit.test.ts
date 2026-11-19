import { describe, it, expect } from 'vitest'
import { checkRateLimit } from '../netlify/functions/_shared/security'

describe('checkRateLimit', () => {
  it('allows first attempt', () => {
    const r = checkRateLimit(null)
    expect(r.allowed).toBe(true)
    expect(r.remainingAttempts).toBe(3)
  })
  it('locks after 3 attempts', () => {
    const r = checkRateLimit({ attempts: 3, locked: false })
    expect(r.allowed).toBe(false)
    expect(r.shouldLock).toBe(true)
  })
  it('stays locked until expiry', () => {
    const future = Date.now() + 100000
    const r = checkRateLimit({ locked: true, lockExpiry: future })
    expect(r.locked).toBe(true)
    expect(r.allowed).toBe(false)
  })
})
