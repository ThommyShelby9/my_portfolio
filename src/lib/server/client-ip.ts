/**
 * Topology: Cloudflare proxies the domain, then Coolify's Traefik reverse proxy forwards to the app.
 * Behind Cloudflare, `x-real-ip` and the rightmost `x-forwarded-for` entry are a Cloudflare edge
 * address shared by many visitors, so the real visitor is `cf-connecting-ip` (set and overwritten by
 * Cloudflare). It is trusted by default; set TRUST_CF_CONNECTING_IP=0 when the app is served without
 * Cloudflare. The header is client-controlled for anyone who reaches the origin directly, so the owner
 * restricts the origin to Cloudflare's IP ranges (README). Without Cloudflare, Traefik sets and
 * overwrites `x-real-ip` and appends the peer address to `x-forwarded-for`: we take `x-real-ip`, then
 * the RIGHTMOST `x-forwarded-for` entry (the one the last trusted proxy appended), never the leftmost.
 */
export function trustCloudflare(): boolean {
  return process.env.TRUST_CF_CONNECTING_IP !== '0';
}

export function clientIp(headers: Headers): string {
  const forwarded = headers
    .get('x-forwarded-for')
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .pop();
  const raw =
    (trustCloudflare() ? headers.get('cf-connecting-ip') : null) ||
    headers.get('x-real-ip') ||
    forwarded ||
    '';
  const ip = raw.trim().slice(0, 64);
  return ip || 'unknown';
}
