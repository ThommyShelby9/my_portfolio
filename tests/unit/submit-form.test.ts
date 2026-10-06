import { beforeEach, describe, expect, it, vi } from 'vitest';

const deliver = vi.fn();
const redirect = vi.fn((url: string) => {
  throw Object.assign(new Error('NEXT_REDIRECT'), { url });
});

vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-real-ip': '203.0.113.7' }) }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => redirect(url) }));
vi.mock('@/lib/server/deliver', () => ({ deliver: (...args: unknown[]) => deliver(...args) }));

const { submitForm } = await import('@/lib/server/submit-form');
const { contactFields, contactSchema } = await import('@/lib/forms/contact-schema');

function form(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.append(k, v);
  return fd;
}

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello, a short question.', locale: 'en' };
const run = (fd: FormData) =>
  submitForm({ type: 'contact', schema: contactSchema, fields: contactFields, formData: fd, thanks: '/brief/merci' });

describe('submitForm', () => {
  beforeEach(() => {
    deliver.mockReset();
    redirect.mockClear();
  });

  it('returns field errors and echoes allow-listed values only, without delivering', async () => {
    const state = await run(form({ name: '', email: 'nope', message: 'hi', locale: 'fr', hp_extra: 'bot', $ACTION_ID_x: '' }));
    expect(state.status).toBe('invalid');
    expect(Object.keys(state.fieldErrors).sort()).toEqual(['email', 'message', 'name']);
    expect(state.values).toEqual({ name: '', email: 'nope', message: 'hi', locale: 'fr' });
    expect(deliver).not.toHaveBeenCalled();
  });

  it('delivers the payload without the locale, with the proxy IP and the honeypot, then redirects to the localized thank-you page', async () => {
    deliver.mockResolvedValue({ status: 'ok', stored: true, mailed: 'skipped' });
    await expect(run(form({ ...valid, hp_extra: '' }))).rejects.toThrow('NEXT_REDIRECT');
    expect(deliver).toHaveBeenCalledWith({
      type: 'contact',
      locale: 'en',
      payload: { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello, a short question.' },
      ip: '203.0.113.7',
      honeypot: '',
    });
    expect(redirect).toHaveBeenCalledWith('/en/brief/thanks');
  });

  it('passes a filled honeypot through so deliver can fake the success', async () => {
    deliver.mockResolvedValue({ status: 'ok', stored: false, mailed: 'skipped' });
    await expect(run(form({ ...valid, locale: 'fr', hp_extra: 'spam' }))).rejects.toThrow('NEXT_REDIRECT');
    expect(deliver.mock.calls[0][0].honeypot).toBe('spam');
    expect(redirect).toHaveBeenCalledWith('/brief/merci');
  });

  for (const status of ['rate-limited', 'failed'] as const) {
    it(`returns the ${status} state and keeps the values`, async () => {
      deliver.mockResolvedValue({ status, stored: false, mailed: 'failed' });
      const state = await run(form({ ...valid, hp_extra: '' }));
      expect(state).toEqual({ status, fieldErrors: {}, values: valid });
      expect(redirect).not.toHaveBeenCalled();
    });
  }
});
