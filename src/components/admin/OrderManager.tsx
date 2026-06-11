'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { OrderWithItems } from '@/lib/types';

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-sky-100 text-sky-800',
  shipped: 'bg-violet-100 text-violet-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-zinc-100 text-zinc-700',
};

export default function OrderManager() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { setAdminView, setSelectedOrderNumber } = useNavigationStore();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      setOrders(Array.isArray(json) ? json : json.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOrderClick = (orderNumber: string) => {
    setSelectedOrderNumber(orderNumber);
    setAdminView('order-detail');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Orders</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search by order number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200/60">
          <Search className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-500">No orders found</p>
          <p className="text-xs text-zinc-400 mt-1">
            {search ? 'Try a different search term' : 'Orders will appear here once placed'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-100 hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-zinc-500">Order</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 hidden md:table-cell">Items</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-right">Total</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-center">Status</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-center hidden lg:table-cell">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-zinc-50 cursor-pointer hover:bg-zinc-50/80"
                    onClick={() => handleOrderClick(order.orderNumber)}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          #{order.orderNumber.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {order.paymentMethod || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-zinc-600">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-zinc-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-medium text-zinc-900">
                        ${order.total.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={statusColors[order.status] || 'bg-zinc-100 text-zinc-700'}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center hidden lg:table-cell">
                      <Badge
                        variant="secondary"
                        className={paymentStatusColors[order.paymentStatus] || 'bg-zinc-100 text-zinc-700'}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}