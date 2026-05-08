import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (user.banned) {
      return errorResponse('Account has been suspended', 403);
    }

    const { password: _, ...userWithoutPassword } = user;
    return successResponse(userWithoutPassword);
  } catch (err) {
    console.error('Me error:', err);
    return errorResponse('Internal server error', 500);
  }
}
