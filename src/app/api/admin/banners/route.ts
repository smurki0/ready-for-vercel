import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { createAuditLog } from '@/lib/audit';

const createBannerSchema = z.object({
  titleAr: z.string().optional(),
  titleEn: z.string().optional(),
  subtitleAr: z.string().optional(),
  subtitleEn: z.string().optional(),
  image: z.string().min(1, 'Image is required'),
  linkType: z.enum(['product', 'category', 'url', 'none']).optional(),
  linkId: z.string().optional(),
  position: z.enum(['hero', 'middle', 'sidebar', 'footer']).default('hero'),
  order: z.number().int().default(0),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    const where = position ? { position } : {};

    const banners = await db.banner.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return successResponse(banners);
  } catch (err) {
    console.error('Admin banners GET error:', err);
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
    const result = createBannerSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const data = result.data;

    const banner = await db.banner.create({
      data: {
        titleAr: data.titleAr || null,
        titleEn: data.titleEn || null,
        subtitleAr: data.subtitleAr || null,
        subtitleEn: data.subtitleEn || null,
        image: data.image,
        linkType: data.linkType || null,
        linkId: data.linkId || null,
        position: data.position,
        order: data.order,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        active: data.active,
      },
    });

    await createAuditLog({
      userId: admin.userId,
      action: 'create',
      entity: 'banner',
      entityId: banner.id,
      details: {
        titleAr: banner.titleAr,
        titleEn: banner.titleEn,
        position: banner.position,
        active: banner.active,
      },
    });

    return successResponse(banner, 201);
  } catch (err) {
    console.error('Admin banner POST error:', err);
    return errorResponse('Internal server error', 500);
  }
}
