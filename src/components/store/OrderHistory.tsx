'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore, useSettingsStore } from '@/lib/stores';
import type { OrderWithItems } from '@/lib/types';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-violet-100 text-violet-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700', icon: XCircle },
};

export default function OrderHistory() {
  const { setStoreView } = useNavigationStore();
  const { settings } = useSettingsStore();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else if (Array.isArray(data)) {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleOrder = (id: string) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  const productImage = (images: string | null) => {
    if (!images) return '/products/blanket.png';
    try {
      const parsed = JSON.parse(images);
      return parsed[0] || '/products/blanket.png';
    } catch {
      return images || '/products/blanket.png';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => setStoreView('home')}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Home
      </button>

      <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight mb-8">
        My Orders
      </h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-neutral-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-4">
            <Package className="size-7 text-neutral-300" />
          </div>
          <p className="text-neutral-500 text-lg font-medium">No orders yet</p>
          <p className="text-neutral-400 text-sm mt-1">
            When you place your first order, it will appear here.
          </p>
          <Button
            onClick={() => setStoreView('shop')}
            className="mt-6 h-10 px-6 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <motion.div
                key={order.id}
                layout
                className="border border-neutral-100 rounded-xl overflow-hidden bg-white hover:border-neutral-200 transition-colors"
              >
                {/* Order header */}
                <button
                  onClick={() => toggleOrder(order.id)}
                  className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-50 flex-shrink-0">
                      <Package className="size-5 text-neutral-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                    {/* Items preview */}
                    <div className="hidden md:flex items-center -space-x-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-neutral-50"
                        >
                          <img
                            src={productImage(item.productImage)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-neutral-400 font-medium pl-1">
                          +{order.items.length - 3}
                        </span>
                      )}
                    </div>

                    <span className="text-sm font-semibold text-neutral-900">
                      {settings.currencySymbol}
                      {order.total.toFixed(2)}
                    </span>

                    <Badge
                      className={`${status.color} border-0 text-[11px] font-semibold px-2.5 py-1 rounded-md`}
                    >
                      <StatusIcon className="size-3 mr-1" />
                      {status.label}
                    </Badge>

                    {isExpanded ? (
                      <ChevronUp className="size-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="size-4 text-neutral-400" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="px-5 py-4 sm:px-6 sm:py-5">
                        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                          Order Items
                        </h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-50 border border-neutral-100 flex-shrink-0">
                                <img
                                  src={productImage(item.productImage)}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-800 truncate">
                                  {item.productName}
                                </p>
                                <p className="text-xs text-neutral-400">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <span className="text-sm font-medium text-neutral-900">
                                {settings.currencySymbol}
                                {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-400">Subtotal</span>
                            <span className="text-neutral-600">
                              {settings.currencySymbol}
                              {order.subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-400">Shipping</span>
                            <span className="text-neutral-600">
                              {order.shipping === 0
                                ? 'Free'
                                : `${settings.currencySymbol}${order.shipping.toFixed(2)}`}
                            </span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-emerald-600">Discount</span>
                              <span className="text-emerald-600">
                                -{settings.currencySymbol}
                                {order.discount.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <Separator className="my-2" />
                          <div className="flex justify-between">
                            <span className="text-sm font-semibold text-neutral-900">
                              Total
                            </span>
                            <span className="text-base font-bold text-neutral-900">
                              {settings.currencySymbol}
                              {order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {order.trackingNumber && (
                          <div className="mt-4 bg-neutral-50 rounded-lg px-4 py-3 border border-neutral-100">
                            <p className="text-xs text-neutral-400">Tracking Number</p>
                            <p className="text-sm font-medium text-neutral-800 mt-0.5">
                              {order.trackingNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}