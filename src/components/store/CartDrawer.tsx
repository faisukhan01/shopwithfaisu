'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus, X, ArrowRight, Truck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore, useSettingsStore, useNavigationStore } from '@/lib/stores';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTotalItems,
  } = useCartStore();
  const { settings } = useSettingsStore();
  const { setStoreView } = useNavigationStore();

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : 5.99;
  const total = subtotal + shipping;

  const productImage = (images: string) => {
    try {
      const parsed = JSON.parse(images);
      return parsed[0] || '/products/blanket.png';
    } catch {
      return images || '/products/blanket.png';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-[420px] flex flex-col p-0 bg-white">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <SheetTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
              <ShoppingBag className="size-4 text-white" />
            </div>
            Your Cart
            {totalItems > 0 && (
              <span className="text-sm font-normal text-neutral-400">
                · {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            )}
          </SheetTitle>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-5"
            >
              <ShoppingBag className="size-6 text-neutral-300" />
            </motion.div>
            <h3 className="text-sm font-medium text-neutral-900">Your cart is empty</h3>
            <p className="text-xs text-neutral-400 mt-1.5 max-w-[200px] leading-relaxed">
              Discover our collection and add items you love
            </p>
            <Button
              onClick={() => { setCartOpen(false); setStoreView('shop'); }}
              variant="outline"
              className="mt-6 h-10 px-6 text-xs font-medium rounded-lg border-neutral-200 hover:bg-neutral-50"
            >
              Browse Products
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping banner */}
            {subtotal < settings.freeShippingThreshold ? (
              <div className="mx-6 mb-3 px-4 py-3 rounded-xl bg-amber-50/80 border border-amber-100/60">
                <div className="flex items-center gap-2 text-xs text-amber-800 mb-2">
                  <Truck className="size-3.5 text-amber-600 flex-shrink-0" />
                  <span>
                    Add <span className="font-semibold">{settings.currencySymbol}{(settings.freeShippingThreshold - subtotal).toFixed(2)}</span> more for free shipping
                  </span>
                </div>
                <div className="w-full h-1 bg-amber-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500 rounded-full"
                    initial={false}
                    animate={{ width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ) : (
              <div className="mx-6 mb-3 px-4 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100/60">
                <div className="flex items-center gap-2 text-xs text-emerald-700">
                  <Sparkles className="size-3.5 text-emerald-500" />
                  <span className="font-medium">You qualify for free shipping!</span>
                </div>
              </div>
            )}

            {/* Items */}
            <ScrollArea className="flex-1">
              <div className="px-6 py-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="py-4 border-b border-neutral-50 last:border-0"
                    >
                      <div className="flex gap-3.5">
                        {/* Image */}
                        <div
                          className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0 border border-neutral-100 cursor-pointer group"
                          onClick={() => {
                            setCartOpen(false);
                            const nav = useNavigationStore.getState();
                            nav.setSelectedProductId(item.productId);
                            setStoreView('product');
                          }}
                        >
                          <img
                            src={productImage(item.product.images)}
                            alt={item.product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-[13px] font-medium text-neutral-900 line-clamp-2 leading-snug">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-neutral-300 hover:text-neutral-600 transition-colors flex-shrink-0 -mt-0.5 p-0.5"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity */}
                            <div className="flex items-center bg-neutral-50 border border-neutral-100 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="h-7 w-7 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors rounded-l-lg"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="h-7 w-8 flex items-center justify-center text-xs font-semibold text-neutral-900 border-x border-neutral-100">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="h-7 w-7 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors rounded-r-lg"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-sm font-semibold text-neutral-900 tabular-nums">
                                {settings.currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                              </p>
                              {item.quantity > 1 && item.product.comparePrice && (
                                <p className="text-[10px] text-neutral-400">
                                  {settings.currencySymbol}{item.product.price.toFixed(2)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-neutral-100 px-6 py-5 flex-shrink-0 bg-white">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[13px]">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="text-neutral-700 font-medium tabular-nums">
                    {settings.currencySymbol}{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-neutral-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-emerald-600 font-medium' : 'text-neutral-700 font-medium tabular-nums'}>
                    {shipping === 0 ? 'Free' : `${settings.currencySymbol}${shipping.toFixed(2)}`}
                  </span>
                </div>
                <Separator className="!bg-neutral-100" />
                <div className="flex justify-between pt-0.5">
                  <span className="text-sm font-semibold text-neutral-900">Total</span>
                  <span className="text-base font-bold text-neutral-900 tabular-nums">
                    {settings.currencySymbol}{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => { setCartOpen(false); setStoreView('checkout'); }}
                className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-neutral-900/15 active:scale-[0.99]"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 size-4" />
              </Button>

              <button
                onClick={() => setCartOpen(false)}
                className="w-full text-center text-xs text-neutral-400 hover:text-neutral-600 transition-colors mt-3 py-1"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}