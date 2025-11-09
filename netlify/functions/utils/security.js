const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
// Trim whitespace from hashes to prevent issues with environment variable formatting
const PASSWORD_HASH = process.env.PASSWORD_HASH ? process.env.PASSWORD_HASH.trim() : null
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ? process.env.ADMIN_PASSWORD_HASH.trim() : null

// Verify user password
async function verifyPassword(password) {
  if (!password || !PASSWORD_HASH) {
    console.error('Password verification failed: missing password or hash')
    return false
  }
  
  try {
    return await bcrypt.compare(password, PASSWORD_HASH)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

// Verify admin password
async function verifyAdminPassword(password) {
  if (!password || !ADMIN_PASSWORD_HASH) {
    console.error('Admin password verification failed: missing password or hash')
    return false
  }
  
  try {
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  } catch (error) {
    console.error('Admin password verification error:', error)
    return false
  }
}

// Generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Get client IP address
function getClientIP(event) {
  return (
    event.headers['x-forwarded-for']?.split(',')[0] ||
    event.headers['x-real-ip'] ||
    'unknown'
  )
}

// Rate limiting check
function checkRateLimit(attemptData) {
  const now = Date.now()
  const LOCKOUT_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  const MAX_ATTEMPTS = 3

  // Check if locked
  if (attemptData && attemptData.locked) {
    if (now < attemptData.lockExpiry) {
      return {
        allowed: false,
        locked: true,
        timeRemaining: attemptData.lockExpiry - now,
        remainingAttempts: 0
      }
    } else {
      // Lock expired, reset
      return {
        allowed: true,
        locked: false,
        timeRemaining: 0,
        remainingAttempts: MAX_ATTEMPTS
      }
    }
  }

  // Check attempts
  const attempts = attemptData?.attempts || 0
  const remainingAttempts = MAX_ATTEMPTS - attempts

  if (remainingAttempts <= 0) {
    // Lock account
    return {
      allowed: false,
      locked: true,
      timeRemaining: LOCKOUT_DURATION,
      remainingAttempts: 0,
      shouldLock: true,
      lockExpiry: now + LOCKOUT_DURATION
    }
  }

  return {
    allowed: true,
    locked: false,
    timeRemaining: 0,
    remainingAttempts
  }
}

// Hash password (utility for setup)
async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

module.exports = {
  verifyPassword,
  verifyAdminPassword,
  generateToken,
  verifyToken,
  getClientIP,
  checkRateLimit,
  hashPassword
}

