import nodemailer, { type Transporter } from 'nodemailer'
import type { BriefInput } from './schemas/brief'
import {
  buildBriefEmailHtml,
  buildBriefEmailSubject,
  buildBriefEmailText,
} from './brief-email'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (transporter) return transporter
  const config = useRuntimeConfig()
  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    throw new Error('SMTP credentials missing — set SMTP_HOST/USER/PASS')
  }
  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort) || 587,
    secure: Number(config.smtpPort) === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  })
  return transporter
}

export async function sendBriefEmail(brief: BriefInput): Promise<void> {
  const config = useRuntimeConfig()
  const t = getTransporter()
  await t.sendMail({
    from: { name: 'Rostel Portfolio', address: config.smtpFrom },
    to: config.notificationEmail,
    replyTo: brief.email,
    subject: buildBriefEmailSubject(brief),
    text: buildBriefEmailText(brief),
    html: buildBriefEmailHtml(brief),
  })
}
