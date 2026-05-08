import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return errorResponse('Unauthorized', 401);
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId: payload.userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON fields on products
    const parsedItems = cartItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        images: JSON.parse(item.product.images),
        sizes: JSON.parse(item.product.sizes),
        colors: JSON.parse(item.product.colors),
      },
    }));

    return successResponse(parsedItems);
  } catch (err) {
    console.error('Cart GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const result = addToCartSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { productId, quantity, size, color } = result.data;

    // Verify product exists and is active
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product || !product.active) {
      return errorResponse('Product not found', 404);
    }

    // Check stock
    if (product.stock < quantity) {
      return errorResponse('Insufficient stock', 400);
    }

    // Check if same item with same size and color exists
    const existingItem = await db.cartItem.findUnique({
      where: {
        userId_productId_size_color: {
          userId: payload.userId,
          productId,
          size: size || '',
          color: color || '',
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: true,
        },
      });

      const parsedUpdated = {
        ...updated,
        product: {
          ...updated.product,
          images: JSON.parse(updated.product.images),
          sizes: JSON.parse(updated.product.sizes),
          colors: JSON.parse(updated.product.colors),
        },
      };

      return successResponse(parsedUpdated);
    }

    // Create new cart item
    const cartItem = await db.cartItem.create({
      data: {
        userId: payload.userId,
        productId,
        quantity,
        size: size || null,
        color: color || null,
      },
      include: {
        product: true,
      },
    });

    const parsedItem = {
      ...cartItem,
      product: {
        ...cartItem.product,
        images: JSON.parse(cartItem.product.images),
        sizes: JSON.parse(cartItem.product.sizes),
        colors: JSON.parse(cartItem.product.colors),
      },
    };

    return successResponse(parsedItem, 201);
  } catch (err) {
    console.error('Cart POST error:', err);
    return errorResponse('Internal server error', 500);
  }
}
