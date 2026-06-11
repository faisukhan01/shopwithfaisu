'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlistStore, useCartStore, useNavigationStore, useSettingsStore } from '@/lib/stores';
import type { ProductWithCategory } from '@/lib/types';

export default function WishlistView() {
  const { items: wishlistIds, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const { setStoreView, setSelectedProductId } = useNavigationStore();
  const { settings } = useSettingsStore();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (wishlistIds.length === 0) { if (!cancelled) setLoading(false); return; }
      try {
        const r = await fetch('/api/products?limit=100');
        const data = await r.json();
        if (cancelled) return;
        const prods = (data.products || []).filter((p: ProductWithCategory) => wishlistIds.includes(p.id));
        setProducts(prods);
      } catch { /* empty */ }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [wishlistIds]);

  const handleAddToCart = (product: ProductWithCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      quantity: 1,
      product: { id: product.id, name: product.name, price: product.price, comparePrice: product.comparePrice, images: product.images, stock: product.stock },
    });
  };

  const getProductImage = (images: string) => {
    try { return JSON.parse(images)[0] || '/products/blanket.png'; } catch { return images || '/products/blanket.png'; }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3"><div className="aspect-square rounded-xl bg-neutral-100 animate-pulse" /><div className="h-4 w-3/4 rounded bg-neutral-100 animate-pulse" /><div className="h-3 w-1/2 rounded bg-neutral-100 animate-pulse" /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button
        onClick={() => setStoreView('home')}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Home
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">My Wishlist</h1>
          <p className="text-sm text-neutral-500 mt-1">{products.length} item{products.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-5">
            <Heart className="size-8 text-neutral-300" />
          </div>
          <p className="text-neutral-900 font-medium text-lg">Your wishlist is empty</p>
          <p className="text-neutral-500 text-sm mt-1">Save items you love for later.</p>
          <Button onClick={() => setStoreView('shop')} className="mt-6 bg-neutral-900 hover:bg-neutral-800 text-white">
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group cursor-pointer"
                onClick={() => { setSelectedProductId(product.id); setStoreView('product'); }}
              >
                <div className="relative rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 hover:shadow-lg transition-all">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={getProductImage(product.images)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeItem(product.id); }}
                      className="absolute top-3 right-3 size-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-neutral-200/50 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                    >
                      <Heart className="size-4 fill-rose-500 text-rose-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">{product.category.name}</p>
                    <h3 className="text-sm font-medium text-neutral-900 leading-snug line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-base font-semibold text-neutral-900">{settings.currencySymbol}{product.price.toFixed(2)}</span>
                      {product.comparePrice && <span className="text-sm text-neutral-400 line-through">{settings.currencySymbol}{product.comparePrice.toFixed(2)}</span>}
                    </div>
                    <Button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full mt-3 h-9 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg"
                    >
                      <ShoppingBag className="size-3.5 mr-1.5" /> Add to Cart
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}