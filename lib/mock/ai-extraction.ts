export async function extractCertificateData(imageUrl: string) {
  console.log('🤖 [MOCK AI] Extracting from:', imageUrl)

  await new Promise((resolve) => setTimeout(resolve, 2000))

  const confidence = 85 + Math.random() * 13 // 85–98%

  return {
    extracted: {
      cert_type: 'BLS Certification',
      cert_number: `BLS-2026-${Math.floor(Math.random() * 9000) + 1000}`,
      holder_name: 'Staff Member',
      issuing_body: 'SRFAC',
      issue_date: '2026-04-08',
      expiry_date: '2028-04-08',
    },
    confidence,
    low_confidence_fields: confidence < 90 ? ['cert_number', 'issuing_body'] : [],
    processing_time_ms: 2000,
  }
}
