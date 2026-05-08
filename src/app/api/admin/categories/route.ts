import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const createCategorySchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  slug: z.string().min(1, 'Slug is required'),
  image: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return successResponse(categories);
  } catch (err) {
    console.error('Admin categories GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const result = createCategorySchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const data = result.data;

    // Check slug uniqueness
    const existing = await db.category.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return errorResponse('Slug already exists', 409);
    }

    const category = await db.category.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        slug: data.slug,
        image: data.image || null,
        description: data.description || null,
        order: data.order,
      },
    });

    return successResponse(category, 201);
  } catch (err) {
    console.error('Admin category POST error:', err);
    return errorResponse('Internal server error', 500);
  }
}
