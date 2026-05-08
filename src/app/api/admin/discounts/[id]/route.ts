import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { createAuditLog } from '@/lib/audit';

const updateDiscountSchema = z.object({
  code: z.string().min(1).transform((v) => v.toUpperCase().trim()).optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']).optional(),
  value: z.number().min(0).optional(),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  perUserLimit: z.number().int().min(1).optional(),
  autoApply: z.boolean().optional(),
  startDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)).nullable(),
  endDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)).nullable(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    const discount = await db.discountCode.findUnique({
      where: { id },
      include: {
        usages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!discount) {
      return errorResponse('Discount not found', 404);
    }

    return successResponse(discount);
  } catch (err) {
    console.error('Admin discount GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}

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
    const result = updateDiscountSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const data = result.data;

    // Check discount exists
    const existing = await db.discountCode.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Discount not found', 404);
    }

    // If code is being updated, check uniqueness
    if (data.code && data.code !== existing.code) {
      const codeExists = await db.discountCode.findUnique({
        where: { code: data.code },
      });
      if (codeExists) {
        return errorResponse('Discount code already exists', 409);
      }
    }

    // Validate: percentage type value should not exceed 100
    const effectiveType = data.type || existing.type;
    const effectiveValue = data.value !== undefined ? data.value : existing.value;
    if (effectiveType === 'percentage' && effectiveValue > 100) {
      return errorResponse('Percentage value cannot exceed 100', 400);
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.descriptionAr !== undefined) updateData.descriptionAr = data.descriptionAr || null;
    if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn || null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.minOrderValue !== undefined) updateData.minOrderValue = data.minOrderValue;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit;
    if (data.perUserLimit !== undefined) updateData.perUserLimit = data.perUserLimit;
    if (data.autoApply !== undefined) updateData.autoApply = data.autoApply;
    if (data.startDate !== undefined) updateData.startDate = data.startDate || null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate || null;
    if (data.active !== undefined) updateData.active = data.active;

    // Validate date range if both are being set
    const effectiveStartDate = updateData.startDate !== undefined ? updateData.startDate : existing.startDate;
    const effectiveEndDate = updateData.endDate !== undefined ? updateData.endDate : existing.endDate;
    if (effectiveStartDate && effectiveEndDate && effectiveEndDate <= effectiveStartDate) {
      return errorResponse('End date must be after start date', 400);
    }

    const discount = await db.discountCode.update({
      where: { id },
      data: updateData,
      include: {
        usages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Audit log
    await createAuditLog({
      userId: admin.userId,
      action: 'update',
      entity: 'discount',
      entityId: id,
      details: {
        updatedFields: Object.keys(updateData),
        code: discount.code,
      },
    });

    return successResponse(discount);
  } catch (err) {
    console.error('Admin discount PUT error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    const discount = await db.discountCode.findUnique({ where: { id } });
    if (!discount) {
      return errorResponse('Discount not found', 404);
    }

    // Audit log before deletion (need the code for reference)
    await createAuditLog({
      userId: admin.userId,
      action: 'delete',
      entity: 'discount',
      entityId: id,
      details: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
      },
    });

    await db.discountCode.delete({ where: { id } });

    return successResponse({ message: 'Discount deleted successfully' });
  } catch (err) {
    console.error('Admin discount DELETE error:', err);
    return errorResponse('Internal server error', 500);
  }
}
