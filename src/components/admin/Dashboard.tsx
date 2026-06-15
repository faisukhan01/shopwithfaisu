'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigationStore } from '@/lib/stores';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: {
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
  topProducts: {
    name: string;
    soldCount: number;
    revenue: number;
  }[];
  ordersByStatus: { status: string; count: number }[];
  categoryDistribution: { name: string; slug: string; count: number }[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-sky-100 text-sky-800',
  shipped: 'bg-violet-100 text-violet-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setAdminView, setSelectedOrderNumber } = useNavigationStore();

  useEffect(() => {
    fetch('/api/admin')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleOrderClick = (orderNumber: string) => {
    setSelectedOrderNumber(orderNumber);
    setAdminView('order-detail');
  };

  const stats = data
    ? [
        {
          label: 'Total Revenue',
          value: `$${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          icon: DollarSign,
          trend: '+12.5%',
          trendUp: true,
        },
        {
          label: 'Total Orders',
          value: data.totalOrders.toString(),
          icon: ShoppingCart,
          trend: '+8.2%',
          trendUp: true,
        },
        {
          label: 'Total Products',
          value: data.totalProducts.toString(),
          icon: Package,
          trend: '+3.1%',
          trendUp: true,
        },
        {
          label: 'Total Customers',
          value: data.totalCustomers.toString(),
          icon: Users,
          trend: '+5.4%',
          trendUp: true,
        },
      ]
    : [];

  const totalStatusCount = Array.isArray(data?.ordersByStatus)
    ? data.ordersByStatus.reduce((sum, s) => sum + s.count, 0)
    : Object.values(data?.ordersByStatus || {}).reduce((sum, c) => sum + c, 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Dashboard</h2>
        <p className="text-sm text-zinc-500 mt-1">Overview of your store performance</p>
      </div>

      {/* Stats cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-zinc-200/60 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                    <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                      <Icon className="h-4.5 w-4.5 text-zinc-600" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trendUp ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span
                        className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-500'}`}
                      >
                        {stat.trend}
                      </span>
                      <span className="text-xs text-zinc-400 ml-1">vs last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Category Distribution Chart */}
      {!loading && data?.categoryDistribution && data.categoryDistribution.length > 0 && (
        <Card className="border-zinc-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
              <span className="text-xs text-zinc-400">{data.categoryDistribution.length} categories</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.categoryDistribution.map((cat) => {
                const maxCount = Math.max(...data.categoryDistribution.map(c => c.count));
                const pct = maxCount > 0 ? Math.round((cat.count / maxCount) * 100) : 0;
                return (
                  <div key={cat.slug} className="flex-1 min-w-[100px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-zinc-600 truncate max-w-[80px]">{cat.name}</span>
                      <span className="text-[11px] text-zinc-400 ml-1">{cat.count}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-zinc-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
              <button
                onClick={() => setAdminView('orders')}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data?.recentOrders && data.recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-100 hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-zinc-500">Order</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-500 hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-500">Status</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-500 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((order) => (
                    <TableRow
                      key={order.orderNumber}
                      className="border-zinc-50 cursor-pointer hover:bg-zinc-50/80"
                      onClick={() => handleOrderClick(order.orderNumber)}
                    >
                      <TableCell className="font-medium text-sm text-zinc-900">
                        #{order.orderNumber.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500 hidden sm:table-cell">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[order.status] || 'bg-zinc-100 text-zinc-700'}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-zinc-900 text-right">
                        ${order.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center">
                <ShoppingCart className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Orders by Status */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : data?.ordersByStatus && (Array.isArray(data.ordersByStatus) ? data.ordersByStatus.length > 0 : Object.keys(data.ordersByStatus || {}).length > 0) ? (
                <div className="space-y-3">
                  {(Array.isArray(data.ordersByStatus) ? data.ordersByStatus : Object.entries(data.ordersByStatus || {}).map(([status, count]) => ({
                    status: typeof status === 'string' ? status : status,
                    count: typeof count === 'number' ? count : count,
                  })).map((s) => {
                    const pct = Math.round((s.count / totalStatusCount) * 100);
                    return (
                      <div key={s.status} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-zinc-700 capitalize">{s.status}</span>
                          <span className="text-zinc-500">
                            {s.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              s.status === 'delivered'
                                ? 'bg-emerald-500'
                                : s.status === 'cancelled'
                                  ? 'bg-red-400'
                                  : s.status === 'shipped'
                                    ? 'bg-violet-500'
                                    : s.status === 'confirmed'
                                      ? 'bg-sky-500'
                                      : 'bg-amber-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  }))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 text-center py-4">No data</p>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Top Products</CardTitle>
                <TrendingUp className="h-4 w-4 text-zinc-400" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : data?.topProducts && data.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {data.topProducts.slice(0, 5).map((product, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center text-sm font-semibold text-zinc-500">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{product.name}</p>
                        <p className="text-xs text-zinc-500">{product.soldCount} sold</p>
                      </div>
                      <p className="text-sm font-medium text-zinc-900">
                        ${(product.revenue ?? (product.price * product.soldCount) ?? 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Package className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">No products yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}