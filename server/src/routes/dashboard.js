import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireStaff } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', requireStaff, async (req, res) => {
  const [byStatus, ordersLast30, suppliesLow] = await Promise.all([
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.decoSupply.count({ where: { stockQty: { lt: 5 } } }),
  ]);

  const monthly = await prisma.$queryRaw`
    SELECT date_trunc('month', "createdAt") AS m, COUNT(*)::int AS c
    FROM "Order"
    WHERE "createdAt" >= NOW() - INTERVAL '6 months'
    GROUP BY 1
    ORDER BY 1
  `;

  res.json({
    ordersByStatus: byStatus.map((x) => ({ status: x.status, count: x._count.id })),
    newOrdersLast30Days: ordersLast30,
    suppliesLowStock: suppliesLow,
    ordersByMonth: monthly,
  });
});
