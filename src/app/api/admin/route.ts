import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const [
      totalProducts,
      totalOrders,
      totalRevenueResult,
      totalCustomers,
      recentOrders,
      topProducts,
      ordersByStatus,
      categoryDistribution,
    ] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.order.aggregate({ _sum: { total: true }, where: { status: { not: 'cancelled' } } }),
      db.user.count({ where: { role: 'customer', isActive: true } }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      db.product.findMany({
        where: { isActive: true },
        orderBy: { soldCount: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          price: true,
          soldCount: true,
          stock: true,
          images: true,
        },
      }),
      db.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      db.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: { where: { isActive: true } } } } },
      }),
    ])

    const statusCounts: Record<string, number> = {}
    for (const s of ordersByStatus) {
      statusCounts[s.status] = s._count.status
    }

    const formattedTopProducts = topProducts.map((p) => ({
      ...p,
      images: JSON.parse(p.images),
      revenue: p.price * p.soldCount,
    }))

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenueResult._sum.total || 0,
      totalCustomers,
      recentOrders,
      topProducts: formattedTopProducts,
      ordersByStatus: statusCounts,
      categoryDistribution: categoryDistribution.map(c => ({
        name: c.name,
        slug: c.slug,
        count: c._count.products,
      })),
    })
  } catch (error) {
    console.error('Error fetching admin dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}