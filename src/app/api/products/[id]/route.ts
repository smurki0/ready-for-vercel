import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

function safeJsonParse(value: unknown, fallback: unknown = []) {
  if (value === undefined || value === null || value === 'undefined') return fallback;
  try {
    return JSON.parse(value as string);
  } catch {
    return fallback;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Fetch review stats for this product
    const reviewStats = await db.review.groupBy({
      by: ['productId'],
      where: { productId: id },
      _count: { rating: true },
      _avg: { rating: true },
    });

    const avgRating = reviewStats.length > 0
      ? Math.round((reviewStats[0]._avg.rating ?? 0) * 10) / 10
      : 0;
    const reviewCount = reviewStats.length > 0
      ? reviewStats[0]._count.rating
      : 0;

    // Parse JSON fields
    const parsedProduct = {
      ...product,
      images: safeJsonParse(product.images),
      sizes: safeJsonParse(product.sizes),
      colors: safeJsonParse(product.colors),
      tags: safeJsonParse(product.tags),
      avgRating,
      reviewCount,
    };

    return successResponse(parsedProduct);
  } catch (err) {
    console.error('Product get error:', err);
    return errorResponse('Internal server error', 500);
  }
}
