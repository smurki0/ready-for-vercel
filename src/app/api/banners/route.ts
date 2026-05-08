import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position') || 'hero';

    const now = new Date();

    const banners = await db.banner.findMany({
      where: {
        position,
        active: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: null },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        subtitleAr: true,
        subtitleEn: true,
        image: true,
        linkType: true,
        linkId: true,
        position: true,
      },
    });

    return successResponse(banners);
  } catch (err) {
    console.error('Public banners GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}
