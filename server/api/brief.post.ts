import { Brief } from '~/models/Brief'
import { briefSchema } from '../utils/schemas/brief'
import { connectMongo } from '../utils/mongo'
import { verifyTurnstile } from '../utils/turnstile'
import { sendBriefEmail } from '../utils/mailer'
import { notifyTelegram } from '../utils/telegram'
import { getBriefRateLimiter } from '../utils/rate-limiter'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const limiter = getBriefRateLimiter()
  const r = limiter.check(ip)
  if (!r.allowed) {
    setResponseHeader(event, 'Retry-After', Math.ceil((r.retryAfterMs ?? 0) / 1000))
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: {
        message: 'Trop de soumissions depuis ton IP. Réessaye dans une heure.',
        message_en: 'Too many submissions from your IP. Try again in an hour.',
      },
    })
  }

  const raw = await readBody(event)
  const parsed = briefSchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: {
        issues: parsed.error.issues.map(i => ({ path: i.path, message: i.message })),
      },
    })
  }
  const brief = parsed.data

  const turnstileOk = await verifyTurnstile(brief.turnstileToken, ip)
  if (!turnstileOk) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Captcha verification failed',
      data: {
        message: 'Vérification anti-robot échouée. Recharge la page et réessaye.',
        message_en: 'Anti-bot verification failed. Reload the page and retry.',
      },
    })
  }

  const userAgent = getRequestHeader(event, 'user-agent') ?? null

  // Try to persist in MongoDB first. If the DB isn't configured/reachable
  // we degrade gracefully — the email + Telegram path still runs so the
  // submission is never silently dropped, just not archived in Mongo.
  let briefId: string | null = null
  let mongoFailed = false
  try {
    await connectMongo()
    const doc = await Brief.create({
      ...brief,
      ip,
      userAgent,
      turnstileVerified: true,
    })
    briefId = String(doc._id)
  }
  catch (err) {
    mongoFailed = true
    console.error('[brief] mongo persist failed (continuing with email)', err)
  }

  // Email — the actual delivery channel to Rostel's inbox.
  let emailFailed = false
  try {
    await sendBriefEmail(brief)
    if (briefId) {
      try { await Brief.findByIdAndUpdate(briefId, { notifiedAt: new Date() }) }
      catch { /* mongo write failure here is not blocking */ }
    }
  }
  catch (err) {
    emailFailed = true
    console.error('[brief] email send failed', err)
  }

  // Telegram is best-effort.
  try { await notifyTelegram(brief) }
  catch (err) { console.error('[brief] telegram notify failed', err) }

  // Hard fail only if BOTH channels are dead — at that point we have no
  // way to reach Rostel and should surface a real error to the user.
  if (mongoFailed && emailFailed) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Brief could not be delivered',
      data: {
        message: 'Impossible d\'enregistrer ou d\'envoyer le brief. Écris-moi directement à rmissimawu@gmail.com.',
        message_en: 'Could not save or deliver the brief. Email me directly at rmissimawu@gmail.com.',
      },
    })
  }

  return {
    success: true,
    briefId,
    warnings: [
      mongoFailed ? 'mongo_unavailable' : null,
      emailFailed ? 'email_failed' : null,
    ].filter(Boolean),
  }
})
