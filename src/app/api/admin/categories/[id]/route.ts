import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const updateCategorySchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateCategorySchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const data = result.data;

    const category = await db.category.findUnique({ where: { id } });
    if (!category) {
      return errorResponse('Category not found', 404);
    }

    // Check slug uniqueness if being updated
    if (data.slug && data.slug !== category.slug) {
      const existing = await db.category.findUnique({
        where: { slug: data.slug },
      });
      if (existing) {
        return errorResponse('Slug already exists', 409);
      }
    }

    const updated = await db.category.update({
      where: { id },
      data: {
        ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.image !== undefined && { image: data.image || null }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return successResponse(updated);
  } catch (err) {
    console.error('Admin category PUT error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    if (category._count.products > 0) {
      return errorResponse(
        'Cannot delete category with products. Move or delete products first.',
        400
      );
    }

    await db.category.delete({ where: { id } });

    return successResponse({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Admin category DELETE error:', err);
    return errorResponse('Internal server error', 500);
  }
}
