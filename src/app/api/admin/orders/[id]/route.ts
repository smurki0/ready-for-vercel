import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  deliveryNotes: z.string().optional(),
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
    const result = updateOrderStatusSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { status, deliveryNotes } = result.data;

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return errorResponse('Order not found', 404);
    }

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (deliveryNotes !== undefined) data.deliveryNotes = deliveryNotes;

    const updated = await db.order.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
              },
            },
          },
        },
      },
    });

    return successResponse(updated);
  } catch (err) {
    console.error('Admin order PUT error:', err);
    return errorResponse('Internal server error', 500);
  }
}
