import { Injectable } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalProducts,
      totalOrders,
      revenueResult,
      totalCustomers,
      ordersByStatusRaw,
      recentOrdersRaw,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
      this.prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    const allStatuses: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
    ];

    const ordersByStatus: Record<string, number> = Object.fromEntries(
      allStatuses.map((s) => [s, 0]),
    );
    for (const row of ordersByStatusRaw) {
      ordersByStatus[row.status] = row._count.id;
    }

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o.id,
      customerName: `${o.user.firstName} ${o.user.lastName}`,
      total: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
    }));

    return {
      totalProducts,
      totalOrders,
      totalRevenue: (revenueResult._sum.totalAmount ?? 0).toString(),
      totalCustomers,
      ordersByStatus,
      recentOrders,
    };
  }
}
