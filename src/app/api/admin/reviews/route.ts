import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET /api/admin/reviews — List all reviews with stats
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }

    const ratingFilter = req.nextUrl.searchParams.get('rating')
    const approvedFilter = req.nextUrl.searchParams.get('approved')
    const search = req.nextUrl.searchParams.get('search')
    const productId = req.nextUrl.searchParams.get('productId')

    const where: Record<string, unknown> = {}
    if (ratingFilter) where.rating = parseInt(ratingFilter)
    if (approvedFilter === 'true') where.approved = true
    else if (approvedFilter === 'false') where.approved = false
    if (productId) where.productId = productId

    const reviews = await db.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } },
        product: { select: { id: true, nameAr: true, nameEn: true, images: true } },
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Parse product images and apply search filter
    const parsedReviews = reviews
      .map((r) => ({
        ...r,
        product: r.product
          ? { ...r.product, images: (() => { try { return JSON.parse(r.product.images) } catch { return r.product.images } })() }
          : null,
      }))
      .filter((r) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          r.user?.name?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q) ||
          r.product?.nameAr?.toLowerCase().includes(q) ||
          r.product?.nameEn?.toLowerCase().includes(q)
        )
      })

    // Stats
    const totalReviews = parsedReviews.length
    const approvedCount = parsedReviews.filter((r) => r.approved).length
    const pendingCount = parsedReviews.filter((r) => !r.approved).length
    const pinnedCount = parsedReviews.filter((r) => r.pinned).length
    const repliedCount = parsedReviews.filter((r) => r.adminReply).length
    const avgRating = totalReviews > 0
      ? Math.round((parsedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0

    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: parsedReviews.filter((r) => r.rating === star).length,
    }))

    return NextResponse.json({
      success: true,
      data: {
        reviews: parsedReviews,
        stats: {
          totalReviews,
          approvedCount,
          pendingCount,
          pinnedCount,
          repliedCount,
          avgRating,
          ratingDistribution,
        },
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}
