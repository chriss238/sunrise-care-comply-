import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendWhatsAppReminder(
  to: string,          // e.g. +6591234567
  nurseName: string,
  certType: string,
  expiryDate: string
) {
  const body =
    `Hi ${nurseName},\n\n` +
    `Your ${certType} expires in 30 days (Due: ${expiryDate}).\n\n` +
    `Please renew before expiry to remain compliant with MOH requirements.\n\n` +
    `- Sunrise Care Home Admin`

  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${to}`,
    body,
  })
}
