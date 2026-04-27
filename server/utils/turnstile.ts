type TurnstileResponse = {
  'success': boolean
  'error-codes'?: string[]
  'challenge_ts'?: string
  'hostname'?: string
  'action'?: string
  'cdata'?: string
}

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const config = useRuntimeConfig()
  const secret = config.turnstileSecretKey

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[turnstile] TURNSTILE_SECRET_KEY missing in production')
      return false
    }
    return true
  }

  try {
    const body = new URLSearchParams()
    body.append('secret', secret)
    body.append('response', token)
    if (ip) body.append('remoteip', ip)

    const res = await $fetch<TurnstileResponse>(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body,
      },
    )
    return res.success === true
  }
  catch (err) {
    console.error('[turnstile] verification request failed', err)
    return false
  }
}
