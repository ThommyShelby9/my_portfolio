import { describe, expect, it } from 'vitest';
import { briefSchema } from '@/lib/forms/brief-schema';
import { contactFields, contactSchema } from '@/lib/forms/contact-schema';
import { HONEYPOT_FIELD } from '@/lib/forms/honeypot';
import { parseForm } from '@/lib/forms/parse-form';

function fd(o: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.append(k, v);
  return f;
}

const validBrief = {
  projectType: 'new',
  pitch: 'A marketplace for local farmers.',
  currentState: 'idea',
  teamSize: 'solo',
  deadline: '1-3m',
  budget: '5-15k',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  locale: 'fr',
};

describe('briefSchema', () => {
  it('parses a minimal valid brief with defaults', () => {
    const r = parseForm(briefSchema, fd(validBrief));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data).toMatchObject({
      projectType: 'new',
      hasTechTeam: false,
      hasDesigner: false,
      hasProductOwner: false,
      prefersCall: false,
      budget: '5-15k',
      locale: 'fr',
    });
    expect(r.data.notes).toBeUndefined();
    expect(r.data.company).toBeUndefined();
    expect(r.data.website).toBeUndefined();
  });

  it('coerces checkboxes: on is true, absent is false', () => {
    const r = parseForm(briefSchema, fd({ ...validBrief, hasTechTeam: 'on', prefersCall: 'on' }));
    expect(r.ok && r.data.hasTechTeam).toBe(true);
    expect(r.ok && r.data.prefersCall).toBe(true);
    expect(r.ok && r.data.hasDesigner).toBe(false);
  });

  it('treats empty or "undefined" budget as undefined', () => {
    for (const b of ['', 'undefined']) {
      const r = parseForm(briefSchema, fd({ ...validBrief, budget: b }));
      expect(r.ok).toBe(true);
      expect(r.ok && r.data.budget).toBeUndefined();
    }
  });

  it('accepts optional fields when filled and trims', () => {
    const r = parseForm(
      briefSchema,
      fd({ ...validBrief, company: ' ACME ', website: 'https://acme.io', source: 'LinkedIn', notes: 'hi' }),
    );
    expect(r.ok && r.data).toMatchObject({ company: 'ACME', website: 'https://acme.io', source: 'LinkedIn', notes: 'hi' });
  });

  const errorOf = (patch: Record<string, string>, field: string) => {
    const r = parseForm(briefSchema, fd({ ...validBrief, ...patch }));
    expect(r.ok).toBe(false);
    return r.ok ? [] : (r.fieldErrors[field] ?? []);
  };

  it('returns message keys for each error', () => {
    expect(errorOf({ pitch: 'short' }, 'pitch')).toEqual(['errors.pitchTooShort']);
    expect(errorOf({ pitch: 'x'.repeat(1001) }, 'pitch')).toEqual(['errors.pitchTooLong']);
    expect(errorOf({ projectType: 'nope' }, 'projectType')).toEqual(['errors.required']);
    expect(errorOf({ currentState: '' }, 'currentState')).toEqual(['errors.required']);
    expect(errorOf({ teamSize: 'x' }, 'teamSize')).toEqual(['errors.required']);
    expect(errorOf({ deadline: 'x' }, 'deadline')).toEqual(['errors.required']);
    expect(errorOf({ budget: 'x' }, 'budget')).toEqual(['errors.required']);
    expect(errorOf({ firstName: '  ' }, 'firstName')).toEqual(['errors.required']);
    expect(errorOf({ lastName: '' }, 'lastName')).toEqual(['errors.required']);
    expect(errorOf({ firstName: 'x'.repeat(81) }, 'firstName')).toEqual(['errors.tooLong']);
    expect(errorOf({ email: 'nope' }, 'email')).toEqual(['errors.invalidEmail']);
    expect(errorOf({ email: '' }, 'email')).toEqual(['errors.invalidEmail']);
    expect(errorOf({ website: 'not a url' }, 'website')).toEqual(['errors.invalidUrl']);
    expect(errorOf({ notes: 'x'.repeat(2001) }, 'notes')).toEqual(['errors.tooLong']);
    expect(errorOf({ company: 'x'.repeat(121) }, 'company')).toEqual(['errors.tooLong']);
    expect(errorOf({ source: 'x'.repeat(201) }, 'source')).toEqual(['errors.tooLong']);
    expect(errorOf({ locale: 'de' }, 'locale')).toEqual(['errors.required']);
  });

  it('echoes submitted values on failure', () => {
    const r = parseForm(briefSchema, fd({ ...validBrief, email: 'bad', hp_extra: '' }));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.values.email).toBe('bad');
    expect(r.values.firstName).toBe('Ada');
  });
});

describe('contactSchema', () => {
  const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello, I have a project.', locale: 'en' };

  it('parses a valid message', () => {
    const r = parseForm(contactSchema, fd(valid));
    expect(r.ok && r.data).toEqual(valid);
  });

  it('returns message keys', () => {
    const e = (patch: Record<string, string>, field: string) => {
      const r = parseForm(contactSchema, fd({ ...valid, ...patch }));
      return r.ok ? [] : (r.fieldErrors[field] ?? []);
    };
    expect(e({ name: '' }, 'name')).toEqual(['errors.required']);
    expect(e({ name: 'x'.repeat(121) }, 'name')).toEqual(['errors.tooLong']);
    expect(e({ email: 'x' }, 'email')).toEqual(['errors.invalidEmail']);
    expect(e({ message: 'short' }, 'message')).toEqual(['errors.messageTooShort']);
    expect(e({ message: 'x'.repeat(3001) }, 'message')).toEqual(['errors.messageTooLong']);
    expect(e({ locale: '' }, 'locale')).toEqual(['errors.required']);
  });

  it('echoes values', () => {
    const r = parseForm(contactSchema, fd({ ...valid, message: 'x' }));
    expect(!r.ok && r.values.message).toBe('x');
    expect(!r.ok && r.values.name).toBe('Ada');
  });
});

describe('parseForm echo allow-list', () => {
  it('never echoes the honeypot or $ACTION_* keys when a list is given', () => {
    const r = parseForm(
      contactSchema,
      fd({ name: 'A', email: 'bad', message: 'x', locale: 'fr', hp_extra: 'bot', $ACTION_ID_abc: '1' }),
      contactFields,
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.values).toEqual({ name: 'A', email: 'bad', message: 'x', locale: 'fr' });
  });
});

describe('parseForm line breaks', () => {
  // A textarea counts a line break as one character for maxLength but submits it as CRLF.
  const lines = (count: number, width: number) => Array.from({ length: count }, () => 'x'.repeat(width)).join('\r\n');

  it('normalises CRLF and lone CR to LF before the length checks', () => {
    const pitch = lines(100, 9); // 900 x + 99 breaks: 999 as typed, 1098 as submitted
    expect(pitch.length).toBeGreaterThan(1000);
    const brief = parseForm(briefSchema, fd({ ...validBrief, pitch, notes: lines(200, 9) }));
    expect(brief.ok).toBe(true);
    if (!brief.ok) return;
    expect(brief.data.pitch).toHaveLength(999);
    expect(brief.data.pitch).not.toContain('\r');
    expect(brief.data.notes).toHaveLength(1999);

    const message = lines(300, 9); // 2999 as typed
    const contact = parseForm(contactSchema, fd({ name: 'Ada', email: 'ada@example.com', message, locale: 'fr' }));
    expect(contact.ok && contact.data.message).toBe(message.replace(/\r\n/g, '\n'));
    const cr = parseForm(contactSchema, fd({ name: 'Ada', email: 'ada@example.com', message: 'Line one\rline two', locale: 'fr' }));
    expect(cr.ok && cr.data.message).toBe('Line one\nline two');
  });

  it('still rejects a text over the limit once normalised', () => {
    const r = parseForm(briefSchema, fd({ ...validBrief, pitch: lines(101, 9) })); // 909 + 100 = 1009
    expect(!r.ok && r.fieldErrors.pitch).toEqual(['errors.pitchTooLong']);
  });
});

describe('honeypot field', () => {
  it('is not an autocomplete token and is stripped from the parsed data', () => {
    expect(HONEYPOT_FIELD).toBe('hp_extra');
    const r = parseForm(contactSchema, fd({ name: 'Ada', email: 'ada@example.com', message: 'Hello, a question.', locale: 'fr', [HONEYPOT_FIELD]: 'bot' }));
    expect(r.ok).toBe(true);
    expect(r.ok && HONEYPOT_FIELD in r.data).toBe(false);
  });
});
