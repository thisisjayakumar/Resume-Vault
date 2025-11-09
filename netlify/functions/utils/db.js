const faunadb = require('faunadb')

const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET,
  domain: 'db.fauna.com',
  scheme: 'https',
})

// Get IP attempt data
async function getIPAttempts(ip) {
  try {
    const result = await client.query(
      q.Get(q.Match(q.Index('attempts_by_ip'), ip))
    )
    return result.data
  } catch (error) {
    if (error.name === 'NotFound') {
      return null
    }
    throw error
  }
}

// Create or update IP attempt data
async function updateIPAttempts(ip, data) {
  try {
    const existing = await client.query(
      q.Get(q.Match(q.Index('attempts_by_ip'), ip))
    )
    
    // Update existing record
    return await client.query(
      q.Update(existing.ref, { data })
    )
  } catch (error) {
    if (error.name === 'NotFound') {
      // Create new record
      return await client.query(
        q.Create(q.Collection('ip_attempts'), {
          data: { ip, ...data }
        })
      )
    }
    throw error
  }
}

// Reset IP attempts
async function resetIPAttempts(ip) {
  return await updateIPAttempts(ip, {
    attempts: 0,
    locked: false,
    lockExpiry: null,
    lastAttempt: null
  })
}

// Get resume versions metadata
async function getVersionsMetadata() {
  try {
    const result = await client.query(
      q.Get(q.Match(q.Index('metadata_by_key'), 'versions'))
    )
    return result.data.value || []
  } catch (error) {
    if (error.name === 'NotFound') {
      return []
    }
    throw error
  }
}

// Update resume versions metadata
async function updateVersionsMetadata(versions) {
  try {
    const existing = await client.query(
      q.Get(q.Match(q.Index('metadata_by_key'), 'versions'))
    )
    
    return await client.query(
      q.Update(existing.ref, {
        data: { key: 'versions', value: versions }
      })
    )
  } catch (error) {
    if (error.name === 'NotFound') {
      return await client.query(
        q.Create(q.Collection('metadata'), {
          data: { key: 'versions', value: versions }
        })
      )
    }
    throw error
  }
}

module.exports = {
  getIPAttempts,
  updateIPAttempts,
  resetIPAttempts,
  getVersionsMetadata,
  updateVersionsMetadata
}

