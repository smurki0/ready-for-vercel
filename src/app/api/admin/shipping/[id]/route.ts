import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { createAuditLog } from '@/lib/audit';

const updateShippingZoneSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  freeAbove: z.number().optional().nullable(),
  estimatedDays: z.string().optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
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

    const zone = await db.shippingZone.findUnique({ where: { id } });
    if (!zone) {
      return errorResponse('Shipping zone not found', 404);
    }

    return successResponse(zone);
  } catch (err) {
    console.error('Admin shipping zone GET error:', err);
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
    const result = updateShippingZoneSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const data = result.data;

    const zone = await db.shippingZone.findUnique({ where: { id } });
    if (!zone) {
      return errorResponse('Shipping zone not found', 404);
    }

    // Check region uniqueness if being updated
    if (data.region && data.region !== zone.region) {
      const existing = await db.shippingZone.findUnique({
        where: { region: data.region },
      });
      if (existing) {
        return errorResponse('Region already exists', 409);
      }
    }

    const updated = await db.shippingZone.update({
      where: { id },
      data: {
        ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
        ...(data.region !== undefined && { region: data.region }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.freeAbove !== undefined && { freeAbove: data.freeAbove }),
        ...(data.estimatedDays !== undefined && { estimatedDays: data.estimatedDays }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    await createAuditLog({
      userId: admin.userId,
      action: 'update',
      entity: 'shipping',
      entityId: id,
      details: data,
    });

    return successResponse(updated);
  } catch (err) {
    console.error('Admin shipping zone PUT error:', err);
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

    const zone = await db.shippingZone.findUnique({ where: { id } });
    if (!zone) {
      return errorResponse('Shipping zone not found', 404);
    }

    await db.shippingZone.delete({ where: { id } });

    await createAuditLog({
      userId: admin.userId,
      action: 'delete',
      entity: 'shipping',
      entityId: id,
      details: { nameAr: zone.nameAr, nameEn: zone.nameEn, region: zone.region },
    });

    return successResponse({ message: 'Shipping zone deleted successfully' });
  } catch (err) {
    console.error('Admin shipping zone DELETE error:', err);
    return errorResponse('Internal server error', 500);
  }
}
