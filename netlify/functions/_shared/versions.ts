import { connectToDatabase } from './db'
import crypto from 'crypto'

export interface VersionDoc {
  _id?: string
  id?: string
  documentId: string
  version: number
  versionLabel: string
  isLatest: boolean
  fileId: string
  name: string
  mimeType: string
  size: number
  checksum: string
  date: string
  createdTime: string
  createdAt: Date
}

const DOCUMENT_ID = 'resume'
const KEEP = 3

export async function getNextVersion(documentId: string = DOCUMENT_ID): Promise<number> {
  const { db } = await connectToDatabase()
  const counters = db.collection<any>('counters')
  const res = await counters.findOneAndUpdate(
    { _id: documentId },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  )
  const seq = (res as any)?.value?.seq ?? (res as any)?.seq ?? 1
  return seq as number
}

export async function listVersions(documentId: string = DOCUMENT_ID): Promise<VersionDoc[]> {
  const { db } = await connectToDatabase()
  const col = db.collection<any>('versions')
  const docs = await col.find({ documentId }).sort({ version: -1 }).toArray()
  return docs.map((d) => ({ ...d, id: d.fileId || d.id || String(d._id) }))
}

export async function getVersionById(id: string): Promise<VersionDoc | null> {
  const { db } = await connectToDatabase()
  const col = db.collection<any>('versions')
  const doc = await col.findOne({ $or: [{ fileId: id }, { _id: id as any }] })
  return doc ? { ...doc, id: doc.fileId || String(doc._id) } : null
}

export async function addVersion(input: {
  fileId: string
  name: string
  mimeType: string
  size: number
  buffer: Buffer
  createdTime: string
}): Promise<VersionDoc> {
  const { db } = await connectToDatabase()
  const col = db.collection<any>('versions')

  const version = await getNextVersion()
  const versionLabel = `v${version}.0`
  const checksum = crypto.createHash('sha256').update(input.buffer).digest('hex')

  // mark previous latest false
  await col.updateMany({ documentId: DOCUMENT_ID, isLatest: true }, { $set: { isLatest: false } })

  const doc: VersionDoc = {
    documentId: DOCUMENT_ID,
    version,
    versionLabel,
    isLatest: true,
    fileId: input.fileId,
    name: input.name,
    mimeType: input.mimeType,
    size: input.size,
    checksum,
    date: new Date().toISOString(),
    createdTime: input.createdTime,
    createdAt: new Date(),
  }

  const res = await col.insertOne(doc as any)
  const inserted = { ...doc, _id: String(res.insertedId), id: input.fileId }

  // prune to KEEP latest
  const all = await col.find({ documentId: DOCUMENT_ID }).sort({ version: -1 }).toArray()
  if (all.length > KEEP) {
    const toDelete = all.slice(KEEP)
    for (const v of toDelete) {
      try {
        const { deleteResume } = await import('./drive')
        await deleteResume(v.fileId)
      } catch (e) {
        console.error('Error deleting old version:', e)
      }
      await col.deleteOne({ _id: v._id })
    }
  }

  return inserted
}

export async function migrateLegacy(): Promise<void> {
  const { db } = await connectToDatabase()
  const metaCol = db.collection('metadata')
  const versionsCol = db.collection<any>('versions')
  const doc = await metaCol.findOne({ key: 'versions' })
  const legacy = (doc?.value as any[]) || []
  if (legacy.length === 0) return

  const existing = await versionsCol.countDocuments()
  if (existing > 0) return

  for (let i = 0; i < legacy.length; i++) {
    const v = legacy[i]
    await versionsCol.insertOne({
      documentId: DOCUMENT_ID,
      version: legacy.length - i,
      versionLabel: `v${legacy.length - i}.0`,
      isLatest: i === 0,
      fileId: v.id,
      name: v.name,
      mimeType: 'application/pdf',
      size: 0,
      checksum: '',
      date: v.date,
      createdTime: v.createdTime,
      createdAt: new Date(v.date || v.createdTime || Date.now()),
    } as any)
  }
  // set counter
  await db.collection<any>('counters').updateOne(
    { _id: DOCUMENT_ID },
    { $set: { seq: legacy.length } },
    { upsert: true },
  )
}
