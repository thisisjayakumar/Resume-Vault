const { getClientIP, checkRateLimit } = require('./utils/security')
const { getIPAttempts } = require('./utils/db')

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const clientIP = getClientIP(event)
    const attemptData = await getIPAttempts(clientIP)
    const rateCheck = checkRateLimit(attemptData)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        remainingAttempts: rateCheck.remainingAttempts,
        locked: rateCheck.locked,
        timeRemaining: rateCheck.timeRemaining
      })
    }

  } catch (error) {
    console.error('Check attempts error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to check attempts' })
    }
  }
}

