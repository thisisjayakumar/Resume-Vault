#!/usr/bin/env node

import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

async function setupMongoDB() {
  console.log('🗄️  Setting up MongoDB collections and indexes...\n')

  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI not found in environment variables')
    console.error('Please add MONGODB_URI to your .env file')
    process.exit(1)
  }

  let client

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...')
    client = await MongoClient.connect(process.env.MONGODB_URI)

    const db = client.db(process.env.MONGODB_DB_NAME || 'resume_manager')
    console.log('✓ Connected successfully\n')

    // Create ip_attempts collection with index
    console.log('Setting up ip_attempts collection...')
    const ipAttemptsCollection = db.collection('ip_attempts')
    
    // Create unique index on IP address
    await ipAttemptsCollection.createIndex(
      { ip: 1 },
      { unique: true, name: 'ip_unique' }
    )
    
    // Create TTL index to auto-cleanup expired locks after 25 hours
    await ipAttemptsCollection.createIndex(
      { lockExpiry: 1 },
      { 
        expireAfterSeconds: 3600, // 1 hour after lockExpiry
        name: 'lockExpiry_ttl',
        partialFilterExpression: { lockExpiry: { $exists: true } }
      }
    )
    
    console.log('✓ ip_attempts collection configured')

    // Create metadata collection with index
    console.log('Setting up metadata collection...')
    const metadataCollection = db.collection('metadata')
    
    // Create unique index on key
    await metadataCollection.createIndex(
      { key: 1 },
      { unique: true, name: 'key_unique' }
    )
    
    // Initialize versions metadata if it doesn't exist
    const versionsDoc = await metadataCollection.findOne({ key: 'versions' })
    if (!versionsDoc) {
      await metadataCollection.insertOne({
        key: 'versions',
        value: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log('✓ Initialized versions metadata')
    } else {
      console.log('✓ Versions metadata already exists')
    }

    console.log('✓ metadata collection configured\n')

    // Display collections
    const collections = await db.listCollections().toArray()
    console.log('📋 Available collections:')
    collections.forEach(col => {
      console.log(`   - ${col.name}`)
    })

    console.log('\n✅ MongoDB setup complete!')
    console.log('\nDatabase:', db.databaseName)
    console.log('Collections: ip_attempts, metadata')
    console.log('\nYou can now use the application.')
    
  } catch (error) {
    console.error('\n❌ Error setting up MongoDB:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Verify MONGODB_URI is correct in .env file')
    console.error('2. Ensure your IP is whitelisted in MongoDB Atlas')
    console.error('3. Check your network connection')
    console.error('4. Verify database user has correct permissions')
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('\n👋 Connection closed')
    }
  }
}

setupMongoDB()

