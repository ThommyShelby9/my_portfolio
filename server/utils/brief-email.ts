import type { BriefInput } from './schemas/brief'

const PROJECT_TYPE_LABELS: Record<BriefInput['projectType'], string> = {
  new: 'Build from scratch',
  revamp: 'Revamp / refonte',
  audit: 'Technical audit',
  spot: 'Spot mission',
  unsure: 'Unsure — wants to discuss',
}

const STATE_LABELS: Record<BriefInput['currentState'], string> = {
  idea: 'Idea / paper spec',
  design: 'Mockup / design ready',
  inProgressBlocked: 'In progress, blocked',
  mvpInProd: 'MVP in production',
  existingRevamp: 'Existing product to revamp',
  auditOnly: 'No product, audit only',
}

const TEAM_LABELS: Record<BriefInput['teamSize'], string> = {
  'solo': 'Solo',
  '2-5': '2 — 5 people',
  '6-15': '6 — 15 people',
  '15+': '15+ people',
}

const DEADLINE_LABELS: Record<BriefInput['deadline'], string> = {
  '<1m': 'Under 1 month',
  '1-3m': '1 — 3 months',
  '3-6m': '3 — 6 months',
  'flexible': 'Flexible',
}

export function buildBriefEmailSubject(b: BriefInput): string {
  return `[BRIEF] ${b.firstName} ${b.lastName} — ${b.budget} — ${b.projectType}`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function row(label: string, value: string | null | boolean): string {
  if (value === null || value === undefined || value === '') return ''
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
  return `<tr>
    <td style="padding:8px 12px;color:#888;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;vertical-align:top;width:160px;">${label}</td>
    <td style="padding:8px 12px;color:#111;font-family:'Inter',sans-serif;font-size:14px;line-height:1.5;">${escapeHtml(display)}</td>
  </tr>`
}

export function buildBriefEmailHtml(b: BriefInput): string {
  const checks: string[] = []
  if (b.hasTechTeam) checks.push('Has tech team')
  if (b.hasDesigner) checks.push('Has designer')
  if (b.hasProductOwner) checks.push('Has PO')

  const callNote = b.prefersCall ? '<p style="margin:0 0 24px;padding:12px 16px;background:#f4f6fa;border-left:3px solid #0891b2;font-family:Inter,sans-serif;font-size:14px;color:#111;">⚡ This person <strong>prefers a call first</strong>.</p>' : ''

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#fafaf7;font-family:Inter,sans-serif;color:#111;">
  <div style="max-width:640px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e8e3d8;">
    <p style="margin:0 0 8px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#888;">New brief received</p>
    <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;line-height:1.2;font-weight:400;">${escapeHtml(b.firstName)} ${escapeHtml(b.lastName)}</h1>

    ${callNote}

    <h2 style="margin:24px 0 12px;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#444;">Project</h2>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e8e3d8;">
      ${row('Type', PROJECT_TYPE_LABELS[b.projectType])}
      ${row('Pitch', b.pitch)}
    </table>

    <h2 style="margin:24px 0 12px;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#444;">Context</h2>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e8e3d8;">
      ${row('Stage', STATE_LABELS[b.currentState])}
      ${row('Team size', TEAM_LABELS[b.teamSize])}
      ${row('Resources', checks.join(' · ') || 'None indicated')}
      ${row('Notes', b.notes)}
    </table>

    <h2 style="margin:24px 0 12px;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#444;">Frame</h2>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e8e3d8;">
      ${row('Deadline', `${DEADLINE_LABELS[b.deadline]} (${b.deadline})`)}
      ${row('Budget (EUR)', b.budget)}
    </table>

    <h2 style="margin:24px 0 12px;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#444;">Identity</h2>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e8e3d8;">
      ${row('Email', b.email)}
      ${row('Company', b.company)}
      ${row('Website', b.website)}
      ${row('Source', b.source)}
      ${row('Locale', b.locale.toUpperCase())}
    </table>

    <p style="margin:32px 0 0;font-family:'JetBrains Mono',monospace;font-size:11px;color:#888;">Reply directly to this email — it is set to reply-to ${escapeHtml(b.email)}.</p>
  </div>
</body>
</html>`
}

export function buildBriefEmailText(b: BriefInput): string {
  return `New brief received
====================

${b.firstName} ${b.lastName}
${b.email}${b.company ? ` — ${b.company}` : ''}${b.website ? ` — ${b.website}` : ''}

PROJECT
- Type: ${PROJECT_TYPE_LABELS[b.projectType]}
- Pitch: ${b.pitch}

CONTEXT
- Stage: ${STATE_LABELS[b.currentState]}
- Team size: ${TEAM_LABELS[b.teamSize]}
- Has tech team: ${b.hasTechTeam ? 'yes' : 'no'}
- Has designer: ${b.hasDesigner ? 'yes' : 'no'}
- Has PO: ${b.hasProductOwner ? 'yes' : 'no'}
${b.notes ? `- Notes: ${b.notes}` : ''}

FRAME
- Deadline: ${DEADLINE_LABELS[b.deadline]}
- Budget: ${b.budget}

EXTRA
- Source: ${b.source ?? 'not specified'}
- Locale: ${b.locale.toUpperCase()}
- Prefers a call: ${b.prefersCall ? 'YES' : 'no'}

Reply directly to this email — reply-to is set to ${b.email}.`
}
