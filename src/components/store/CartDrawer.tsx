'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus, X, ArrowRight, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
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
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-neutral-100 flex-shrink-0">
          <SheetTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <ShoppingBag className="size-5" />
            Cart
            {totalItems > 0 && (
              <span className="text-sm font-normal text-neutral-400">
                ({totalItems} item{totalItems !== 1 ? 's' : ''})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mb-5">
              <Package className="size-8 text-neutral-300" />
            </div>
            <h3 className="text-base font-medium text-neutral-900">
              Your cart is empty
            </h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-[220px]">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Button
              onClick={() => {
                setCartOpen(false);
                setStoreView('shop');
              }}
              className="mt-6 h-10 px-6 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg"
            >
              Start Shopping
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <ScrollArea className="flex-1">
              <div className="px-6 py-4 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-4"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-neutral-50 flex-shrink-0 border border-neutral-100">
                        <img
                          src={productImage(item.product.images)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-neutral-900 line-clamp-2 leading-snug">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0 -mt-0.5"
                          >
                            <X className="size-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity controls */}
                          <div className="flex items-center border border-neutral-200 rounded-md">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              className="h-7 w-7 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="h-7 w-8 flex items-center justify-center text-xs font-medium text-neutral-900 border-x border-neutral-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              className="h-7 w-7 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <span className="text-sm font-semibold text-neutral-900">
                              {settings.currencySymbol}
                              {(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            {item.product.comparePrice && (
                              <p className="text-xs text-neutral-400 line-through">
                                {settings.currencySymbol}
                                {(
                                  item.product.comparePrice * item.quantity
                                ).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Footer with totals */}
            <div className="border-t border-neutral-100 px-6 py-5 flex-shrink-0 bg-white">
              {/* Free shipping progress */}
              {subtotal < settings.freeShippingThreshold && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
                    <Truck className="size-3.5 text-amber-600" />
                    Add{' '}
                    <span className="font-medium text-neutral-700">
                      {settings.currencySymbol}
                      {(settings.freeShippingThreshold - subtotal).toFixed(2)}
                    </span>{' '}
                    more for free shipping
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (subtotal / settings.freeShippingThreshold) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="text-neutral-900 font-medium">
                    {settings.currencySymbol}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Shipping</span>
                  <span
                    className={
                      shipping === 0
                        ? 'text-emerald-600 font-medium'
                        : 'text-neutral-900 font-medium'
                    }
                  >
                    {shipping === 0 ? 'Free' : `${settings.currencySymbol}${shipping.toFixed(2)}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-neutral-900">
                    Estimated Total
                  </span>
                  <span className="text-base font-bold text-neutral-900">
                    {settings.currencySymbol}
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setCartOpen(false);
                  setStoreView('checkout');
                }}
                className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-neutral-900/20"
              >
                Checkout
                <ArrowRight className="ml-2 size-4" />
              </Button>

              <button
                onClick={() => setCartOpen(false)}
                className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700 transition-colors mt-3"
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