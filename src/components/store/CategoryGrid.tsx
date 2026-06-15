'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigationStore } from '@/lib/stores';
import type { CategoryWithCount } from '@/lib/types';

export default function CategoryGrid() {
  const { setStoreView, setSelectedCategoryId } = useNavigationStore();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCategoryClick = (id: string) => {
    setSelectedCategoryId(id);
    setStoreView('shop');
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-36 h-44 sm:w-44 sm:h-52 rounded-xl bg-neutral-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Find exactly what you&apos;re looking for
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setStoreView('shop');
            }}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
          >
            View All
            <ArrowRight className="size-4" />
          </button>
        </div>

        {/* Category cards - horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0 scrollbar-hide">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              onClick={() => handleCategoryClick(category.id)}
              className="group flex-shrink-0 sm:flex-shrink relative w-36 sm:w-auto rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 hover:border-neutral-200 transition-all sm:aspect-[4/5]"
            >
              {/* Image */}
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-4 text-left">
                <h3 className="text-white font-semibold text-sm sm:text-base">
                  {category.name}
                </h3>
                <p className="text-neutral-300 text-xs mt-0.5">
                  {category._count.products} product{category._count.products !== 1 ? 's' : ''}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-4 sm:hidden">
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setStoreView('shop');
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors mx-auto"
          >
            View All Categories
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}