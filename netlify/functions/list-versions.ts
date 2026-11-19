import { listVersions } from './_shared/versions'
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
  const headers = corsHeaders('GET, OPTIONS')

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify(errorBody('Method not allowed', rid)) }
  }

  try {
    const versions = await listVersions()
    return { statusCode: 200, headers, body: JSON.stringify({ versions }) }
  } catch (error) {
    log('error', 'list versions error', { requestId: rid })
    return { statusCode: 500, headers, body: JSON.stringify(errorBody('Failed to fetch versions', rid)) }
  }
}
