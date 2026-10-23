import nodemailer from 'nodemailer'

/**
 * Sends mail through SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM).
 * Without SMTP_HOST the message is printed to the server console in development.
 */
export async function sendMail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST
  if (!host) {
    if (process.env.NODE_ENV === 'production') throw new Error('SMTP_HOST is not set; cannot send email')
    console.log(`\n[mail to ${to}] ${subject}\n${text}\n`)
    return
  }
  const port = Number(process.env.SMTP_PORT ?? 587)
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'Clean Community <no-reply@cleancommunity.local>',
    to,
    subject,
    text,
  })
}
