import { isMongoHealthy } from '../utils/mongo'

export default defineEventHandler(async (event) => {
  const mongoOk = await isMongoHealthy()
  setResponseStatus(event, mongoOk ? 200 : 503)
  return {
    ok: mongoOk,
    timestamp: new Date().toISOString(),
    services: { mongo: mongoOk ? 'up' : 'down' },
  }
})
