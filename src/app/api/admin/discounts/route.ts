import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { createAuditLog } from '@/lib/audit';

const createDiscountSchema = z.object({
  code: z.string().min(1, 'Discount code is required').transform((v) => v.toUpperCase().trim()),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping'], {
    errorMap: () => ({ message: 'Type must be percentage, fixed, or free_shipping' }),
  }),
  value: z.number().min(0, 'Value must be positive'),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  perUserLimit: z.number().int().min(1).default(1),
  autoApply: z.boolean().default(false),
  startDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  endDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (active === 'true') {
      where.active = true;
    } else if (active === 'false') {
      where.active = false;
    }

    if (search) {
      where.code = { contains: search.toUpperCase() };
    }

    const [discounts, total] = await Promise.all([
      db.discountCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { usages: true },
          },
        },
      }),
      db.discountCode.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Map to include usageCount from _count
    const mappedDiscounts = discounts.map((d) => {
      const { _count, ...rest } = d;
      return {
        ...rest,
        usageCount: _count.usages,
      };
    });

    return successResponse({
      discounts: mappedDiscounts,
      total,
      page,
      totalPages,
    });
  } catch (err) {
    console.error('Admin discounts GET error:', err);
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
    const result = createDiscountSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const data = result.data;

    // Check code uniqueness
    const existing = await db.discountCode.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      return errorResponse('Discount code already exists', 409);
    }

    // Validate: percentage type value should not exceed 100
    if (data.type === 'percentage' && data.value > 100) {
      return errorResponse('Percentage value cannot exceed 100', 400);
    }

    // Validate: endDate must be after startDate
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      return errorResponse('End date must be after start date', 400);
    }

    const discount = await db.discountCode.create({
      data: {
        code: data.code,
        descriptionAr: data.descriptionAr || null,
        descriptionEn: data.descriptionEn || null,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue,
        maxDiscount: data.maxDiscount || null,
        usageLimit: data.usageLimit || null,
        perUserLimit: data.perUserLimit,
        autoApply: data.autoApply,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        active: data.active,
      },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    // Audit log
    await createAuditLog({
      userId: admin.userId,
      action: 'create',
      entity: 'discount',
      entityId: discount.id,
      details: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
      },
    });

    const { _count, ...rest } = discount;
    return successResponse(
      { ...rest, usageCount: _count.usages },
      201
    );
  } catch (err) {
    console.error('Admin discount POST error:', err);
    return errorResponse('Internal server error', 500);
  }
}
