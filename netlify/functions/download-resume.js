const { verifyPassword, getClientIP, checkRateLimit } = require('./utils/security')
const { getIPAttempts, updateIPAttempts, resetIPAttempts, getVersionsMetadata } = require('./utils/db')
const { downloadResume, getFileMetadata } = require('./utils/drive')

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle preflight
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
    const { password, versionId } = JSON.parse(event.body)
    const clientIP = getClientIP(event)

    // Get attempt data
    const attemptData = await getIPAttempts(clientIP)
    const rateCheck = checkRateLimit(attemptData)

    // Check if locked
    if (!rateCheck.allowed) {
      if (rateCheck.shouldLock) {
        await updateIPAttempts(clientIP, {
          attempts: 3,
          locked: true,
          lockExpiry: rateCheck.lockExpiry,
          lastAttempt: Date.now()
        })
      }

      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Too many failed attempts. Account locked.',
          locked: true,
          timeRemaining: rateCheck.timeRemaining
        })
      }
    }

    // Verify password
    const isValid = await verifyPassword(password)

    if (!isValid) {
      // Increment attempts
      const newAttempts = (attemptData?.attempts || 0) + 1
      await updateIPAttempts(clientIP, {
        attempts: newAttempts,
        locked: false,
        lastAttempt: Date.now()
      })

      const remainingAttempts = 3 - newAttempts

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: 'Incorrect password',
          remainingAttempts
        })
      }
    }

    // Password correct - reset attempts
    await resetIPAttempts(clientIP)

    // Get file to download
    let fileId, fileName

    if (versionId) {
      // Download specific version
      const versions = await getVersionsMetadata()
      const version = versions.find(v => v.id === versionId)
      
      if (!version) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Version not found' })
        }
      }

      fileId = version.id
      fileName = version.name
    } else {
      // Download latest version
      const versions = await getVersionsMetadata()
      
      if (!versions || versions.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'No resumes available' })
        }
      }

      const latest = versions[0]
      fileId = latest.id
      fileName = latest.name
    }

    // Download file from Google Drive
    const fileStream = await downloadResume(fileId)
    
    // Convert stream to buffer
    const chunks = []
    for await (const chunk of fileStream) {
      chunks.push(chunk)
    }
    const fileBuffer = Buffer.concat(chunks)

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length,
      },
      body: fileBuffer.toString('base64'),
      isBase64Encoded: true
    }

  } catch (error) {
    console.error('Download error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Download failed' })
    }
  }
}

