import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { createAuditLog } from '@/lib/audit';

const createShippingZoneSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  region: z.string().min(1, 'Region is required'),
  price: z.number().min(0, 'Price must be 0 or more'),
  freeAbove: z.number().optional().nullable(),
  estimatedDays: z.string().default('3-5'),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const zones = await db.shippingZone.findMany({
      orderBy: { order: 'asc' },
    });

    return successResponse(zones);
  } catch (err) {
    console.error('Admin shipping zones GET error:', err);
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
    const result = createShippingZoneSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const data = result.data;

    // Check region uniqueness
    const existing = await db.shippingZone.findUnique({
      where: { region: data.region },
    });
    if (existing) {
      return errorResponse('Region already exists', 409);
    }

    const zone = await db.shippingZone.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        region: data.region,
        price: data.price,
        freeAbove: data.freeAbove ?? null,
        estimatedDays: data.estimatedDays,
        active: data.active,
        order: data.order,
      },
    });

    await createAuditLog({
      userId: admin.userId,
      action: 'create',
      entity: 'shipping',
      entityId: zone.id,
      details: { nameAr: data.nameAr, nameEn: data.nameEn, region: data.region, price: data.price },
    });

    return successResponse(zone, 201);
  } catch (err) {
    console.error('Admin shipping zone POST error:', err);
    return errorResponse('Internal server error', 500);
  }
}
