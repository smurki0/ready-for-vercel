import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET /api/admin/reviews/[id] — Get single review
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(_req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const review = await db.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } },
        product: { select: { id: true, nameAr: true, nameEn: true, images: true } },
      },
    })

    if (!review) {
      return NextResponse.json({ success: false, error: 'التقييم غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: review })
  } catch {
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// PUT /api/admin/reviews/[id] — Update review (reply, approve, pin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { adminReply, approved, pinned } = body

    const existing = await db.review.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'التقييم غير موجود' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (adminReply !== undefined) data.adminReply = adminReply || null
    if (approved !== undefined) data.approved = approved
    if (pinned !== undefined) data.pinned = pinned

    const review = await db.review.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } },
        product: { select: { id: true, nameAr: true, nameEn: true, images: true } },
      },
    })

    return NextResponse.json({ success: true, data: review })
  } catch {
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// DELETE /api/admin/reviews/[id] — Delete a review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const existing = await db.review.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'التقييم غير موجود' }, { status: 404 })
    }

    await db.review.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'تم حذف التقييم' })
  } catch {
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
