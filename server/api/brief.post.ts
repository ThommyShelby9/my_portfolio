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

  await connectMongo()
  const userAgent = getRequestHeader(event, 'user-agent') ?? null
  const doc = await Brief.create({
    ...brief,
    ip,
    userAgent,
    turnstileVerified: true,
  })

  try {
    await sendBriefEmail(brief)
    await Brief.findByIdAndUpdate(doc._id, { notifiedAt: new Date() })
  }
  catch (err) {
    console.error('[brief] email failed', err)
    return {
      success: true,
      briefId: String(doc._id),
      warning: 'persisted_but_email_failed',
    }
  }

  await notifyTelegram(brief)

  return {
    success: true,
    briefId: String(doc._id),
  }
})
