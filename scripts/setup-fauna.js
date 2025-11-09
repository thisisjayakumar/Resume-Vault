#!/usr/bin/env node

const faunadb = require('faunadb')
require('dotenv').config()

const q = faunadb.query

async function setupFauna() {
  console.log('🗄️  Setting up FaunaDB collections and indexes...\n')

  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
    domain: 'db.fauna.com',
    scheme: 'https',
  })

  try {
    // Create ip_attempts collection
    console.log('Creating ip_attempts collection...')
    await client.query(
      q.CreateCollection({ name: 'ip_attempts' })
    ).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Collection already exists')
      } else throw err
    })

    // Create metadata collection
    console.log('Creating metadata collection...')
    await client.query(
      q.CreateCollection({ name: 'metadata' })
    ).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Collection already exists')
      } else throw err
    })

    // Create index for ip_attempts
    console.log('Creating attempts_by_ip index...')
    await client.query(
      q.CreateIndex({
        name: 'attempts_by_ip',
        source: q.Collection('ip_attempts'),
        terms: [{ field: ['data', 'ip'] }],
        unique: true,
      })
    ).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Index already exists')
      } else throw err
    })

    // Create index for metadata
    console.log('Creating metadata_by_key index...')
    await client.query(
      q.CreateIndex({
        name: 'metadata_by_key',
        source: q.Collection('metadata'),
        terms: [{ field: ['data', 'key'] }],
        unique: true,
      })
    ).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Index already exists')
      } else throw err
    })

    console.log('\n✅ FaunaDB setup complete!')
    console.log('\nYou can now use the application.')
    
  } catch (error) {
    console.error('\n❌ Error setting up FaunaDB:', error.message)
    console.error('\nMake sure you have set FAUNADB_SECRET in your .env file')
    process.exit(1)
  }
}

setupFauna()

