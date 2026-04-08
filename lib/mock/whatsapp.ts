export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  language: string = 'en'
) {
  console.log('📱 [MOCK WhatsApp] Sending to:', phoneNumber)
  console.log('Language:', language)
  console.log('Message:', message)

  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    success: true,
    messageId: `msg_${Date.now()}`,
    status: 'sent',
    timestamp: new Date().toISOString(),
  }
}

export async function getWhatsAppStatus(messageId: string) {
  return {
    messageId,
    status: Math.random() > 0.5 ? 'delivered' : 'read',
    timestamp: new Date().toISOString(),
  }
}
