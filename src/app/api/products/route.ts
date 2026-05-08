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

// Helper: batch-fetch review stats for a list of product IDs
async function getReviewStats(productIds: string[]): Promise<Record<string, { avgRating: number; reviewCount: number }>> {
  if (productIds.length === 0) return {};

  const reviewStats = await db.review.groupBy({
    by: ['productId'],
    where: { productId: { in: productIds } },
    _count: { rating: true },
    _avg: { rating: true },
  });

  const statsMap: Record<string, { avgRating: number; reviewCount: number }> = {};
  for (const stat of reviewStats) {
    statsMap[stat.productId] = {
      avgRating: Math.round((stat._avg.rating ?? 0) * 10) / 10,
      reviewCount: stat._count.rating,
    };
  }
  return statsMap;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'createdAt';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sizesParam = searchParams.get('sizes');
    const colorsParam = searchParams.get('colors');

    const selectedSizes = sizesParam ? sizesParam.split(',').filter(Boolean) : [];
    const selectedColors = colorsParam ? colorsParam.split(',').filter(Boolean) : [];

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { active: true };

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { nameAr: { contains: search } },
        { nameEn: { contains: search } },
        { descriptionAr: { contains: search } },
        { descriptionEn: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // Build order by
    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'name_asc') orderBy = { nameEn: 'asc' };
    else if (sort === 'name_desc') orderBy = { nameEn: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    // If sizes or colors filter is active, we need in-memory filtering for accurate results
    // since SQLite doesn't support JSON array containment queries natively.
    if (selectedSizes.length > 0 || selectedColors.length > 0) {
      // Fetch all matching products (without size/color filter) then filter in memory
      const allProducts = await db.product.findMany({
        where,
        orderBy,
        include: {
          category: true,
        },
      });

      // Parse JSON fields and filter by sizes/colors
      let parsedProducts = allProducts.map((product) => ({
        ...product,
        images: safeJsonParse(product.images),
        sizes: safeJsonParse(product.sizes),
        colors: safeJsonParse(product.colors),
        tags: safeJsonParse(product.tags),
      }));

      // Filter by sizes: product must have at least one of the selected sizes
      if (selectedSizes.length > 0) {
        parsedProducts = parsedProducts.filter((p) => {
          const productSizes = Array.isArray(p.sizes) ? p.sizes : [];
          return selectedSizes.some((s) => productSizes.includes(s));
        });
      }

      // Filter by colors: product must have at least one of the selected colors
      if (selectedColors.length > 0) {
        parsedProducts = parsedProducts.filter((p) => {
          const productColors = Array.isArray(p.colors) ? p.colors : [];
          return selectedColors.some((c) => productColors.includes(c));
        });
      }

      const total = parsedProducts.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedProducts = parsedProducts.slice(skip, skip + limit);

      // Fetch review stats for paginated products
      const productIds = paginatedProducts.map((p) => p.id);
      const reviewStatsMap = await getReviewStats(productIds);

      // Merge review stats into products
      const productsWithStats = paginatedProducts.map((p) => ({
        ...p,
        avgRating: reviewStatsMap[p.id]?.avgRating ?? 0,
        reviewCount: reviewStatsMap[p.id]?.reviewCount ?? 0,
      }));

      return successResponse({
        products: productsWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
        },
      }),
      db.product.count({ where }),
    ]);

    // Parse JSON fields
    const parsedProducts = products.map((product) => ({
      ...product,
      images: safeJsonParse(product.images),
      sizes: safeJsonParse(product.sizes),
      colors: safeJsonParse(product.colors),
      tags: safeJsonParse(product.tags),
    }));

    // Fetch review stats for all products
    const productIds = parsedProducts.map((p) => p.id);
    const reviewStatsMap = await getReviewStats(productIds);

    // Merge review stats into products
    const productsWithStats = parsedProducts.map((p) => ({
      ...p,
      avgRating: reviewStatsMap[p.id]?.avgRating ?? 0,
      reviewCount: reviewStatsMap[p.id]?.reviewCount ?? 0,
    }));

    return successResponse({
      products: productsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Products list error:', err);
    return errorResponse('Internal server error', 500);
  }
}
