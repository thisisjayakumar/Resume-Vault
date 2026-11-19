import { z } from 'zod'

export const passwordSchema = z.string().min(1).max(256)
export const adminAuthSchema = z.object({ password: passwordSchema })
export const downloadSchema = z.object({
  password: passwordSchema,
  versionId: z.string().min(1).max(128).nullable().optional(),
  turnstileToken: z.string().max(2048).optional(),
})

export function parseOrError<T>(schema: z.ZodType<T>, data: unknown): { ok: true; data: T } | { ok: false; message: string } {
  const r = schema.safeParse(data)
  if (r.success) return { ok: true, data: r.data }
  return { ok: false, message: r.error.issues.map((i) => i.message).join('; ') }
}
