const { verifyAdminPassword, generateToken } = require('./utils/security')

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { password } = JSON.parse(event.body)

    const isValid = await verifyAdminPassword(password)

    if (!isValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid password' })
      }
    }

    const token = generateToken({ admin: true })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, token })
    }

  } catch (error) {
    console.error('Admin auth error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Authentication failed' })
    }
  }
}

