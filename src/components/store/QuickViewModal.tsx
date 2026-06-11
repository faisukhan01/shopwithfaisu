'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore, useNavigationStore, useSettingsStore } from '@/lib/stores';
import type { ProductWithCategory } from '@/lib/types';

interface QuickViewModalProps {
  product: ProductWithCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const { addItem } = useCartStore();
  const { setStoreView, setSelectedProductId } = useNavigationStore();
  const { settings } = useSettingsStore();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) return null;

  const images: string[] = (() => {
    try {
      return JSON.parse(product.images);
    } catch {
      return [];
    }
  })();
  const mainImage = images[0] || '/products/blanket.png';

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      quantity,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        images: product.images,
        stock: product.stock,
      },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleViewFull = () => {
    onOpenChange(false);
    setSelectedProductId(product.id);
    setStoreView('product');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setQuantity(1); setAddedToCart(false); }}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden rounded-xl border-neutral-200">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid sm:grid-cols-2"
        >
          {/* Left: Image */}
          <div className="relative aspect-square sm:aspect-auto sm:min-h-[420px] bg-neutral-50">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                -{discount}%
              </div>
            )}
            {product.isNew && (
              <div className="absolute top-3 right-3 bg-neutral-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                New
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-1.5">
              {product.category.name}
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight leading-tight">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${
                      i < Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-neutral-200 text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-500">
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2.5 mt-4">
              <span className="text-2xl font-bold text-neutral-900">
                {settings.currencySymbol}{product.price.toFixed(2)}
              </span>
              {product.comparePrice && (
                <span className="text-base text-neutral-400 line-through">
                  {settings.currencySymbol}{product.comparePrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Short description */}
            {product.shortDesc && (
              <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
                {product.shortDesc}
              </p>
            )}

            <Separator className="my-5" />

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-neutral-700">Quantity</span>
              <div className="flex items-center border border-neutral-200 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-9 w-9 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="h-9 w-10 flex items-center justify-center text-sm font-medium text-neutral-900 border-x border-neutral-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="h-9 w-9 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <span className="text-xs text-neutral-400">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full h-11 mt-5 text-sm font-semibold rounded-lg transition-all ${
                addedToCart
                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {addedToCart ? (
                'Added to Cart ✓'
              ) : (
                <>
                  <ShoppingBag className="size-4 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </Button>

            {/* View Full Details link */}
            <button
              onClick={handleViewFull}
              className="flex items-center justify-center gap-1.5 mt-3 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors group"
            >
              View Full Details
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}