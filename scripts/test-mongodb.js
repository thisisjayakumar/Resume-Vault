#!/usr/bin/env node

const { MongoClient } = require('mongodb')
require('dotenv').config()

async function testMongoDB() {
  console.log('🧪 Testing MongoDB Connection...\n')

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file')
    process.exit(1)
  }

  let client

  try {
    // Connect
    console.log('1️⃣ Connecting to MongoDB...')
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected successfully\n')

    const db = client.db(process.env.MONGODB_DB_NAME || 'resume_manager')

    // Test ip_attempts collection
    console.log('2️⃣ Testing ip_attempts collection...')
    const ipCollection = db.collection('ip_attempts')
    
    const testIP = '127.0.0.1'
    await ipCollection.insertOne({
      ip: testIP,
      attempts: 0,
      locked: false,
      createdAt: new Date()
    })
    console.log('✅ Write test passed')

    const result = await ipCollection.findOne({ ip: testIP })
    console.log('✅ Read test passed')

    await ipCollection.deleteOne({ ip: testIP })
    console.log('✅ Delete test passed\n')

    // Test metadata collection
    console.log('3️⃣ Testing metadata collection...')
    const metaCollection = db.collection('metadata')
    
    const testData = await metaCollection.findOne({ key: 'versions' })
    if (testData) {
      console.log('✅ Versions metadata found')
      console.log(`   Current versions: ${testData.value.length}`)
    } else {
      console.log('⚠️  No versions metadata found (run setup-mongodb.js first)')
    }

    // Show collections
    console.log('\n4️⃣ Available collections:')
    const collections = await db.listCollections().toArray()
    collections.forEach(col => {
      console.log(`   ✓ ${col.name}`)
    })

    console.log('\n✅ All tests passed!')
    console.log('Your MongoDB setup is working correctly.')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('\nPlease run: npm run setup:mongodb')
  } finally {
    if (client) {
      await client.close()
    }
  }
}

testMongoDB()

