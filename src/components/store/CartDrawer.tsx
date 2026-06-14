'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus, X, ArrowRight, Truck, Sparkles, Gift } from 'lucide-react';
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
      <SheetContent side="right" className="w-full sm:max-w-[420px] flex flex-col p-0 bg-white border-l border-neutral-100">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <SheetTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/20">
              <ShoppingBag className="size-4 text-white" />
            </div>
            <div>
              <span>Your Cart</span>
              {totalItems > 0 && (
                <span className="text-sm font-normal text-neutral-400 ml-1.5">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </SheetTitle>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative mb-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-100 flex items-center justify-center">
                <ShoppingBag className="size-7 text-neutral-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Gift className="size-2.5 text-amber-500" />
              </div>
            </motion.div>
            <h3 className="text-[15px] font-semibold text-neutral-900">Your cart is empty</h3>
            <p className="text-xs text-neutral-400 mt-2 max-w-[220px] leading-relaxed">
              Looks like you haven&apos;t added anything yet. Start exploring!
            </p>
            <Button
              onClick={() => { setCartOpen(false); setStoreView('shop'); }}
              className="mt-7 h-11 px-7 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm shadow-neutral-900/10 transition-all hover:shadow-md hover:shadow-neutral-900/15 active:scale-[0.98]"
            >
              Browse Products
              <ArrowRight className="ml-2 size-3.5" />
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping banner */}
            {subtotal < settings.freeShippingThreshold ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mb-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50/90 to-orange-50/60 border border-amber-100/60"
              >
                <div className="flex items-center gap-2 text-xs text-amber-800/90 mb-2.5">
                  <Truck className="size-3.5 text-amber-600 flex-shrink-0" />
                  <span>
                    Add <span className="font-bold text-amber-700">{settings.currencySymbol}{(settings.freeShippingThreshold - subtotal).toFixed(2)}</span> more for free shipping
                  </span>
                </div>
                <div className="w-full h-1.5 bg-amber-100/80 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    initial={false}
                    animate={{ width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mb-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50/90 to-teal-50/60 border border-emerald-100/60"
              >
                <div className="flex items-center gap-2 text-xs text-emerald-700">
                  <Sparkles className="size-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="font-semibold">You qualify for free shipping!</span>
                </div>
              </motion.div>
            )}

            {/* Items */}
            <ScrollArea className="flex-1">
              <div className="px-6 py-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.03 }}
                      className="py-4 border-b border-neutral-100/80 last:border-0"
                    >
                      <div className="flex gap-3.5">
                        {/* Image */}
                        <div
                          className="w-[76px] h-[76px] rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0 border border-neutral-100 cursor-pointer group shadow-sm"
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
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-[13px] font-medium text-neutral-800 line-clamp-2 leading-snug">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-neutral-300 hover:text-rose-500 transition-colors duration-200 flex-shrink-0 -mt-0.5 p-0.5 rounded-md hover:bg-rose-50"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            {/* Quantity */}
                            <div className="flex items-center bg-neutral-50 border border-neutral-200/80 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-white transition-all duration-150"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="h-8 w-9 flex items-center justify-center text-xs font-bold text-neutral-900 bg-white border-x border-neutral-200/80">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-white transition-all duration-150"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-sm font-bold text-neutral-900 tabular-nums">
                                {settings.currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-[10px] text-neutral-400 mt-0.5">
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
            <div className="border-t border-neutral-100 px-6 py-5 flex-shrink-0 bg-gradient-to-t from-white to-neutral-50/30">
              <div className="space-y-2.5 mb-5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="text-neutral-700 font-medium tabular-nums">
                    {settings.currencySymbol}{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-neutral-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-emerald-600 font-semibold' : 'text-neutral-700 font-medium tabular-nums'}>
                    {shipping === 0 ? 'Free' : `${settings.currencySymbol}${shipping.toFixed(2)}`}
                  </span>
                </div>
                <Separator className="!bg-neutral-100" />
                <div className="flex justify-between pt-1">
                  <span className="text-sm font-bold text-neutral-900">Total</span>
                  <span className="text-lg font-bold text-neutral-900 tabular-nums tracking-tight">
                    {settings.currencySymbol}{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => { setCartOpen(false); setStoreView('checkout'); }}
                className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98]"
              >
                Checkout
                <ArrowRight className="ml-2 size-4" />
              </Button>

              <button
                onClick={() => setCartOpen(false)}
                className="w-full text-center text-xs text-neutral-400 hover:text-neutral-700 transition-colors mt-3 py-1.5 font-medium"
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