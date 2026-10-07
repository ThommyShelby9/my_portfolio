import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { deliver, NotConfiguredError, SAVE_TIMEOUT_MS, RETENTION_MONTHS, submissionDoc, type DeliverDeps } from '@/lib/server/deliver';
import { buildConfirmationEmail, buildSubmissionEmail } from '@/lib/server/submission-email';

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

afterEach(() => vi.useRealTimers());

describe('deliver', () => {
  it('a Firestore save that hangs past the timeout counts as failed and falls through to email', async () => {
    vi.useFakeTimers();
    const d = deps({ save: vi.fn(() => new Promise<string>(() => {})) });
    const pending = deliver(input, d);
    await vi.advanceTimersByTimeAsync(SAVE_TIMEOUT_MS);
    expect(await pending).toEqual({ status: 'ok', stored: false, mailed: 'sent' });
    expect(d.log.error).toHaveBeenCalledTimes(1);
    expect(d.mail).toHaveBeenCalledTimes(1);
  });

  it('clears the timer once the save is done', async () => {
    vi.useFakeTimers();
    await deliver(input, deps());
    expect(vi.getTimerCount()).toBe(0);
  });

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

const brief = {
  type: 'brief' as const,
  locale: 'fr' as const,
  payload: {
    projectType: 'new',
    pitch: 'Une plateforme <b>RH</b> & paie',
    currentState: 'design',
    teamSize: '2-5',
    hasTechTeam: true,
    hasDesigner: false,
    hasProductOwner: false,
    deadline: '1-3m',
    budget: '15-40k',
    firstName: 'Merlux',
    lastName: 'PANOUMASSI',
    email: 'merlux@example.com',
    prefersCall: true,
  },
};

describe('buildSubmissionEmail (owner copy)', () => {
  it('uses the form labels and readable answers, never raw keys', () => {
    const m = buildSubmissionEmail(brief);
    expect(m.subject).toBe('Nouveau brief · Un nouveau produit · Merlux PANOUMASSI');
    for (const shown of ['Type de besoin', 'Un nouveau produit', 'Des maquettes ou un cahier des charges', '2 à 5 personnes', 'Des développeurs', '1 à 3 mois', 'Oui : je préfère commencer par un appel', 'Français']) {
      expect(m.text, shown).toContain(shown);
    }
    expect(m.text).toMatch(/15\s000 à 40\s000\s€/);
    for (const raw of ['projectType', 'currentState', 'hasTechTeam', 'prefersCall', '15-40k', 'locale']) {
      expect(m.text, raw).not.toContain(raw);
    }
    expect(m.replyTo).toBe('merlux@example.com');
    expect(m.html).toContain('mailto:merlux@example.com');
  });

  it('escapes what the visitor typed in the HTML', () => {
    const m = buildSubmissionEmail(brief);
    expect(m.html).not.toContain('<b>RH</b>');
    expect(m.html).toContain('&lt;b&gt;RH&lt;/b&gt; &amp; paie');
  });

  it('keeps names out of header injection', () => {
    const m = buildSubmissionEmail({ ...brief, payload: { ...brief.payload, firstName: 'Ada\r\nBcc: x' } });
    expect(m.subject).not.toMatch(/[\r\n]/);
  });

  it('builds a contact copy', () => {
    const m = buildSubmissionEmail({ type: 'contact', locale: 'en', payload: { name: 'Ada L', email: 'a@b.co', message: 'x <script>1</script>' } });
    expect(m.subject).toBe('Nouveau message · Ada L');
    expect(m.text).toContain('Anglais');
    expect(m.html).not.toContain('<script>');
  });
});

describe('buildConfirmationEmail (visitor acknowledgement)', () => {
  it('goes to the visitor, in the form language, and replies reach the owner', () => {
    const fr = buildConfirmationEmail(brief);
    expect(fr.to).toBe('merlux@example.com');
    expect(fr.subject).toBe('Votre brief est bien arrivé');
    expect(fr.text).toContain('Bonjour Merlux,');
    expect(fr.text).toContain('sous 48 heures');
    expect(fr.replyTo).toBe('rmissimawu@gmail.com');
    const en = buildConfirmationEmail({ ...brief, locale: 'en' });
    expect(en.subject).toBe('Your brief arrived');
    expect(en.text).toContain('Hello Merlux,');
    expect(en.text).toContain('2 to 5 people');
  });

  it('never repeats free text the visitor typed', () => {
    const m = buildConfirmationEmail({ ...brief, payload: { ...brief.payload, pitch: 'Buy pills at spam.example', notes: 'more spam' } });
    expect(m.text).not.toContain('spam');
    expect(m.html).not.toContain('spam');
    const c = buildConfirmationEmail({ type: 'contact', locale: 'fr', payload: { name: 'Ada Lovelace', email: 'a@b.co', message: 'spam spam' } });
    expect(c.subject).toBe('Votre message est bien arrivé');
    expect(c.text).toContain('Bonjour Ada,');
    expect(c.text).not.toContain('spam');
  });
});

describe('deliver confirmation', () => {
  it('sends the acknowledgement after a successful delivery', async () => {
    const confirm = vi.fn(async () => 'sent' as const);
    const d = deps({ confirm });
    expect(await deliver(input, d)).toEqual({ status: 'ok', stored: true, mailed: 'sent' });
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('a failing acknowledgement never changes the result', async () => {
    const d = deps({ confirm: vi.fn(boom('smtp down')) });
    expect(await deliver(input, d)).toEqual({ status: 'ok', stored: true, mailed: 'sent' });
    expect(d.log.error).toHaveBeenCalledWith('[deliver] confirmation email failed', expect.any(Error));
  });

  it('sends nothing to the visitor when the honeypot is filled, when rate-limited or when delivery failed', async () => {
    const confirm = vi.fn(async () => 'sent' as const);
    await deliver({ ...input, honeypot: 'bot' }, deps({ confirm }));
    await deliver(input, deps({ confirm, limiter: { check: () => ({ allowed: false, retryAfterMs: 1 }) } }));
    await deliver(input, deps({ confirm, save: vi.fn(boom('down')), mail: vi.fn(boom('down')) }));
    expect(confirm).not.toHaveBeenCalled();
  });
});

describe('submissionDoc', () => {
  it('stores type, locale, payload, a server createdAt and expireAt 24 months later, nothing else', () => {
    const now = new Date('2026-09-30T10:15:00Z');
    const doc = submissionDoc({ type: 'contact', locale: 'fr', payload: { name: 'A', email: 'a@b.co', message: 'hi', extra: undefined } }, now);
    expect(Object.keys(doc).sort()).toEqual(['createdAt', 'expireAt', 'locale', 'payload', 'type']);
    expect(doc.payload).toEqual({ name: 'A', email: 'a@b.co', message: 'hi' });
    expect(doc.createdAt).toEqual(FieldValue.serverTimestamp());
    expect(doc.expireAt).toBeInstanceOf(Timestamp);
    expect(doc.expireAt.toDate().toISOString()).toBe('2028-09-30T10:15:00.000Z');
    expect(RETENTION_MONTHS).toBe(24);
  });
});
