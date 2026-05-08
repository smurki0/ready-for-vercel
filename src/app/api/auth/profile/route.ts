import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return errorResponse('غير مصرح', 401);
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return errorResponse('المستخدم غير موجود', 404);
    }

    if (user.banned) {
      return errorResponse('الحساب موقوف', 403);
    }

    const { password: _, ...userWithoutPassword } = user;
    return successResponse(userWithoutPassword);
  } catch (err) {
    console.error('Profile GET error:', err);
    return errorResponse('خطأ في الخادم', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return errorResponse('غير مصرح', 401);
    }

    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { name, phone, address } = result.data;

    const updatedUser = await db.user.update({
      where: { id: payload.userId },
      data: {
        name,
        phone: phone || null,
        address: address || null,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return successResponse(userWithoutPassword);
  } catch (err) {
    console.error('Profile PUT error:', err);
    return errorResponse('خطأ في الخادم', 500);
  }
}
