import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entity: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      entity: searchParams.get('entity') || undefined,
      action: searchParams.get('action') || undefined,
      userId: searchParams.get('userId') || undefined,
      search: searchParams.get('search') || undefined,
    });

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const errorMsg = Object.entries(errors)
        .map(([key, vals]) => `${key}: ${(vals as string[]).join(', ')}`)
        .join('; ');
      return errorResponse(
        'Invalid query parameters: ' + errorMsg,
        400
      );
    }

    const { page, limit, entity, action, userId, search } = parsed.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    // For search, we need to filter in memory since SQLite doesn't support
    // full-text search on JSON fields. We fetch all matching base criteria
    // and then filter by search term in details.
    if (search) {
      // Fetch more records and filter in memory
      const allLogs = await db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // Get unique user IDs
      const userIds = [...new Set(allLogs.map(l => l.userId))];
      const users = await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      });
      const userMap = new Map(users.map(u => [u.id, u]));

      // Filter by search term in details
      const filtered = allLogs.filter((log) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        // Search in details JSON string
        if (log.details && log.details.toLowerCase().includes(searchLower))
          return true;
        // Also search in user name/email
        const logUser = userMap.get(log.userId);
        if (
          logUser &&
          (logUser.name.toLowerCase().includes(searchLower) ||
            logUser.email.toLowerCase().includes(searchLower))
        )
          return true;
        // Search in action/entity strings
        if (log.action.toLowerCase().includes(searchLower)) return true;
        if (log.entity.toLowerCase().includes(searchLower)) return true;
        return false;
      });

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedLogs = filtered.slice(skip, skip + limit);

      return successResponse({
        logs: paginatedLogs.map((log) => {
          const logUser = userMap.get(log.userId);
          return {
            id: log.id,
            userId: log.userId,
            userName: logUser?.name || null,
            userEmail: logUser?.email || null,
            action: log.action,
            entity: log.entity,
            entityId: log.entityId,
            details: log.details,
            ipAddress: log.ipAddress,
            createdAt: log.createdAt,
          };
        }),
        total,
        page,
        totalPages,
      });
    }

    // No search — use efficient pagination
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    // Get unique user IDs
    const userIds = [...new Set(logs.map(l => l.userId))];
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      logs: logs.map((log) => {
        const logUser = userMap.get(log.userId);
        return {
          id: log.id,
          userId: log.userId,
          userName: logUser?.name || null,
          userEmail: logUser?.email || null,
          action: log.action,
          entity: log.entity,
          entityId: log.entityId,
          details: log.details,
          ipAddress: log.ipAddress,
          createdAt: log.createdAt,
        };
      }),
      total,
      page,
      totalPages,
    });
  } catch (err) {
    console.error('Admin audit-logs GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}
