import { describe, expect, it, vi } from 'vitest';
import { deliver, NotConfiguredError, type DeliverDeps } from '@/lib/server/deliver';
import { buildSubmissionEmail } from '@/lib/server/submission-email';

function deps(over: Partial<DeliverDeps> = {}) {
  const d = {
    save: vi.fn(async () => 'doc1'),
    mail: vi.fn(async () => 'sent' as const),
    limiter: { check: vi.fn(() => ({ allowed: true, retryAfterMs: 0 })) },
    log: { error: vi.fn(), warn: vi.fn() },
    ...over,
  };
  return d as typeof d & DeliverDeps;
}

const input = {
  type: 'contact' as const,
  locale: 'fr' as const,
  payload: { name: 'A', email: 'a@b.co', message: 'hello there' },
  ip: '1.2.3.4',
  honeypot: '',
};

const boom = (msg: string) => async () => {
  throw new Error(msg);
};

describe('deliver', () => {
  it('honeypot: fake success, nothing called', async () => {
    const d = deps();
    expect(await deliver({ ...input, honeypot: 'bot' }, d)).toEqual({ status: 'ok', stored: false, mailed: 'skipped' });
    expect(d.save).not.toHaveBeenCalled();
    expect(d.mail).not.toHaveBeenCalled();
    expect(d.limiter.check).not.toHaveBeenCalled();
  });

  it('rate limited', async () => {
    const d = deps({ limiter: { check: vi.fn(() => ({ allowed: false, retryAfterMs: 5 })) } });
    expect(await deliver(input, d)).toEqual({ status: 'rate-limited', stored: false, mailed: 'skipped' });
    expect(d.save).not.toHaveBeenCalled();
    expect(d.mail).not.toHaveBeenCalled();
  });

  it('uses the ip as limiter key', async () => {
    const d = deps();
    await deliver(input, d);
    expect(d.limiter.check).toHaveBeenCalledWith('1.2.3.4');
  });

  it('save ok + mail sent', async () => {
    expect(await deliver(input, deps())).toEqual({ status: 'ok', stored: true, mailed: 'sent' });
  });

  it('save ok + mail skipped', async () => {
    const d = deps({ mail: vi.fn(async () => 'skipped' as const) });
    expect(await deliver(input, d)).toEqual({ status: 'ok', stored: true, mailed: 'skipped' });
  });

  it('save ok + mail throws: still ok, logged', async () => {
    const d = deps({ mail: vi.fn(boom('smtp')) });
    expect(await deliver(input, d)).toEqual({ status: 'ok', stored: true, mailed: 'failed' });
    expect(d.log.error).toHaveBeenCalled();
  });

  it('save throws + mail sent: ok', async () => {
    const d = deps({ save: vi.fn(boom('fs')) });
    expect(await deliver(input, d)).toEqual({ status: 'ok', stored: false, mailed: 'sent' });
    expect(d.log.error).toHaveBeenCalled();
  });

  it('save throws + mail skipped: failed', async () => {
    const d = deps({ save: vi.fn(boom('fs')), mail: vi.fn(async () => 'skipped' as const) });
    expect(await deliver(input, d)).toEqual({ status: 'failed', stored: false, mailed: 'skipped' });
  });

  it('both fail: failed', async () => {
    const d = deps({ save: vi.fn(boom('fs')), mail: vi.fn(boom('smtp')) });
    expect(await deliver(input, d)).toEqual({ status: 'failed', stored: false, mailed: 'failed' });
  });

  it('Firestore not configured + mail skipped: failed', async () => {
    const d = deps({
      save: vi.fn(async () => {
        throw new NotConfiguredError();
      }),
      mail: vi.fn(async () => 'skipped' as const),
    });
    expect(await deliver(input, d)).toEqual({ status: 'failed', stored: false, mailed: 'skipped' });
    expect(d.mail).toHaveBeenCalled();
  });

  it('Firestore not configured + mail sent: ok', async () => {
    const d = deps({
      save: vi.fn(async () => {
        throw new NotConfiguredError();
      }),
    });
    expect(await deliver(input, d)).toEqual({ status: 'ok', stored: false, mailed: 'sent' });
  });
});

describe('buildSubmissionEmail', () => {
  it('builds a contact email with replyTo and escaped html', () => {
    const m = buildSubmissionEmail({
      type: 'contact',
      locale: 'fr',
      payload: { name: '<b>Ada</b>', email: 'a@b.co', message: 'x <script>1</script> & y' },
    });
    expect(m.subject).toBe('[Contact] <b>Ada</b>');
    expect(m.replyTo).toBe('a@b.co');
    expect(m.text).toContain('x <script>1</script> & y');
    expect(m.html).not.toContain('<script>');
    expect(m.html).toContain('&lt;script&gt;1&lt;/script&gt; &amp; y');
    expect(m.html).not.toContain('<b>Ada</b>');
  });

  it('builds a brief subject and strips newlines from it', () => {
    const m = buildSubmissionEmail({
      type: 'brief',
      locale: 'en',
      payload: { projectType: 'new', firstName: 'Ada\r\nBcc: x', lastName: 'L', email: 'a@b.co', pitch: 'p', hasTechTeam: true },
    });
    expect(m.subject).toBe('[Brief] new · Ada Bcc: x L');
    expect(m.text).toContain('hasTechTeam');
    expect(m.replyTo).toBe('a@b.co');
  });
});
