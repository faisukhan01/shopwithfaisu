'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Package, ImageOff, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigationStore } from '@/lib/stores';
import type { OrderWithItems } from '@/lib/types';

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

const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetail() {
  const { selectedOrderNumber, setAdminView } = useNavigationStore();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [tracking, setTracking] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);

  useEffect(() => {
    if (!selectedOrderNumber) return;
    setLoading(true);
    fetch(`/api/orders/${selectedOrderNumber}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setStatus(data.status);
        setTracking(data.trackingNumber || '');
      })
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [selectedOrderNumber]);

  const handleStatusChange = async () => {
    if (!order || status === order.status) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setOrder({ ...order, status });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
      setStatus(order.status);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!order) return;
    setSavingTracking(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: tracking.trim() || null }),
      });
      if (!res.ok) throw new Error();
      setOrder({ ...order, trackingNumber: tracking.trim() || null });
      toast.success('Tracking number updated');
    } catch {
      toast.error('Failed to update tracking');
    } finally {
      setSavingTracking(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-zinc-500">Order not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setAdminView('orders')}
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  const parseAddress = (addr: string | null) => {
    if (!addr) return null;
    try {
      return JSON.parse(addr);
    } catch {
      return null;
    }
  };

  const shippingAddr = parseAddress(order.shippingAddress);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setAdminView('orders')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Order #{order.orderNumber.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={`text-sm px-3 py-1 ${statusColors[order.status] || 'bg-zinc-100 text-zinc-700'}`}
        >
          {order.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-100 hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-zinc-500">Product</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-500 text-right hidden sm:table-cell">Price</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-500 text-center">Qty</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-500 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id} className="border-zinc-50 hover:bg-transparent">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-lg bg-zinc-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Package className="h-4 w-4 text-zinc-300" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">
                            {item.productName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        <span className="text-sm text-zinc-600">${item.price.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-zinc-600">{item.quantity}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium text-zinc-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-zinc-900">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Shipping</span>
                <span className="text-zinc-900">
                  {order.shipping > 0 ? `$${order.shipping.toFixed(2)}` : 'Free'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Tax</span>
                <span className="text-zinc-900">${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">
                    Discount{order.couponCode ? ` (${order.couponCode})` : ''}
                  </span>
                  <span className="text-emerald-600">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span className="text-zinc-900">Total</span>
                <span className="text-zinc-900">${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update status */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Update Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="flex gap-2">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusChange}
                    disabled={savingStatus || status === order.status}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white shrink-0"
                  >
                    {savingStatus ? '...' : 'Update'}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label>Tracking Number</Label>
                <div className="flex gap-2">
                  <Input
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="Enter tracking number"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleTrackingUpdate}
                    disabled={savingTracking}
                    variant="outline"
                    className="shrink-0"
                  >
                    <Truck className="h-4 w-4" />
                  </Button>
                </div>
                {order.trackingNumber && (
                  <p className="text-xs text-zinc-400 mt-1">
                    Current: {order.trackingNumber}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer / Shipping */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {shippingAddr ? (
                <div className="text-sm text-zinc-600 space-y-1">
                  <p className="font-medium text-zinc-900">
                    {shippingAddr.firstName} {shippingAddr.lastName}
                  </p>
                  <p>{shippingAddr.address}</p>
                  {shippingAddr.city && <p>{shippingAddr.city}, {shippingAddr.state} {shippingAddr.zipCode}</p>}
                  {shippingAddr.country && <p>{shippingAddr.country}</p>}
                  {shippingAddr.phone && <p className="text-zinc-400">{shippingAddr.phone}</p>}
                </div>
              ) : order.shippingAddress ? (
                <p className="text-sm text-zinc-500">{order.shippingAddress}</p>
              ) : (
                <p className="text-sm text-zinc-400">No shipping address</p>
              )}
            </CardContent>
          </Card>

          {/* Payment info */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Payment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Method</span>
                <span className="text-zinc-900 capitalize">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <Badge
                  variant="secondary"
                  className={paymentStatusColors[order.paymentStatus] || 'bg-zinc-100 text-zinc-700'}
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Notes</p>
                    <p className="text-sm text-zinc-600">{order.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}