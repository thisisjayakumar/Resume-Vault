export interface ApiError {
  error: string
  requestId?: string
}

export function errorBody(message: string, requestId?: string): ApiError {
  return requestId ? { error: message, requestId } : { error: message }
}

export function safeMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Unknown error'
}
