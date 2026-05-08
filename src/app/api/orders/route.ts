import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(5, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cod', 'credit_card', 'apple_pay', 'vodafone_cash', 'instapay']).default('cod'),
});

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return errorResponse('Unauthorized', 401);
    }

    const orders = await db.order.findMany({
      where: { userId: payload.userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON fields on products within order items
    const parsedOrders = orders.map((order) => ({
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
    }));

    return successResponse(parsedOrders);
  } catch (err) {
    console.error('Orders GET error:', err);
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
    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { customerName, customerPhone, address, notes, paymentMethod } = result.data;

    // Get user's cart items
    const cartItems = await db.cartItem.findMany({
      where: { userId: payload.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return errorResponse('Cart is empty', 400);
    }

    // Calculate total and validate stock
    let total = 0;
    const orderItemsData: Array<{ productId: string; quantity: number; price: number; size: string | null; color: string | null }> = [];

    for (const item of cartItems) {
      if (!item.product.active) {
        return errorResponse(`Product "${item.product.nameEn}" is no longer available`, 400);
      }
      if (item.product.stock < item.quantity) {
        return errorResponse(`Insufficient stock for "${item.product.nameEn}"`, 400);
      }

      const price = item.product.discount > 0
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;

      total += price * item.quantity;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
        size: item.size,
        color: item.color,
      });
    }

    // Create order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: payload.userId,
          total,
          customerName,
          customerPhone,
          address,
          notes: notes || null,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Decrease stock for each product
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId: payload.userId },
      });

      return newOrder;
    });

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

    return successResponse(parsedOrder, 201);
  } catch (err) {
    console.error('Order POST error:', err);
    return errorResponse('Internal server error', 500);
  }
}
