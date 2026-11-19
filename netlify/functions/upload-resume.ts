import busboy from 'busboy'
import { verifyAdminPassword } from './_shared/security'
import { uploadResume, generateVersionFilename } from './_shared/drive'
import { addVersion, migrateLegacy } from './_shared/versions'
import { corsHeaders } from './_shared/cors'
import { requestId, log } from './_shared/logger'
import { errorBody } from './_shared/errors'

interface Event {
  httpMethod: string
  headers: Record<string, string | undefined>
  body: string | null
  isBase64Encoded?: boolean
}
interface Result {
  statusCode: number
  headers: Record<string, string>
  body: string
}
interface ParsedFile {
  filename: string
  buffer: Buffer
  mimeType: string
}
interface ParsedForm {
  fields: Record<string, string>
  files: Record<string, ParsedFile>
}

function parseMultipartForm(event: Event): Promise<ParsedForm> {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: event.headers as any })
    const result: ParsedForm = { fields: {}, files: {} }

    bb.on('file', (name: string, file: NodeJS.ReadableStream, info: { filename: string; mimeType: string }) => {
      const chunks: Buffer[] = []
      file.on('data', (data: Buffer) => chunks.push(data))
      file.on('end', () => {
        result.files[name] = {
          filename: info.filename,
          buffer: Buffer.concat(chunks),
          mimeType: info.mimeType,
        }
      })
    })

    bb.on('field', (name: string, value: string) => {
      result.fields[name] = value
    })

    bb.on('finish', () => resolve(result))
    bb.on('error', reject)

    bb.write(event.body || '', event.isBase64Encoded ? 'base64' : 'binary')
    bb.end()
  })
}

export const handler = async (event: Event): Promise<Result> => {
  const rid = requestId()
  const headers = corsHeaders('POST, OPTIONS')

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify(errorBody('Method not allowed', rid)) }
  }

  try {
    const formData = await parseMultipartForm(event)
    const adminPassword = formData.fields.adminPassword
    const resumeFile = formData.files.resume

    if (!resumeFile) {
      return { statusCode: 400, headers, body: JSON.stringify(errorBody('No file uploaded', rid)) }
    }

    const isValid = await verifyAdminPassword(adminPassword)
    if (!isValid) {
      return { statusCode: 401, headers, body: JSON.stringify(errorBody('Invalid admin password', rid)) }
    }

    if (resumeFile.mimeType !== 'application/pdf') {
      return { statusCode: 400, headers, body: JSON.stringify(errorBody('Only PDF files are allowed', rid)) }
    }

    // magic-byte check
    if (resumeFile.buffer.slice(0, 4).toString() !== '%PDF') {
      return { statusCode: 400, headers, body: JSON.stringify(errorBody('Invalid PDF file', rid)) }
    }

    // size cap 10MB
    if (resumeFile.buffer.length > 10 * 1024 * 1024) {
      return { statusCode: 413, headers, body: JSON.stringify(errorBody('File too large', rid)) }
    }

    const filename = generateVersionFilename()
    const uploadedFile = await uploadResume(resumeFile.buffer, filename)

    await migrateLegacy()

    await addVersion({
      fileId: uploadedFile.id,
      name: uploadedFile.name,
      mimeType: 'application/pdf',
      size: resumeFile.buffer.length,
      buffer: resumeFile.buffer,
      createdTime: uploadedFile.createdTime,
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Resume uploaded successfully',
        version: uploadedFile,
      }),
    }
  } catch (error) {
    log('error', 'upload error', { requestId: rid })
    return { statusCode: 500, headers, body: JSON.stringify(errorBody('Upload failed', rid)) }
  }
}
