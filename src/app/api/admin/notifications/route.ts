import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const markReadSchema = z.object({
  ids: z.array(z.string()).optional(),
  markAll: z.boolean().optional(),
});

const deleteSchema = z.object({
  id: z.string().optional(),
  clearAll: z.boolean().optional(),
});

// Helper to fetch all notifications ordered by createdAt DESC
async function getAllNotifications() {
  return db.notification.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

// GET: List all notifications ordered by createdAt DESC
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const notifications = await getAllNotifications();
    return successResponse({ notifications });
  } catch (err) {
    console.error('Admin notifications GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}

// PUT: Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const parsed = markReadSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Invalid request body: ' + parsed.error.flatten().fieldErrors,
        400
      );
    }

    const { ids, markAll } = parsed.data;

    if (markAll) {
      await db.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
    } else if (ids && ids.length > 0) {
      await db.notification.updateMany({
        where: { id: { in: ids } },
        data: { read: true },
      });
    } else {
      return errorResponse(
        'Provide either ids array or markAll: true',
        400
      );
    }

    const notifications = await getAllNotifications();
    return successResponse({ notifications });
  } catch (err) {
    console.error('Admin notifications PUT error:', err);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE: Delete notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Invalid request body: ' + parsed.error.flatten().fieldErrors,
        400
      );
    }

    const { id, clearAll } = parsed.data;

    if (clearAll) {
      await db.notification.deleteMany();
    } else if (id) {
      await db.notification.delete({ where: { id } });
    } else {
      return errorResponse(
        'Provide either id or clearAll: true',
        400
      );
    }

    const notifications = await getAllNotifications();
    return successResponse({ notifications });
  } catch (err) {
    console.error('Admin notifications DELETE error:', err);
    return errorResponse('Internal server error', 500);
  }
}
