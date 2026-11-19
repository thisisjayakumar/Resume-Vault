import { google } from 'googleapis'
import stream from 'stream'
import { getEnv } from './env'

function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: getEnv().GOOGLE_CLIENT_EMAIL,
      private_key: getEnv().GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
  })
  return google.drive({ version: 'v3', auth })
}

export interface DriveFile {
  id: string
  name: string
  createdTime: string
  size?: string
  mimeType?: string
}

export async function listResumes(): Promise<DriveFile[]> {
  const drive = getDriveClient()
  const response = await drive.files.list({
    q: `'${getEnv().GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
    fields: 'files(id, name, createdTime, size)',
    orderBy: 'createdTime desc',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })
  return (response.data.files as DriveFile[]) || []
}

export async function downloadResume(fileId: string): Promise<NodeJS.ReadableStream> {
  const drive = getDriveClient()
  const response = await drive.files.get({ fileId, alt: 'media', supportsAllDrives: true }, { responseType: 'stream' })
  return response.data as NodeJS.ReadableStream
}

export async function getFileMetadata(fileId: string): Promise<DriveFile> {
  const drive = getDriveClient()
  const response = await drive.files.get({
    fileId,
    fields: 'id, name, createdTime, size, mimeType',
    supportsAllDrives: true,
  })
  return response.data as DriveFile
}

export async function uploadResume(fileBuffer: Buffer, filename: string): Promise<DriveFile> {
  const drive = getDriveClient()
  const bufferStream = new stream.PassThrough()
  bufferStream.end(fileBuffer)

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [getEnv().GOOGLE_DRIVE_FOLDER_ID],
      mimeType: 'application/pdf',
    },
    media: { mimeType: 'application/pdf', body: bufferStream },
    fields: 'id, name, createdTime',
    supportsAllDrives: true,
  })
  return response.data as DriveFile
}

export async function deleteResume(fileId: string): Promise<void> {
  const drive = getDriveClient()
  await drive.files.delete({ fileId, supportsAllDrives: true })
}

export function generateVersionFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `Resume_${year}-${month}-${day}_v1.0.pdf`
}
