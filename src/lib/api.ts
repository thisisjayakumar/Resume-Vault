import axios, { AxiosError } from 'axios'

export const api = axios.create({
  baseURL: '/',
  timeout: 30000,
})

export function errorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    return (err.response?.data as { error?: string } | undefined)?.error || err.message
  }
  if (err instanceof Error) return err.message
  return 'Unknown error'
}
