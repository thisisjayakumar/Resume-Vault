import { getStore } from '@netlify/blobs'

const STORE_NAME = 'resumes'

function store() {
  const siteID = process.env.NETLIFY_SITE_ID || '1730880d-a202-4792-b969-0a120ef52188'
  const token = process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_API_TOKEN
  return getStore({ name: STORE_NAME, siteID, token })
}

export interface DriveFile {
  id: string
  name: string
  createdTime: string
  size?: string
  mimeType?: string
}

export async function listResumes(): Promise<DriveFile[]> {
  const s = store()
  const { blobs } = await s.list()
  return blobs.map((b) => ({
    id: b.key,
    name: b.key,
    createdTime: b.lastModified ? new Date(b.lastModified).toISOString() : new Date().toISOString(),
  }))
}

export async function downloadResume(fileId: string): Promise<Buffer> {
  const s = store()
  const data = await s.get(fileId, { type: 'arrayBuffer' })
  if (!data) throw new Error('File not found')
  return Buffer.from(data)
}

export async function getFileMetadata(fileId: string): Promise<DriveFile> {
  return { id: fileId, name: fileId, createdTime: new Date().toISOString() }
}

export async function uploadResume(fileBuffer: Buffer, filename: string): Promise<DriveFile> {
  const s = store()
  const key = filename
  await s.set(key, fileBuffer, { metadata: { mimeType: 'application/pdf' } })
  return { id: key, name: key, createdTime: new Date().toISOString() }
}

export async function deleteResume(fileId: string): Promise<void> {
  const s = store()
  await s.delete(fileId)
}

export function generateVersionFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `Resume_${year}-${month}-${day}_v1.0.pdf`
}