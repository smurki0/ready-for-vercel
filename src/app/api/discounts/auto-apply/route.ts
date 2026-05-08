import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartTotalParam = searchParams.get('cartTotal');
    const cartTotal = cartTotalParam ? parseFloat(cartTotalParam) : 0;

    if (isNaN(cartTotal) || cartTotal < 0) {
      return errorResponse('Invalid cartTotal parameter', 400);
    }

    const now = new Date();

    // Find all active auto-apply discounts within date range and minOrderValue <= cartTotal
    const discounts = await db.discountCode.findMany({
      where: {
        active: true,
        autoApply: true,
        minOrderValue: { lte: cartTotal },
      },
      orderBy: { value: 'desc' },
    });

    // Filter in-memory for date range and usage limits (since SQLite date comparison can be tricky)
    const applicableDiscounts = discounts.filter((discount) => {
      // Check date range
      if (discount.startDate && now < discount.startDate) {
        return false;
      }
      if (discount.endDate && now > discount.endDate) {
        return false;
      }

      // Check usage limit
      if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
        return false;
      }

      return true;
    });

    // Calculate discountAmount for each applicable discount
    const result = applicableDiscounts.map((discount) => {
      let discountAmount = 0;
      if (discount.type === 'percentage') {
        discountAmount = (cartTotal * discount.value) / 100;
        if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
          discountAmount = discount.maxDiscount;
        }
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
        if (discountAmount > cartTotal) {
          discountAmount = cartTotal;
        }
      }
      // free_shipping: discountAmount = 0

      return {
        id: discount.id,
        code: discount.code,
        descriptionAr: discount.descriptionAr,
        descriptionEn: discount.descriptionEn,
        type: discount.type,
        value: discount.value,
        maxDiscount: discount.maxDiscount,
        minOrderValue: discount.minOrderValue,
        discountAmount,
      };
    });

    return successResponse(result);
  } catch (err) {
    console.error('Discount auto-apply error:', err);
    return errorResponse('Internal server error', 500);
  }
}
