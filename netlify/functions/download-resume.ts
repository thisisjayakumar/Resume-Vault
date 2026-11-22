import { verifyPassword, getClientIP, checkRateLimit } from './_shared/security'
import { getIPAttempts, updateIPAttempts, resetIPAttempts } from './_shared/db'
import { listVersions, getVersionById } from './_shared/versions'
import { downloadResume } from './_shared/drive'
import { verifyTurnstile } from './_shared/turnstile'
import { downloadSchema, parseOrError } from './_shared/validate'
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
  isBase64Encoded?: boolean
}

export const handler = async (event: Event): Promise<Result> => {
  const rid = requestId()
  const headers = corsHeaders('POST, OPTIONS')

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify(errorBody('Method not allowed', rid)) }
  }

  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify(errorBody('Invalid JSON', rid)) }
  }

  const v = parseOrError(downloadSchema, parsedBody)
  if (!v.ok) {
    return { statusCode: 400, headers, body: JSON.stringify(errorBody(v.message, rid)) }
  }

  try {
    const clientIP = getClientIP(event)
    const attemptData = await getIPAttempts(clientIP)
    const rateCheck = checkRateLimit(attemptData)

    if (!rateCheck.allowed) {
      if (rateCheck.shouldLock) {
        await updateIPAttempts(clientIP, {
          attempts: 3,
          locked: true,
          lockExpiry: rateCheck.lockExpiry ?? null,
          lastAttempt: Date.now(),
        })
      }
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Too many failed attempts. Account locked.',
          locked: true,
          timeRemaining: rateCheck.timeRemaining,
        }),
      }
    }

    const turnstileOk = await verifyTurnstile(v.data.turnstileToken, clientIP)
    if (!turnstileOk) {
      return { statusCode: 403, headers, body: JSON.stringify(errorBody('Captcha verification failed', rid)) }
    }

    const isValid = await verifyPassword(v.data.password)
    if (!isValid) {
      const newAttempts = (attemptData?.attempts || 0) + 1
      await updateIPAttempts(clientIP, {
        attempts: newAttempts,
        locked: false,
        lastAttempt: Date.now(),
      })
      log('warn', 'invalid password', { requestId: rid, remaining: 3 - newAttempts })
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: 'Incorrect password',
          remainingAttempts: 3 - newAttempts,
        }),
      }
    }

    await resetIPAttempts(clientIP)

    let fileId: string
    let fileName: string

    if (v.data.versionId) {
      const version = await getVersionById(v.data.versionId)
      if (!version) {
        return { statusCode: 404, headers, body: JSON.stringify(errorBody('Version not found', rid)) }
      }
      fileId = version.fileId
      fileName = version.name
    } else {
      const versions = await listVersions()
      if (!versions || versions.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify(errorBody('No resumes available', rid)) }
      }
      const latest = versions.find((vr) => vr.isLatest) || versions[0]
      fileId = latest.fileId
      fileName = latest.name
    }

    const fileBuffer = await downloadResume(fileId)

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(fileBuffer.length),
      },
      body: fileBuffer.toString('base64'),
      isBase64Encoded: true,
    }
  } catch (error) {
    log('error', 'download error', { requestId: rid })
    return { statusCode: 500, headers, body: JSON.stringify(errorBody('Download failed', rid)) }
  }
}
