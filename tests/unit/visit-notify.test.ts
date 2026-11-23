import { describe, expect, it } from 'vitest';
import { describeAgent, headerText, sourceHost } from '@/lib/server/visit-notify';

describe('describeAgent', () => {
  it.each([
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36', 'desktop', 'Windows', 'Chrome'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 Edg/140.0', 'desktop', 'Windows', 'Edge'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1', 'mobile', 'iOS', 'Safari'],
    ['Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0 Mobile/15E148 Safari/604.1', 'tablet', 'iOS', 'Chrome'],
    ['Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36', 'tablet', 'Android', 'Chrome'],
    ['Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0 Mobile Safari/537.36', 'mobile', 'Android', 'Samsung Internet'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:133.0) Gecko/20100101 Firefox/133.0', 'desktop', 'macOS', 'Firefox'],
    ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 OPR/115.0', 'desktop', 'Linux', 'Opera'],
  ])('%s', (ua, device, os, browser) => {
    expect(describeAgent(ua)).toEqual({ device, os, browser });
  });
});

describe('headerText', () => {
  it('decodes a UTF-8 city sent as Latin-1 bytes, keeps plain text, drops control characters', () => {
    expect(headerText(Buffer.from('Zürich', 'utf8').toString('latin1'))).toBe('Zürich');
    expect(headerText('Cotonou')).toBe('Cotonou');
    expect(headerText('Porto\nNovo')).toBe('Porto Novo');
    expect(headerText(null)).toBeNull();
    expect(headerText('   ')).toBeNull();
  });
});

describe('sourceHost', () => {
  it('keeps another site, without www, and ignores the site itself and odd referrers', () => {
    expect(sourceHost('https://www.google.com/search?q=x', 'rostelmissimawu.com')).toBe('google.com');
    expect(sourceHost('https://www.rostelmissimawu.com/en', 'rostelmissimawu.com')).toBeNull();
    expect(sourceHost('http://localhost:3100/x', 'localhost:3100')).toBeNull();
    expect(sourceHost('javascript:alert(1)', 'a.com')).toBeNull();
    expect(sourceHost('', 'a.com')).toBeNull();
    expect(sourceHost(42, 'a.com')).toBeNull();
  });
});
