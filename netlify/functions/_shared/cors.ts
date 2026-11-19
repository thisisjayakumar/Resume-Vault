import { getEnv } from './env'

export function corsHeaders(methods: string): Record<string, string> {
  const origin = getEnv().ALLOWED_ORIGIN || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': methods,
    Vary: 'Origin',
  }
}
