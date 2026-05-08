import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

const validateSchema = z.object({
  code: z.string().min(1, 'Discount code is required'),
  cartTotal: z.number().min(0, 'Cart total must be positive'),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = validateSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { code, cartTotal, userId } = result.data;
    const now = new Date();

    // Find discount by code (case-insensitive)
    const discount = await db.discountCode.findFirst({
      where: {
        code: { equals: code.toUpperCase() },
      },
    });

    if (!discount) {
      return successResponse({
        valid: false,
        error: 'كود الخصم غير صالح',
      });
    }

    // Check: active
    if (!discount.active) {
      return successResponse({
        valid: false,
        error: 'كود الخصم غير نشط',
      });
    }

    // Check: not expired (startDate / endDate)
    if (discount.startDate && now < discount.startDate) {
      return successResponse({
        valid: false,
        error: 'لم يبدأ كود الخصم بعد',
      });
    }

    if (discount.endDate && now > discount.endDate) {
      return successResponse({
        valid: false,
        error: 'انتهت صلاحية كود الخصم',
      });
    }

    // Check: usageLimit not exceeded
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return successResponse({
        valid: false,
        error: 'تم استخدام كود الخصم للحد الأقصى',
      });
    }

    // Check: cartTotal >= minOrderValue
    if (cartTotal < discount.minOrderValue) {
      return successResponse({
        valid: false,
        error: `الحد الأدنى للطلب ${discount.minOrderValue} ج.م`,
      });
    }

    // Check: perUserLimit
    if (userId) {
      const userUsageCount = await db.discountUsage.count({
        where: {
          discountId: discount.id,
          userId,
        },
      });

      if (userUsageCount >= discount.perUserLimit) {
        return successResponse({
          valid: false,
          error: 'لقد استخدمتِ هذا الكود بالفعل',
        });
      }
    }

    // Calculate discountAmount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (cartTotal * discount.value) / 100;
      // Cap at maxDiscount
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
      }
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
      // Fixed discount cannot exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }
    // free_shipping: discountAmount = 0 (handled separately at checkout)

    return successResponse({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        maxDiscount: discount.maxDiscount,
        descriptionAr: discount.descriptionAr,
      },
      discountAmount,
    });
  } catch (err) {
    console.error('Discount validate error:', err);
    return errorResponse('Internal server error', 500);
  }
}
