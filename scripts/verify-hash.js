#!/usr/bin/env node

import bcrypt from 'bcryptjs'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🔐 Password Hash Verifier\n')
console.log('This script helps you verify if a password matches a hash.\n')

rl.question('Enter the password to test: ', async (password) => {
  if (!password) {
    console.error('❌ Password cannot be empty')
    rl.close()
    return
  }

  rl.question('Enter the hash to compare against: ', async (hash) => {
    if (!hash) {
      console.error('❌ Hash cannot be empty')
      rl.close()
      return
    }

    try {
      // Trim whitespace from hash (common issue with env variables)
      const trimmedHash = hash.trim()
      
      console.log('\n🔄 Verifying...\n')
      
      const isValid = await bcrypt.compare(password, trimmedHash)
      
      if (isValid) {
        console.log('✅ SUCCESS: Password matches the hash!')
        console.log('\nThis means:')
        console.log('  - The password is correct')
        console.log('  - The hash is valid')
        console.log('  - You can use this hash in your .env file')
      } else {
        console.log('❌ FAILED: Password does NOT match the hash')
        console.log('\nThis means:')
        console.log('  - The password is incorrect, OR')
        console.log('  - The hash is for a different password')
        console.log('\n💡 Tip: Generate a new hash with: npm run setup:hash')
      }
    } catch (error) {
      console.error('\n❌ Error verifying hash:', error.message)
      console.log('\nPossible issues:')
      console.log('  - Invalid hash format')
      console.log('  - Hash might be corrupted')
      console.log('  - Check for extra spaces or characters')
    }
    
    rl.close()
  })
})

