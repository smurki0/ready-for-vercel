import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const updateCartSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateCartSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { quantity } = result.data;

    // Verify cart item belongs to user
    const cartItem = await db.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem || cartItem.userId !== payload.userId) {
      return errorResponse('Cart item not found', 404);
    }

    const updated = await db.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: true,
      },
    });

    const parsedItem = {
      ...updated,
      product: {
        ...updated.product,
        images: JSON.parse(updated.product.images),
        sizes: JSON.parse(updated.product.sizes),
        colors: JSON.parse(updated.product.colors),
      },
    };

    return successResponse(parsedItem);
  } catch (err) {
    console.error('Cart PUT error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    // Verify cart item belongs to user
    const cartItem = await db.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem || cartItem.userId !== payload.userId) {
      return errorResponse('Cart item not found', 404);
    }

    await db.cartItem.delete({
      where: { id },
    });

    return successResponse({ message: 'Cart item removed' });
  } catch (err) {
    console.error('Cart DELETE error:', err);
    return errorResponse('Internal server error', 500);
  }
}
