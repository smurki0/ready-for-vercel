import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: { where: { active: true } } },
        },
      },
    });

    return successResponse(categories);
  } catch (err) {
    console.error('Categories list error:', err);
    return errorResponse('Internal server error', 500);
  }
}
