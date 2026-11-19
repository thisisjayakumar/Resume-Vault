import { MongoClient, Db, Collection } from 'mongodb'
import { getEnv } from './env'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const env = getEnv()
  const client = await MongoClient.connect(env.MONGODB_URI)
  const db = client.db(env.MONGODB_DB_NAME || 'database')

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export interface IPAttempt {
  ip: string
  attempts: number
  locked: boolean
  lockExpiry?: number | null
  lastAttempt?: number | null
  updatedAt?: Date
}

export async function getIPAttempts(ip: string): Promise<IPAttempt | null> {
  try {
    const { db } = await connectToDatabase()
    const collection: Collection<IPAttempt> = db.collection('ip_attempts')
    const result = await collection.findOne({ ip })
    return result
  } catch (error) {
    console.error('Error getting IP attempts:', error)
    return null
  }
}

export async function updateIPAttempts(ip: string, data: Partial<IPAttempt>): Promise<IPAttempt | null> {
  try {
    const { db } = await connectToDatabase()
    const collection: Collection<IPAttempt> = db.collection('ip_attempts')

    const result = await collection.findOneAndUpdate(
      { ip },
      { $set: { ip, ...data, updatedAt: new Date() } },
      { upsert: true, returnDocument: 'after' },
    )

    return (result as any)?.value ?? result ?? null
  } catch (error) {
    console.error('Error updating IP attempts:', error)
    throw error
  }
}

export async function resetIPAttempts(ip: string): Promise<IPAttempt | null> {
  return updateIPAttempts(ip, {
    attempts: 0,
    locked: false,
    lockExpiry: null,
    lastAttempt: null,
  })
}

export interface VersionMeta {
  id: string
  name: string
  date: string
  createdTime: string
}

export async function getVersionsMetadata(): Promise<VersionMeta[]> {
  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('metadata')
    const result = await collection.findOne({ key: 'versions' })
    return (result?.value as VersionMeta[]) || []
  } catch (error) {
    console.error('Error getting versions metadata:', error)
    return []
  }
}

export async function updateVersionsMetadata(versions: VersionMeta[]): Promise<unknown> {
  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('metadata')
    const result = await collection.findOneAndUpdate(
      { key: 'versions' },
      { $set: { key: 'versions', value: versions, updatedAt: new Date() } },
      { upsert: true, returnDocument: 'after' },
    )
    return (result as any)?.value ?? result
  } catch (error) {
    console.error('Error updating versions metadata:', error)
    throw error
  }
}
