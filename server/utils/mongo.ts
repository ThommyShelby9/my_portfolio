import mongoose from 'mongoose'

type Cache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: Cache | undefined
}

const cache: Cache = globalThis.__mongooseCache ?? (globalThis.__mongooseCache = { conn: null, promise: null })

export async function connectMongo() {
  if (cache.conn) return cache.conn

  const uri = useRuntimeConfig().mongodbUri
  if (!uri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MONGODB_URI is not configured',
    })
  }

  if (!cache.promise) {
    mongoose.set('strictQuery', true)
    cache.promise = mongoose.connect(uri, {})
  }

  cache.conn = await cache.promise
  return cache.conn
}

export async function isMongoHealthy(): Promise<boolean> {
  try {
    const conn = await connectMongo()
    return conn.connection.readyState === 1
  }
  catch {
    return false
  }
}
