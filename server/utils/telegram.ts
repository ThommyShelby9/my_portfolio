import type { BriefInput } from './schemas/brief'

function escape(s: string): string {
  return s.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}

export async function notifyTelegram(brief: BriefInput): Promise<void> {
  const config = useRuntimeConfig()
  const token = config.telegramBotToken
  const chatId = config.telegramChatId
  if (!token || !chatId) return

  const text
    = `🟢 *Brief reçu*\n`
    + `*${escape(brief.firstName)} ${escape(brief.lastName)}*\n`
    + `${escape(brief.email)}${brief.company ? ` — ${escape(brief.company)}` : ''}\n`
    + `Type: \`${brief.projectType}\` · Budget: \`${brief.budget}\` · Deadline: \`${brief.deadline}\`\n`
    + `${brief.prefersCall ? '⚡ Préfère un appel' : ''}`

  try {
    await $fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      body: {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      },
    })
  }
  catch (err) {
    console.error('[telegram] failed to send notification', err)
  }
}
