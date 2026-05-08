import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const zones = await db.shippingZone.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        region: true,
        price: true,
        freeAbove: true,
        estimatedDays: true,
      },
    });

    return successResponse(zones);
  } catch (err) {
    console.error('Shipping zones GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}
