#!/usr/bin/env node

const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🔐 Password Hash Generator\n')

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
  } catch (error) {
    console.error('❌ Error generating hash:', error.message)
  }
  
  rl.close()
})

