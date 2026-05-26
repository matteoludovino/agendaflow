import { formatDate, formatDateTime, formatCurrency, formatDuration } from "@/lib/utils"
import { APP_CONFIG } from "@/lib/constants/config"

interface EmailData {
  to: string
  subject: string
  html: string
}

async function sendEmail(data: EmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY não configurado — e-mail ignorado")
    return
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? `${APP_CONFIG.name} <noreply@agendaflow.com.br>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error("[email] Falha ao enviar:", body)
  }
}

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
        <tr>
          <td style="padding:24px 32px;background:#09090b;">
            <span style="color:#fff;font-size:16px;font-weight:600;">${APP_CONFIG.name}</span>
          </td>
        </tr>
        <tr><td style="padding:32px;">${content}</td></tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f4f4f5;text-align:center;">
            <span style="color:#a1a1aa;font-size:12px;">
              Enviado por ${APP_CONFIG.name} &middot;
              <a href="${APP_CONFIG.url}" style="color:#a1a1aa;">agendaflow.com.br</a>
            </span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export interface AppointmentEmailParams {
  clientName: string
  clientEmail: string
  professionalName: string
  professionalEmail: string
  serviceName: string
  serviceDuration: number
  servicePrice: number
  startAt: Date
  timezone: string
}

export async function sendClientConfirmationEmail(
  params: AppointmentEmailParams
): Promise<void> {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#09090b;">✅ Agendamento confirmado!</h2>
    <p style="margin:0 0 24px;color:#52525b;font-size:15px;">
      Olá, <strong>${params.clientName}</strong>! Seu agendamento foi confirmado com sucesso.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f9f9f9;border-radius:8px;border:1px solid #e4e4e7;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;color:#71717a;font-size:13px;width:120px;">Serviço</td>
              <td style="padding:6px 0;color:#09090b;font-size:14px;font-weight:500;">
                ${params.serviceName}
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#71717a;font-size:13px;">Profissional</td>
              <td style="padding:6px 0;color:#09090b;font-size:14px;font-weight:500;">
                ${params.professionalName}
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#71717a;font-size:13px;">Data e hora</td>
              <td style="padding:6px 0;color:#09090b;font-size:14px;font-weight:500;">
                ${formatDateTime(params.startAt)}
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#71717a;font-size:13px;">Duração</td>
              <td style="padding:6px 0;color:#09090b;font-size:14px;font-weight:500;">
                ${formatDuration(params.serviceDuration)}
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#71717a;font-size:13px;">Valor</td>
              <td style="padding:6px 0;color:#09090b;font-size:14px;font-weight:500;">
                ${params.servicePrice === 0 ? "Gratuito" : formatCurrency(params.servicePrice)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#71717a;font-size:13px;line-height:1.6;">
      Se precisar cancelar ou reagendar, entre em contato com o profissional diretamente pelo e-mail
      <a href="mailto:${params.professionalEmail}" style="color:#09090b;">${params.professionalEmail}</a>.
    </p>
  `

  await sendEmail({
    to: params.clientEmail,
    subject: `Agendamento confirmado — ${params.serviceName} com ${params.professionalName}`,
    html: baseTemplate(content),
  })
}

export async function sendProfessionalNotificationEmail(
  params: AppointmentEmailParams
): Promise<void> {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#09090b;">📅 Novo agendamento!</h2>
    <p style="margin:0 0 24px;color:#52525b;font-size:15px;">
      <strong>${params.clientName}</strong> agendou um horário com você.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f9f9f9;border-radius:8px;border:1px solid #e4e4e7;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;color:#71717a;font-size:13px;width:120px;">Cliente</td>
              <td style="padding:6px 0;color:#09090b;font-size:14px;font-weight:500;">
                ${params.clientName}
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#71717a;font-size:13px;">E-mail</td>
              <td style="padding:6px 0;font-size:14px;">
                <a href="mailto:${params.clientEmail}" style="color:#09090b;">${params.clientEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#71717a;font-size:13px;">Serviço</td>
              <td style="padding:6px 0;color:#09090b;font-size:14px;font-weight:500;">
                ${params.serviceName}
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#71717a;font-size:13px;">Data e hora</td>
              <td style="padding:6px 0;color:#09090b;font-size:14px;font-weight:500;">
                ${formatDateTime(params.startAt)}
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#71717a;font-size:13px;">Duração</td>
              <td style="padding:6px 0;color:#09090b;font-size:14px;font-weight:500;">
                ${formatDuration(params.serviceDuration)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <a href="${APP_CONFIG.url}/dashboard/appointments"
      style="display:inline-block;background:#09090b;color:#fff;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;">
      Ver no dashboard →
    </a>
  `

  await sendEmail({
    to: params.professionalEmail,
    subject: `Novo agendamento: ${params.clientName} — ${formatDate(params.startAt)}`,
    html: baseTemplate(content),
  })
}
