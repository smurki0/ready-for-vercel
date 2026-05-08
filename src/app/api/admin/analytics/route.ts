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

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // ─── Fetch base data in parallel ────────────────────────────────────────────
    const [
      recentOrders30d,
      orders12Months,
      allOrderItems,
      totalUsers,
      totalOrders,
      allOrdersForAvg,
      orderStatusCounts,
    ] = await Promise.all([
      // Orders from last 30 days (for revenueByDay)
      db.order.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { in: ['delivered', 'shipped', 'confirmed', 'pending'] },
        },
        select: { total: true, createdAt: true },
      }),

      // Orders from last 12 months (for revenueByMonth)
      db.order.findMany({
        where: {
          createdAt: { gte: twelveMonthsAgo },
          status: { in: ['delivered', 'shipped', 'confirmed', 'pending'] },
        },
        select: { total: true, createdAt: true },
      }),

      // All order items with product info (for topProducts, topCategories)
      db.orderItem.findMany({
        include: {
          product: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              images: true,
              categoryId: true,
              category: {
                select: {
                  id: true,
                  nameAr: true,
                  nameEn: true,
                },
              },
            },
          },
        },
      }),

      // Total users count (for conversionRate proxy)
      db.user.count(),

      // Total orders count (for conversionRate)
      db.order.count(),

      // All orders for average order value
      db.order.findMany({
        where: {
          status: { in: ['delivered', 'shipped', 'confirmed', 'pending'] },
        },
        select: { total: true },
      }),

      // Order status breakdown
      db.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    // ─── revenueByDay (last 30 days) ───────────────────────────────────────────
    const revenueByDay: { date: string; revenue: number; orders: number }[] =
      [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const dayStr = day.toISOString().split('T')[0]; // YYYY-MM-DD

      const dayOrders = recentOrders30d.filter((o) => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === dayStr;
      });

      revenueByDay.push({
        date: dayStr,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      });
    }

    // ─── revenueByMonth (last 12 months) ────────────────────────────────────────
    const revenueByMonth: { month: string; revenue: number; orders: number }[] =
      [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      const monthOrders = orders12Months.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return (
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear()
        );
      });

      revenueByMonth.push({
        month: monthStr,
        revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
        orders: monthOrders.length,
      });
    }

    // ─── topProducts (top 10 by totalSold) ─────────────────────────────────────
    const productMap = new Map<
      string,
      {
        id: string;
        nameAr: string;
        nameEn: string;
        images: string;
        totalSold: number;
        revenue: number;
      }
    >();

    for (const item of allOrderItems) {
      if (!item.product) continue;
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.totalSold += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        productMap.set(item.productId, {
          id: item.product.id,
          nameAr: item.product.nameAr,
          nameEn: item.product.nameEn,
          images: item.product.images,
          totalSold: item.quantity,
          revenue: item.price * item.quantity,
        });
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10)
      .map((p) => ({
        ...p,
        images: (() => {
          try {
            return JSON.parse(p.images);
          } catch {
            return [];
          }
        })(),
      }));

    // ─── topCategories ─────────────────────────────────────────────────────────
    const categoryMap = new Map<
      string,
      {
        id: string;
        nameAr: string;
        nameEn: string;
        totalSold: number;
        revenue: number;
      }
    >();

    for (const item of allOrderItems) {
      if (!item.product?.category) continue;
      const catId = item.product.categoryId;
      const existing = categoryMap.get(catId);
      if (existing) {
        existing.totalSold += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        categoryMap.set(catId, {
          id: item.product.category.id,
          nameAr: item.product.category.nameAr,
          nameEn: item.product.category.nameEn,
          totalSold: item.quantity,
          revenue: item.price * item.quantity,
        });
      }
    }

    const topCategories = Array.from(categoryMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    // ─── conversionRate ────────────────────────────────────────────────────────
    const conversionRate = {
      visitors: totalUsers, // using totalUsers as proxy
      orders: totalOrders,
      rate: totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0,
    };

    // ─── mostActiveUsers (top 10 by order count) ───────────────────────────────
    const usersWithOrders = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        orders: {
          select: { total: true },
        },
      },
    });

    const mostActiveUsers = usersWithOrders
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        orderCount: u.orders.length,
        totalSpent: u.orders.reduce((sum, o) => sum + o.total, 0),
      }))
      .filter((u) => u.orderCount > 0)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);

    // ─── orderStatusBreakdown ──────────────────────────────────────────────────
    const orderStatusBreakdown = orderStatusCounts.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    // ─── revenueGrowth ─────────────────────────────────────────────────────────
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // last day of last month

    const [thisMonthOrders, lastMonthOrders] = await Promise.all([
      db.order.findMany({
        where: {
          createdAt: { gte: thisMonthStart },
          status: { in: ['delivered', 'shipped', 'confirmed', 'pending'] },
        },
        select: { total: true },
      }),
      db.order.findMany({
        where: {
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
          status: { in: ['delivered', 'shipped', 'confirmed', 'pending'] },
        },
        select: { total: true },
      }),
    ]);

    const thisMonth = thisMonthOrders.reduce((sum, o) => sum + o.total, 0);
    const lastMonth = lastMonthOrders.reduce((sum, o) => sum + o.total, 0);
    const growthPercent =
      lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    // ─── averageOrderValue ─────────────────────────────────────────────────────
    const averageOrderValue =
      allOrdersForAvg.length > 0
        ? allOrdersForAvg.reduce((sum, o) => sum + o.total, 0) /
          allOrdersForAvg.length
        : 0;

    // ─── Return comprehensive analytics ────────────────────────────────────────
    return successResponse({
      revenueByDay,
      revenueByMonth,
      topProducts,
      topCategories,
      conversionRate,
      mostActiveUsers,
      orderStatusBreakdown,
      revenueGrowth: {
        thisMonth,
        lastMonth,
        growthPercent,
      },
      averageOrderValue,
    });
  } catch (err) {
    console.error('Admin analytics GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}
