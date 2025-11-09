const { MongoClient } = require('mongodb')

let cachedClient = null
let cachedDb = null

// Get MongoDB client and database
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI)

  const db = client.db(process.env.MONGODB_DB_NAME || 'resume_manager')

  cachedClient = client
  cachedDb = db

  return { client, db }
}

// Get IP attempt data
async function getIPAttempts(ip) {
  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('ip_attempts')
    
    const result = await collection.findOne({ ip })
    return result
  } catch (error) {
    console.error('Error getting IP attempts:', error)
    return null
  }
}

// Create or update IP attempt data
async function updateIPAttempts(ip, data) {
  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('ip_attempts')
    
    const result = await collection.findOneAndUpdate(
      { ip },
      { 
        $set: { 
          ip,
          ...data,
          updatedAt: new Date()
        } 
      },
      { 
        upsert: true,
        returnDocument: 'after'
      }
    )
    
    return result.value || result
  } catch (error) {
    console.error('Error updating IP attempts:', error)
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
    const { db } = await connectToDatabase()
    const collection = db.collection('metadata')
    
    const result = await collection.findOne({ key: 'versions' })
    return result?.value || []
  } catch (error) {
    console.error('Error getting versions metadata:', error)
    return []
  }
}

// Update resume versions metadata
async function updateVersionsMetadata(versions) {
  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('metadata')
    
    const result = await collection.findOneAndUpdate(
      { key: 'versions' },
      { 
        $set: { 
          key: 'versions',
          value: versions,
          updatedAt: new Date()
        } 
      },
      { 
        upsert: true,
        returnDocument: 'after'
      }
    )
    
    return result.value || result
  } catch (error) {
    console.error('Error updating versions metadata:', error)
    throw error
  }
}

// Clean up old locked IPs (optional maintenance function)
async function cleanupOldLocks() {
  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('ip_attempts')
    
    const now = Date.now()
    
    // Remove locks that have expired
    const result = await collection.updateMany(
      { 
        locked: true,
        lockExpiry: { $lt: now }
      },
      {
        $set: {
          locked: false,
          lockExpiry: null,
          attempts: 0
        }
      }
    )
    
    return result
  } catch (error) {
    console.error('Error cleaning up old locks:', error)
    throw error
  }
}

module.exports = {
  connectToDatabase,
  getIPAttempts,
  updateIPAttempts,
  resetIPAttempts,
  getVersionsMetadata,
  updateVersionsMetadata,
  cleanupOldLocks
}
