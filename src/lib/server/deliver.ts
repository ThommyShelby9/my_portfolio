import 'server-only';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from './firestore';
import { sendMail } from './mailer';
import { formLimiter, type RateLimiter } from './rate-limit';
import { buildSubmissionEmail, type Submission } from './submission-email';

export type { Submission };

export class NotConfiguredError extends Error {
  constructor() {
    super('Firestore is not configured');
    this.name = 'NotConfiguredError';
  }
}

export interface DeliverDeps {
  save(sub: Submission): Promise<string>;
  mail(sub: Submission): Promise<'sent' | 'skipped'>;
  limiter: RateLimiter;
  log: Pick<Console, 'error' | 'warn'>;
}

export interface DeliverInput extends Submission {
  ip: string;
  honeypot: string;
}

export interface DeliverResult {
  status: 'ok' | 'rate-limited' | 'failed';
  stored: boolean;
  mailed: 'sent' | 'skipped' | 'failed';
}

async function defaultSave(sub: Submission): Promise<string> {
  const db = getDb();
  if (!db) throw new NotConfiguredError();
  // Firestore rejects undefined values.
  const payload = JSON.parse(JSON.stringify(sub.payload));
  const ref = await db.collection('submissions').add({
    type: sub.type,
    locale: sub.locale,
    payload,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

const defaultDeps: DeliverDeps = {
  save: defaultSave,
  mail: (sub) => sendMail(buildSubmissionEmail(sub)),
  limiter: formLimiter,
  log: console,
};

export async function deliver(
  { type, locale, payload, ip, honeypot }: DeliverInput,
  deps: DeliverDeps = defaultDeps,
): Promise<DeliverResult> {
  if (honeypot.trim() !== '') return { status: 'ok', stored: false, mailed: 'skipped' };
  if (!deps.limiter.check(ip).allowed) return { status: 'rate-limited', stored: false, mailed: 'skipped' };

  const sub: Submission = { type, locale, payload };

  let stored = false;
  try {
    await deps.save(sub);
    stored = true;
  } catch (err) {
    if (err instanceof NotConfiguredError) deps.log.warn('[deliver] Firestore not configured, falling back to email');
    else deps.log.error('[deliver] Firestore save failed', err);
  }

  let mailed: DeliverResult['mailed'];
  try {
    mailed = await deps.mail(sub);
  } catch (err) {
    deps.log.error('[deliver] email failed', err);
    mailed = 'failed';
  }

  const ok = stored || mailed === 'sent';
  return { status: ok ? 'ok' : 'failed', stored, mailed };
}
