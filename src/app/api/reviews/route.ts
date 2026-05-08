import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET /api/reviews?productId=xxx  (optional — returns all reviews if omitted)
// GET /api/reviews?limit=6        (optional — default 20)
export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get('productId')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10)

    const where: Record<string, unknown> = {
      approved: true, // Only show approved reviews to public
    }
    if (productId) {
      where.productId = productId
    }

    const reviews = await db.review.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        product: {
          select: { id: true, nameAr: true, nameEn: true, images: true },
        },
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    })

    // Parse product images JSON for each review
    const parsedReviews = reviews.map((r) => ({
      ...r,
      product: r.product
        ? { ...r.product, images: JSON.parse(r.product.images) }
        : null,
    }))

    const totalReviews = reviews.length
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0
    const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
    }))

    // Calculate recommendation percentage (reviews with rating >= 4)
    const recommendCount = reviews.filter(r => r.rating >= 4).length
    const recommendPercent = totalReviews > 0
      ? Math.round((recommendCount / totalReviews) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        reviews: parsedReviews,
        stats: {
          totalReviews,
          avgRating: Math.round(avgRating * 10) / 10,
          ratingDistribution,
          recommendPercent,
        },
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'يرجى تسجيل الدخول' }, { status: 401 })
    }

    const body = await req.json()
    const { productId, rating, comment } = body

    if (!productId || !rating) {
      return NextResponse.json({ success: false, error: 'المنتج والتقييم مطلوبان' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'التقييم يجب أن يكون بين 1 و 5' }, { status: 400 })
    }

    const existing = await db.review.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'لقد قمت بتقييم هذا المنتج مسبقاً' }, { status: 400 })
    }

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ success: false, error: 'المنتج غير موجود' }, { status: 404 })
    }

    const review = await db.review.create({
      data: {
        userId: user.id,
        productId,
        rating,
        comment: comment || null,
        approved: true, // Auto-approve; admin can unapprove later
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: review })
  } catch {
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
