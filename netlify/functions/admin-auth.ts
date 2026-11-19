import { verifyAdminPassword, generateToken } from './_shared/security'
import { adminAuthSchema, parseOrError } from './_shared/validate'
import { corsHeaders } from './_shared/cors'
import { requestId, log } from './_shared/logger'
import { errorBody } from './_shared/errors'

interface Event {
  httpMethod: string
  headers: Record<string, string | undefined>
  body: string | null
}

interface Result {
  statusCode: number
  headers: Record<string, string>
  body: string
}

export const handler = async (event: Event): Promise<Result> => {
  const rid = requestId()
  const headers = corsHeaders('POST, OPTIONS')

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify(errorBody('Method not allowed', rid)) }
  }

  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify(errorBody('Invalid JSON', rid)) }
  }

  const v = parseOrError(adminAuthSchema, parsedBody)
  if (!v.ok) {
    return { statusCode: 400, headers, body: JSON.stringify(errorBody(v.message, rid)) }
  }

  try {
    const isValid = await verifyAdminPassword(v.data.password)
    if (!isValid) {
      log('warn', 'admin auth failed', { requestId: rid })
      return { statusCode: 401, headers, body: JSON.stringify(errorBody('Invalid password', rid)) }
    }
    const token = generateToken({ admin: true })
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, token }) }
  } catch (error) {
    log('error', 'admin auth error', { requestId: rid })
    return { statusCode: 500, headers, body: JSON.stringify(errorBody('Authentication failed', rid)) }
  }
}
