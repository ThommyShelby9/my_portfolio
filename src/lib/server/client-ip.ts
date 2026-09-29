/**
 * Topology assumption: the app runs on Coolify behind a single Traefik reverse
 * proxy, with no Cloudflare in front today. Traefik sets and overwrites
 * `x-real-ip` and appends the peer address to `x-forwarded-for`, so those are
 * the only headers a client cannot forge. `cf-connecting-ip` is client-controlled
 * unless Cloudflare really sits in front, so it is honoured only when
 * TRUST_CF_CONNECTING_IP=1. For `x-forwarded-for` we take the RIGHTMOST entry,
 * the one appended by the last trusted proxy, never the leftmost (spoofable).
 */
export function clientIp(headers: Headers): string {
  const trustCf = process.env.TRUST_CF_CONNECTING_IP === '1';
  const forwarded = headers
    .get('x-forwarded-for')
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .pop();
  const raw =
    (trustCf ? headers.get('cf-connecting-ip') : null) ||
    headers.get('x-real-ip') ||
    forwarded ||
    '';
  const ip = raw.trim().slice(0, 64);
  return ip || 'unknown';
}
