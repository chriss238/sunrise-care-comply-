import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const complianceItemId = formData.get('complianceItemId')

  if (!file || !complianceItemId) {
    return NextResponse.json({ error: 'Missing file or complianceItemId' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only PDF, JPG, and PNG files are allowed' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'File exceeds 5MB limit' },
      { status: 400 }
    )
  }

  const blob = await put(file.name, file, { access: 'public' })

  const attachment = await prisma.attachment.create({
    data: {
      filename: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
      mimeType: file.type,
      uploadedById: session.user.id,
      complianceItemId: parseInt(complianceItemId as string),
    },
  })

  return NextResponse.json(
    {
      id: attachment.id,
      filename: attachment.filename,
      fileUrl: attachment.fileUrl,
    },
    { status: 201 }
  )
}
