import 'server-only';
import nodemailer from 'nodemailer';

export interface MailInput {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

const FALLBACK_TO = 'rmissimawu@gmail.com';

export async function sendMail(input: MailInput): Promise<'sent' | 'skipped'> {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return 'skipped';
  const to = process.env.MAIL_TO || FALLBACK_TO;
  const port = Number(process.env.SMTP_PORT) || 587;
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM || SMTP_USER,
    to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo,
  });
  return 'sent';
}
