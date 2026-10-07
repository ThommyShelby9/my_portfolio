import 'server-only';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getDb } from './firestore';
import { sendMail } from './mailer';
import { formLimiter, type RateLimiter } from './rate-limit';
import { buildConfirmationEmail, buildSubmissionEmail, type Submission } from './submission-email';

export type { Submission };

export class NotConfiguredError extends Error {
  constructor() {
    super('Firestore is not configured');
    this.name = 'NotConfiguredError';
  }
}

/** Milliseconds the Firestore save may take before it counts as failed and the email takes over. */
export const SAVE_TIMEOUT_MS = 8000;

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const late = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Firestore save timed out')), ms);
  });
  return Promise.race([work, late]).finally(() => clearTimeout(timer));
}

export interface DeliverDeps {
  save(sub: Submission): Promise<string>;
  mail(sub: Submission): Promise<'sent' | 'skipped'>;
  /** Acknowledgement to the visitor, best effort: its failure never changes the result. */
  confirm?(sub: Submission): Promise<'sent' | 'skipped'>;
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

/** Months a submission is kept. A Firestore TTL policy on `expireAt` deletes it afterwards. */
export const RETENTION_MONTHS = 24;

/** The stored document: no IP, no user agent; `expireAt` is `createdAt` plus the retention period. */
export function submissionDoc(sub: Submission, now: Date = new Date()) {
  const expire = new Date(now);
  expire.setUTCMonth(expire.getUTCMonth() + RETENTION_MONTHS);
  return {
    type: sub.type,
    locale: sub.locale,
    // Firestore rejects undefined values.
    payload: JSON.parse(JSON.stringify(sub.payload)),
    createdAt: FieldValue.serverTimestamp(),
    expireAt: Timestamp.fromDate(expire),
  };
}

async function defaultSave(sub: Submission): Promise<string> {
  const db = getDb();
  if (!db) throw new NotConfiguredError();
  const ref = await db.collection('submissions').add(submissionDoc(sub));
  return ref.id;
}

const defaultDeps: DeliverDeps = {
  save: defaultSave,
  mail: (sub) => sendMail(buildSubmissionEmail(sub)),
  confirm: (sub) => sendMail(buildConfirmationEmail(sub)),
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
    await withTimeout(deps.save(sub), SAVE_TIMEOUT_MS);
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
  if (ok && deps.confirm) {
    try {
      await deps.confirm(sub);
    } catch (err) {
      deps.log.error('[deliver] confirmation email failed', err);
    }
  }
  return { status: ok ? 'ok' : 'failed', stored, mailed };
}
