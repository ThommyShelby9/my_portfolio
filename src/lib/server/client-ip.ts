export function clientIp(headers: Headers): string {
  const raw =
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0] ||
    '';
  const ip = raw.trim().slice(0, 64);
  return ip || 'unknown';
}
