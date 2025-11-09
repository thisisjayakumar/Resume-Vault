const { google } = require('googleapis')
const stream = require('stream')

// Initialize Google Drive API
function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })

  return google.drive({ version: 'v3', auth })
}

// List all resumes in the folder
async function listResumes() {
  const drive = getDriveClient()
  
  const response = await drive.files.list({
    q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
    fields: 'files(id, name, createdTime, size)',
    orderBy: 'createdTime desc',
  })

  return response.data.files
}

// Download a resume file
async function downloadResume(fileId) {
  const drive = getDriveClient()
  
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  )

  return response.data
}

// Get file metadata
async function getFileMetadata(fileId) {
  const drive = getDriveClient()
  
  const response = await drive.files.get({
    fileId,
    fields: 'id, name, createdTime, size, mimeType',
  })

  return response.data
}

// Upload a new resume
async function uploadResume(fileBuffer, filename) {
  const drive = getDriveClient()
  
  const bufferStream = new stream.PassThrough()
  bufferStream.end(fileBuffer)

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      mimeType: 'application/pdf',
    },
    media: {
      mimeType: 'application/pdf',
      body: bufferStream,
    },
    fields: 'id, name, createdTime',
  })

  return response.data
}

// Delete a resume file
async function deleteResume(fileId) {
  const drive = getDriveClient()
  
  await drive.files.delete({ fileId })
}

// Generate version filename
function generateVersionFilename() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  return `Resume_${year}-${month}-${day}_v1.0.pdf`
}

// Parse version from filename
function parseVersion(filename) {
  const match = filename.match(/Resume_(\d{4}-\d{2}-\d{2})_v([\d.]+)\.pdf/)
  if (match) {
    return {
      date: match[1],
      version: match[2],
    }
  }
  return null
}

module.exports = {
  listResumes,
  downloadResume,
  getFileMetadata,
  uploadResume,
  deleteResume,
  generateVersionFilename,
  parseVersion,
}

