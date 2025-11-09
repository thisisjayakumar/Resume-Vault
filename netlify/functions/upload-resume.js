const busboy = require('busboy')
const { verifyAdminPassword } = require('./utils/security')
const { uploadResume, listResumes, deleteResume, generateVersionFilename } = require('./utils/drive')
const { getVersionsMetadata, updateVersionsMetadata } = require('./utils/db')

// Parse multipart form data
function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: event.headers })
    const result = { fields: {}, files: {} }

    bb.on('file', (name, file, info) => {
      const chunks = []
      file.on('data', (data) => chunks.push(data))
      file.on('end', () => {
        result.files[name] = {
          filename: info.filename,
          buffer: Buffer.concat(chunks),
          mimeType: info.mimeType
        }
      })
    })

    bb.on('field', (name, value) => {
      result.fields[name] = value
    })

    bb.on('finish', () => resolve(result))
    bb.on('error', reject)

    bb.write(event.body, event.isBase64Encoded ? 'base64' : 'binary')
    bb.end()
  })
}

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
    // Parse form data
    const formData = await parseMultipartForm(event)
    const { adminPassword } = formData.fields
    const resumeFile = formData.files.resume

    if (!resumeFile) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file uploaded' })
      }
    }

    // Verify admin password
    const isValid = await verifyAdminPassword(adminPassword)
    
    if (!isValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid admin password' })
      }
    }

    // Validate file type
    if (resumeFile.mimeType !== 'application/pdf') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Only PDF files are allowed' })
      }
    }

    // Generate version filename
    const filename = generateVersionFilename()

    // Upload to Google Drive
    const uploadedFile = await uploadResume(resumeFile.buffer, filename)

    // Get current versions
    let versions = await getVersionsMetadata()

    // Add new version
    versions.unshift({
      id: uploadedFile.id,
      name: uploadedFile.name,
      date: new Date().toISOString(),
      createdTime: uploadedFile.createdTime
    })

    // Keep only latest 3 versions
    if (versions.length > 3) {
      const toDelete = versions.slice(3)
      
      // Delete old files from Google Drive
      for (const version of toDelete) {
        try {
          await deleteResume(version.id)
        } catch (error) {
          console.error('Error deleting old version:', error)
        }
      }

      versions = versions.slice(0, 3)
    }

    // Update metadata
    await updateVersionsMetadata(versions)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Resume uploaded successfully',
        version: uploadedFile
      })
    }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Upload failed: ' + error.message })
    }
  }
}

