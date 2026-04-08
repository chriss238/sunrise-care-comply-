import { NextResponse } from 'next/server'
import { extractCertificateData } from '@/lib/mock/ai-extraction'

export async function POST(req: Request) {
  const body = await req.json()
  const result = await extractCertificateData(body.fileUrl ?? '')
  return NextResponse.json(result)
}
