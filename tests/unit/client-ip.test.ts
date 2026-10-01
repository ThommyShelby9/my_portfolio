import { afterEach, describe, expect, it, vi } from 'vitest';
import { clientIp } from '@/lib/server/client-ip';

const h = (o: Record<string, string>) => new Headers(o);

afterEach(() => vi.unstubAllEnvs());

describe('clientIp', () => {
  it('prefers x-real-ip, then the rightmost x-forwarded-for entry', () => {
    expect(clientIp(h({ 'x-real-ip': '2.2.2.2', 'x-forwarded-for': '3.3.3.3' }))).toBe('2.2.2.2');
    expect(clientIp(h({ 'x-forwarded-for': ' 3.3.3.3 , 4.4.4.4 ' }))).toBe('4.4.4.4');
    expect(clientIp(h({ 'x-forwarded-for': '3.3.3.3, ,' }))).toBe('3.3.3.3');
  });
  it('trusts cf-connecting-ip by default (Cloudflare is in front)', () => {
    vi.stubEnv('TRUST_CF_CONNECTING_IP', '');
    expect(clientIp(h({ 'cf-connecting-ip': '1.1.1.1', 'x-real-ip': '172.64.0.1', 'x-forwarded-for': '1.1.1.1, 172.64.0.1' }))).toBe('1.1.1.1');
    expect(clientIp(h({ 'x-real-ip': '2.2.2.2' }))).toBe('2.2.2.2');
    vi.stubEnv('TRUST_CF_CONNECTING_IP', '1');
    expect(clientIp(h({ 'cf-connecting-ip': '1.1.1.1', 'x-real-ip': '2.2.2.2' }))).toBe('1.1.1.1');
  });
  it('ignores cf-connecting-ip when TRUST_CF_CONNECTING_IP=0 (no Cloudflare in front)', () => {
    vi.stubEnv('TRUST_CF_CONNECTING_IP', '0');
    expect(clientIp(h({ 'cf-connecting-ip': '6.6.6.6', 'x-real-ip': '2.2.2.2' }))).toBe('2.2.2.2');
    expect(clientIp(h({ 'cf-connecting-ip': '6.6.6.6' }))).toBe('unknown');
  });
  it('falls back to unknown', () => {
    expect(clientIp(h({}))).toBe('unknown');
  });
  it('trims and caps at 64 chars', () => {
    expect(clientIp(h({ 'x-real-ip': '  9.9.9.9  ' }))).toBe('9.9.9.9');
    expect(clientIp(h({ 'x-real-ip': 'a'.repeat(100) }))).toHaveLength(64);
  });
});
