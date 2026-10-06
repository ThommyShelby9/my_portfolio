import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { sendMailFn, createTransport } = vi.hoisted(() => {
  const sendMailFn = vi.fn(async () => ({}));
  return { sendMailFn, createTransport: vi.fn((_opts: Record<string, unknown>) => ({ sendMail: sendMailFn })) };
});
vi.mock('nodemailer', () => ({ default: { createTransport } }));

import { sendMail } from '@/lib/server/mailer';

const input = { subject: 's', text: 't' };

beforeEach(() => {
  createTransport.mockClear();
  sendMailFn.mockClear();
});
afterEach(() => vi.unstubAllEnvs());

describe('sendMail', () => {
  it('reads the Coolify names SMTP_FROM and NOTIFICATION_EMAIL when MAIL_* are unset', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.test');
    vi.stubEnv('SMTP_USER', 'apikey');
    vi.stubEnv('SMTP_PASS', 'p');
    vi.stubEnv('MAIL_FROM', '');
    vi.stubEnv('MAIL_TO', '');
    vi.stubEnv('SMTP_FROM', 'site@example.com');
    vi.stubEnv('NOTIFICATION_EMAIL', 'owner@example.com');
    expect(await sendMail(input)).toBe('sent');
    expect(sendMailFn).toHaveBeenCalledWith(expect.objectContaining({ from: 'site@example.com', to: 'owner@example.com' }));
  });

  it('prefers MAIL_FROM and MAIL_TO over the aliases', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.test');
    vi.stubEnv('SMTP_USER', 'u');
    vi.stubEnv('SMTP_PASS', 'p');
    vi.stubEnv('MAIL_FROM', 'a@example.com');
    vi.stubEnv('MAIL_TO', 'b@example.com');
    vi.stubEnv('SMTP_FROM', 'site@example.com');
    vi.stubEnv('NOTIFICATION_EMAIL', 'owner@example.com');
    await sendMail(input);
    expect(sendMailFn).toHaveBeenCalledWith(expect.objectContaining({ from: 'a@example.com', to: 'b@example.com' }));
  });

  it('skips when SMTP env is missing', async () => {
    vi.stubEnv('SMTP_HOST', '');
    vi.stubEnv('SMTP_USER', '');
    vi.stubEnv('SMTP_PASS', '');
    expect(await sendMail(input)).toBe('skipped');
    expect(createTransport).not.toHaveBeenCalled();
  });

  it('uses secure on port 465, with timeouts', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.test');
    vi.stubEnv('SMTP_USER', 'u');
    vi.stubEnv('SMTP_PASS', 'p');
    vi.stubEnv('SMTP_PORT', '465');
    expect(await sendMail(input)).toBe('sent');
    expect(createTransport.mock.calls[0][0]).toMatchObject({
      secure: true,
      requireTLS: false,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  });

  it('is not secure on the default port', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.test');
    vi.stubEnv('SMTP_USER', 'u');
    vi.stubEnv('SMTP_PASS', 'p');
    vi.stubEnv('SMTP_PORT', '');
    await sendMail(input);
    expect(createTransport.mock.calls[0][0]).toMatchObject({ secure: false, requireTLS: true, port: 587 });
  });
});

describe('server modules without env', () => {
  it('import without throwing', async () => {
    vi.stubEnv('FIREBASE_SERVICE_ACCOUNT', '');
    vi.stubEnv('FIRESTORE_EMULATOR_HOST', '');
    await expect(import('@/lib/server/firestore')).resolves.toBeDefined();
    await expect(import('@/lib/server/mailer')).resolves.toBeDefined();
    const { getDb } = await import('@/lib/server/firestore');
    expect(getDb()).toBeNull();
    // The first import of firebase-admin and nodemailer can take several seconds on a cold, slow disk.
  }, 30_000);

  it('warns once with a fixed message on a corrupt service account, without the value', async () => {
    vi.resetModules();
    vi.stubEnv('FIRESTORE_EMULATOR_HOST', '');
    vi.stubEnv('FIREBASE_SERVICE_ACCOUNT', 'SECRETVALUE-not-base64-json');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getDb } = await import('@/lib/server/firestore');
    expect(getDb()).toBeNull();
    expect(getDb()).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0])).not.toContain('SECRETVALUE');
    warn.mockRestore();
  });
});
