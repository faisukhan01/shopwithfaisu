'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, useNavigationStore, useSettingsStore, useWishlistStore } from '@/lib/stores';
import type { ProductWithCategory } from '@/lib/types';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: ProductWithCategory;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { setStoreView, setSelectedProductId } = useNavigationStore();
  const { settings } = useSettingsStore();
  const { toggleItem, isWishlisted } = useWishlistStore();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const wishlisted = isWishlisted(product.id);

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

  const lowStock = product.stock <= 3 && product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      quantity: 1,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        images: product.images,
        stock: product.stock,
      },
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItem(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleClick = () => {
    setSelectedProductId(product.id);
    setStoreView('product');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`size-3 ${
              i < Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-neutral-200 text-neutral-200'
            }`}
          />
        ))}
        <span className="text-xs text-neutral-400 ml-1.5">({product.reviewCount})</span>
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        onClick={handleClick}
        className="group cursor-pointer"
      >
        {/* 1a: Card hover — scale-up + shadow + translate */}
        <div className="relative rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-neutral-900/8 hover:border-neutral-200 hover:-translate-y-1 hover:scale-[1.02]">
          {/* Image container */}
          <div className="relative aspect-square overflow-hidden">
            {/* 1b: Image zoom 1.08x on hover */}
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
            />

            {/* Gradient overlay on hover */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Badges - top left */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {/* 1e: "New" badge with subtle pulse animation */}
              {product.isNew && (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Badge className="bg-neutral-900 text-white border-0 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    New
                  </Badge>
                </motion.div>
              )}
              {discount > 0 && (
                <Badge className="bg-rose-500 text-white border-0 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Wishlist Heart - top right */}
            <div className="absolute top-3 right-3 z-10">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleWishlist}
                className="size-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-neutral-200/50 transition-colors hover:bg-white"
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={wishlisted ? 'filled' : 'empty'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Heart
                      className={`size-4 ${
                        wishlisted
                          ? 'fill-rose-500 text-rose-500'
                          : 'fill-transparent text-neutral-300'
                      } transition-colors`}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Hover actions - slide up from bottom */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out hidden sm:flex gap-2">
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-10 bg-white/95 backdrop-blur-sm hover:bg-white text-neutral-900 font-medium text-sm rounded-lg shadow-md border border-neutral-200/50"
              >
                <ShoppingBag className="size-4 mr-2" />
                Add to Cart
              </Button>
              {/* 1c: Refined Quick View — smaller pill with backdrop blur */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleQuickView}
                className="size-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-neutral-700 hover:text-neutral-900 hover:bg-white/95 shadow-md border border-neutral-200/50 transition-colors flex-shrink-0"
                aria-label="Quick view"
              >
                <Eye className="size-4" />
              </motion.button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
              {product.category.name}
            </p>
            <h3 className="text-sm font-medium text-neutral-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-amber-700 transition-colors">
              {product.name}
            </h3>

            {product.shortDesc && (
              <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                {product.shortDesc}
              </p>
            )}

            {renderStars(product.rating)}

            {/* 1d: Price with fade-in when discount is present */}
            <div className="flex items-center gap-2 mt-2">
              {discount > 0 ? (
                <motion.span
                  className="text-base font-semibold text-neutral-900"
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + index * 0.04 }}
                >
                  {settings.currencySymbol}{product.price.toFixed(2)}
                </motion.span>
              ) : (
                <span className="text-base font-semibold text-neutral-900">
                  {settings.currencySymbol}{product.price.toFixed(2)}
                </span>
              )}
              {product.comparePrice && (
                <motion.span
                  className="text-sm text-neutral-400 line-through"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 + index * 0.04 }}
                >
                  {settings.currencySymbol}{product.comparePrice.toFixed(2)}
                </motion.span>
              )}
            </div>

            {/* 1f: Low stock indicator */}
            {lowStock && (
              <motion.p
                className="text-[11px] font-medium text-amber-600 mt-1.5"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.04 }}
              >
                Only {product.stock} left
              </motion.p>
            )}

            {/* Mobile Add to Cart - always visible */}
            <div className="flex gap-2 mt-3 sm:hidden">
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="flex-1 h-9 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg"
              >
                <ShoppingBag className="size-3.5 mr-1.5" />
                Add to Cart
              </Button>
              <Button
                onClick={handleQuickView}
                size="sm"
                variant="outline"
                className="h-9 border-neutral-200 text-xs font-medium rounded-lg"
              >
                <Eye className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}