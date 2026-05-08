import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    // Get total counts
    const [totalOrders, totalUsers, totalProducts] = await Promise.all([
      db.order.count(),
      db.user.count(),
      db.product.count({ where: { active: true } }),
    ]);

    // Get total revenue (from delivered/completed orders)
    const revenueResult = await db.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: { in: ['delivered', 'shipped'] },
      },
    });

    const totalRevenue = revenueResult._sum.total || 0;

    // Get recent orders (last 10)
    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
              },
            },
          },
        },
      },
    });

    // Get monthly revenue for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { in: ['delivered', 'shipped'] },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear()
        );
      });

      const revenue = monthOrders.reduce((sum, o) => sum + o.total, 0);
      monthlyRevenue.push({ month: monthStr, revenue });
    }

    return successResponse({
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders,
      monthlyRevenue,
    });
  } catch (err) {
    console.error('Admin dashboard GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}
