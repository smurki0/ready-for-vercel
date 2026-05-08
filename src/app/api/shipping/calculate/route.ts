import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

const calculateShippingSchema = z.object({
  region: z.string().min(1, 'Region is required'),
  cartTotal: z.number().min(0, 'Cart total must be 0 or more'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = calculateShippingSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { region, cartTotal } = result.data;

    // Find the shipping zone by region
    const zone = await db.shippingZone.findUnique({
      where: { region },
    });

    if (!zone) {
      // Return default shipping (50 EGP)
      return successResponse({
        shippingCost: 50,
        freeAbove: null,
        estimatedDays: '3-5',
        isFree: false,
        zoneNameAr: 'منطقة افتراضية',
        zoneNameEn: 'Default Zone',
      });
    }

    // Check if cartTotal qualifies for free shipping
    const isFree = zone.freeAbove !== null && cartTotal >= zone.freeAbove;
    const shippingCost = isFree ? 0 : zone.price;

    return successResponse({
      shippingCost,
      freeAbove: zone.freeAbove,
      estimatedDays: zone.estimatedDays,
      isFree,
      zoneNameAr: zone.nameAr,
      zoneNameEn: zone.nameEn,
    });
  } catch (err) {
    console.error('Shipping calculate POST error:', err);
    return errorResponse('Internal server error', 500);
  }
}
