import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const addWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

const removeWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return errorResponse('Unauthorized', 401);
    }

    const wishlist = await db.wishlistItem.findMany({
      where: { userId: payload.userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON fields
    const parsedWishlist = wishlist.map((item) => ({
      ...item,
      product: {
        ...item.product,
        images: JSON.parse(item.product.images),
        sizes: JSON.parse(item.product.sizes),
        colors: JSON.parse(item.product.colors),
      },
    }));

    return successResponse(parsedWishlist);
  } catch (err) {
    console.error('Wishlist GET error:', err);
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
    const result = addWishlistSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { productId } = result.data;

    // Verify product exists
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Check if already in wishlist
    const existing = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: payload.userId,
          productId,
        },
      },
    });

    if (existing) {
      return errorResponse('Product already in wishlist', 409);
    }

    const wishlistItem = await db.wishlistItem.create({
      data: {
        userId: payload.userId,
        productId,
      },
      include: {
        product: true,
      },
    });

    const parsedItem = {
      ...wishlistItem,
      product: {
        ...wishlistItem.product,
        images: JSON.parse(wishlistItem.product.images),
        sizes: JSON.parse(wishlistItem.product.sizes),
        colors: JSON.parse(wishlistItem.product.colors),
      },
    };

    return successResponse(parsedItem, 201);
  } catch (err) {
    console.error('Wishlist POST error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const result = removeWishlistSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { productId } = result.data;

    const wishlistItem = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: payload.userId,
          productId,
        },
      },
    });

    if (!wishlistItem) {
      return errorResponse('Wishlist item not found', 404);
    }

    await db.wishlistItem.delete({
      where: { id: wishlistItem.id },
    });

    return successResponse({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error('Wishlist DELETE error:', err);
    return errorResponse('Internal server error', 500);
  }
}
