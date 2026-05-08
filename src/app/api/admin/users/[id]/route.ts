import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
  banned: z.boolean().optional(),
  avatar: z.string().optional(),
});

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
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Prevent admin from banning themselves
    if (id === admin.userId && result.data.banned === true) {
      return errorResponse('Cannot ban yourself', 400);
    }

    // Prevent admin from removing their own admin role
    if (id === admin.userId && result.data.role === 'user') {
      return errorResponse('Cannot remove your own admin role', 400);
    }

    const data = result.data;

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.banned !== undefined && { banned: data.banned }),
        ...(data.avatar !== undefined && { avatar: data.avatar || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        banned: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(updated);
  } catch (err) {
    console.error('Admin user PUT error:', err);
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

    // Prevent admin from deleting themselves
    if (id === admin.userId) {
      return errorResponse('Cannot delete yourself', 400);
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    await db.user.delete({ where: { id } });

    return successResponse({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Admin user DELETE error:', err);
    return errorResponse('Internal server error', 500);
  }
}
