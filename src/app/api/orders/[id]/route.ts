import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Users can only see their own orders (admins can see all via admin routes)
    if (order.userId !== payload.userId && payload.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    // Parse JSON fields
    const parsedOrder = {
      ...order,
      orderItems: order.orderItems.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: JSON.parse(item.product.images),
              sizes: JSON.parse(item.product.sizes),
              colors: JSON.parse(item.product.colors),
            }
          : null,
      })),
    };

    return successResponse(parsedOrder);
  } catch (err) {
    console.error('Order GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}
