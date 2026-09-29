import { describe, expect, it } from 'vitest';
import { clientIp } from '@/lib/server/client-ip';

const h = (o: Record<string, string>) => new Headers(o);

describe('clientIp', () => {
  it('prefers cf-connecting-ip, then x-real-ip, then first x-forwarded-for', () => {
    expect(clientIp(h({ 'cf-connecting-ip': '1.1.1.1', 'x-real-ip': '2.2.2.2', 'x-forwarded-for': '3.3.3.3' }))).toBe('1.1.1.1');
    expect(clientIp(h({ 'x-real-ip': '2.2.2.2', 'x-forwarded-for': '3.3.3.3' }))).toBe('2.2.2.2');
    expect(clientIp(h({ 'x-forwarded-for': ' 3.3.3.3 , 4.4.4.4' }))).toBe('3.3.3.3');
  });
  it('falls back to unknown', () => {
    expect(clientIp(h({}))).toBe('unknown');
  });
  it('trims and caps at 64 chars', () => {
    expect(clientIp(h({ 'x-real-ip': '  9.9.9.9  ' }))).toBe('9.9.9.9');
    expect(clientIp(h({ 'x-real-ip': 'a'.repeat(100) }))).toHaveLength(64);
  });
});
