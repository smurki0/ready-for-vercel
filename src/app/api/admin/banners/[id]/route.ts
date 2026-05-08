import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { createAuditLog } from '@/lib/audit';

const updateBannerSchema = z.object({
  titleAr: z.string().optional(),
  titleEn: z.string().optional(),
  subtitleAr: z.string().optional(),
  subtitleEn: z.string().optional(),
  image: z.string().optional(),
  linkType: z.enum(['product', 'category', 'url', 'none']).optional(),
  linkId: z.string().optional(),
  position: z.enum(['hero', 'middle', 'sidebar', 'footer']).optional(),
  order: z.number().int().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    const banner = await db.banner.findUnique({ where: { id } });

    if (!banner) {
      return errorResponse('Banner not found', 404);
    }

    return successResponse(banner);
  } catch (err) {
    console.error('Admin banner GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}

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
    const result = updateBannerSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const data = result.data;

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Banner not found', 404);
    }

    const updateData: Record<string, unknown> = {};
    if (data.titleAr !== undefined) updateData.titleAr = data.titleAr || null;
    if (data.titleEn !== undefined) updateData.titleEn = data.titleEn || null;
    if (data.subtitleAr !== undefined) updateData.subtitleAr = data.subtitleAr || null;
    if (data.subtitleEn !== undefined) updateData.subtitleEn = data.subtitleEn || null;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.linkType !== undefined) updateData.linkType = data.linkType;
    if (data.linkId !== undefined) updateData.linkId = data.linkId || null;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.active !== undefined) updateData.active = data.active;

    const banner = await db.banner.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      userId: admin.userId,
      action: 'update',
      entity: 'banner',
      entityId: banner.id,
      details: {
        updatedFields: Object.keys(updateData),
        titleAr: banner.titleAr,
        titleEn: banner.titleEn,
        position: banner.position,
        active: banner.active,
      },
    });

    return successResponse(banner);
  } catch (err) {
    console.error('Admin banner PUT error:', err);
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

    const banner = await db.banner.findUnique({ where: { id } });
    if (!banner) {
      return errorResponse('Banner not found', 404);
    }

    await db.banner.delete({ where: { id } });

    await createAuditLog({
      userId: admin.userId,
      action: 'delete',
      entity: 'banner',
      entityId: id,
      details: {
        titleAr: banner.titleAr,
        titleEn: banner.titleEn,
        position: banner.position,
      },
    });

    return successResponse({ message: 'Banner deleted successfully' });
  } catch (err) {
    console.error('Admin banner DELETE error:', err);
    return errorResponse('Internal server error', 500);
  }
}
