#!/usr/bin/env node

import bcrypt from 'bcryptjs'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🔐 Password Hash Generator\n')
console.log('ℹ️  Note: bcrypt generates different hashes each time for security.')
console.log('   This is NORMAL - any hash for the same password will work!\n')

rl.question('Enter password to hash: ', async (password) => {
  if (!password) {
    console.error('❌ Password cannot be empty')
    rl.close()
    return
  }

  try {
    const hash = await bcrypt.hash(password, 10)
    console.log('\n✅ Generated hash:')
    console.log(hash)
    console.log('\n📋 Copy this hash to your .env file')
    console.log('Example: PASSWORD_HASH=' + hash)
    console.log('\n💡 To verify this hash works with your password, run:')
    console.log('   npm run verify:hash')
  } catch (error) {
    console.error('❌ Error generating hash:', error.message)
  }
  
  rl.close()
})

