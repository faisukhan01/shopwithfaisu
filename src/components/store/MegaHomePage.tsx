'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  Eye,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStore, useSettingsStore, useRecentlyViewedStore } from '@/lib/stores';
import type { ProductWithCategory, CategoryWithCount } from '@/lib/types';
import ProductCard from '@/components/store/ProductCard';

// ==================== TRUST BAR ====================
function TrustBar() {
  const features = [
    { icon: Truck, label: 'Free Shipping', desc: 'On orders over $75' },
    { icon: Shield, label: 'Secure Payment', desc: '100% protected' },
    { icon: RotateCcw, label: 'Easy Returns', desc: '30-day policy' },
    { icon: Headphones, label: '24/7 Support', desc: 'Always here for you' },
  ];
  return (
    <section className="border-b border-neutral-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-neutral-100">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 py-4 sm:py-5 px-3 sm:px-4 first:pl-0 last:pr-0">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Icon className="size-4.5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{label}</p>
                <p className="text-xs text-neutral-400 truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== HERO SECTION ====================
function HeroSection() {
  const { settings } = useSettingsStore();
  const { setStoreView } = useNavigationStore();
  const heroImage = settings.heroImage || '/banners/hero.png';

  return (
    <section className="relative w-full overflow-hidden bg-neutral-950">
      <div className="absolute inset-0">
        <img src={heroImage} alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center min-h-[55vh] sm:min-h-[65vh] lg:min-h-[75vh] py-16 sm:py-20 lg:py-24">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-amber-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-4 sm:mb-5"
            >
              {settings.storeTagline}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight"
            >
              {settings.heroTitle}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 sm:mt-5 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-md"
            >
              {settings.heroSubtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-7 sm:mt-8 flex flex-wrap gap-3"
            >
              <Button
                onClick={() => setStoreView('shop')}
                size="lg"
                className="h-12 px-8 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-amber-600/25"
              >
                {settings.heroCta || 'Shop Now'}
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                onClick={() => { setStoreView('shop'); }}
                variant="outline"
                size="lg"
                className="h-12 px-8 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-lg bg-transparent"
              >
                Browse Categories
              </Button>
            </motion.div>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-10 sm:mt-14 flex items-center gap-8 sm:gap-12"
            >
              {[{ n: '50K+', l: 'Happy Customers' }, { n: '500+', l: 'Products' }, { n: '4.8', l: 'Avg. Rating' }].map(({ n, l }) => (
                <div key={l}>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{n}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{l}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== CATEGORY SECTION ====================
function CategorySection() {
  const { setStoreView, setSelectedCategoryId } = useNavigationStore();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleClick = (id: string) => { setSelectedCategoryId(id); setStoreView('shop'); };

  return (
    <section className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <p className="text-xs font-semibold text-amber-600 tracking-widest uppercase mb-2">Browse</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Shop by Category</h2>
            <p className="text-sm text-neutral-500 mt-1.5 max-w-md">From tech essentials to artisan pantry items — find everything you need, beautifully curated.</p>
          </div>
          <button
            onClick={() => { setSelectedCategoryId(null); setStoreView('shop'); }}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors group"
          >
            All Categories <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square sm:aspect-[3/4] rounded-xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                onClick={() => handleClick(cat.id)}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 hover:border-neutral-200 transition-all sm:aspect-[3/4] aspect-square"
              >
                {cat.image && (
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="relative h-full flex flex-col justify-end p-3 sm:p-4 text-left">
                  <h3 className="text-white font-semibold text-xs sm:text-sm leading-tight">{cat.name}</h3>
                  <p className="text-neutral-300 text-[10px] sm:text-xs mt-0.5">{cat._count.products} items</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ==================== SCROLLABLE PRODUCT ROW ====================
function ProductRow({ title, subtitle, apiParams, viewAllSort }: {
  title: string; subtitle: string; apiParams: string; viewAllSort?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setStoreView, setSelectedCategoryId, setSearchQuery } = useNavigationStore();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const canScrollLeft = false;

  useEffect(() => {
    fetch(`/api/products?${apiParams}`)
      .then((res) => res.json())
      .then((data) => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [apiParams]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amt = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amt : amt, behavior: 'smooth' });
  };

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">{title}</h2>
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors hidden sm:flex"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors hidden sm:flex"
            >
              <ChevronRight className="size-4" />
            </button>
            <button
              onClick={() => {
                if (viewAllSort) {
                  // navigate to shop with sort
                }
                setSelectedCategoryId(null);
                setSearchQuery('');
                setStoreView('shop');
              }}
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors ml-2"
            >
              View All <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[200px] sm:w-[240px] space-y-3">
                <div className="aspect-square rounded-xl bg-neutral-100 animate-pulse" />
                <div className="h-3 w-16 rounded bg-neutral-100 animate-pulse" />
                <div className="h-4 w-full rounded bg-neutral-100 animate-pulse" />
                <div className="h-4 w-20 rounded bg-neutral-100 animate-pulse" />
              </div>
            ))
            : products.map((product, i) => (
              <div key={product.id} className="flex-shrink-0 w-[200px] sm:w-[240px] snap-start">
                <ProductCard product={product} index={i} />
              </div>
            ))
          }
        </div>
        <div className="mt-5 text-center sm:hidden">
          <button
            onClick={() => { setSelectedCategoryId(null); setSearchQuery(''); setStoreView('shop'); }}
            className="text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
          >
            View All Products <ArrowRight className="inline size-3.5 ml-1" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ==================== RECENTLY VIEWED SECTION ====================
function RecentlyViewedSection() {
  const { items, clearAll } = useRecentlyViewedStore();
  const { setSelectedProductId, setStoreView } = useNavigationStore();
  const { settings } = useSettingsStore();

  if (items.length === 0) return null;

  const handleClick = (item: typeof items[0]) => {
    setSelectedProductId(item.id);
    setStoreView('product');
  };

  const getFirstImage = (images: string) => {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } catch {
      return images || null;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45 }}
      className="py-10 sm:py-14"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">Recently Viewed</h2>
            <p className="text-sm text-neutral-500 mt-1">Products you&apos;ve been looking at</p>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="size-3.5" />
            Clear
          </button>
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {items.slice(0, 8).map((item, i) => {
            const img = getFirstImage(item.images);
            const hasDiscount = item.comparePrice && item.comparePrice > item.price;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => handleClick(item)}
                className="group flex-shrink-0 w-[140px] sm:w-[165px] rounded-xl border border-neutral-100 bg-neutral-50 overflow-hidden text-left hover:border-neutral-200 hover:shadow-sm transition-all"
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  {img ? (
                    <img
                      src={img}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <Eye className="size-6" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs font-medium bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Eye className="size-3" />
                      View
                    </span>
                  </div>
                  {item.isNew && (
                    <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide truncate">{item.categoryName}</p>
                  <p className="text-xs font-medium text-neutral-800 mt-0.5 line-clamp-2 leading-snug min-h-[2rem]">{item.name}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-sm font-bold text-neutral-900">{settings.currencySymbol}{item.price.toFixed(2)}</span>
                    {hasDiscount && (
                      <span className="text-[11px] text-neutral-400 line-through">{settings.currencySymbol}{item.comparePrice!.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

// ==================== PROMO BANNERS ====================
function PromoBanners() {
  const { setStoreView, setSelectedCategoryId } = useNavigationStore();
  const promos = [
    { title: 'New Electronics', desc: 'Up to 25% off latest tech', cta: 'Shop Now', bg: 'bg-neutral-900', catId: null },
    { title: 'Home & Living', desc: 'Make your space a sanctuary', cta: 'Explore', bg: 'bg-amber-50 border border-amber-100', catId: null },
    { title: 'Beauty Essentials', desc: 'Natural & organic formulations', cta: 'Discover', bg: 'bg-rose-50 border border-rose-100', catId: null },
  ];

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {promos.map((promo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`rounded-2xl p-6 sm:p-8 ${promo.bg} flex flex-col justify-between min-h-[160px] sm:min-h-[180px]`}
            >
              <div>
                <h3 className={`text-lg sm:text-xl font-bold ${promo.bg.includes('neutral') ? 'text-white' : 'text-neutral-900'}`}>
                  {promo.title}
                </h3>
                <p className={`text-sm mt-1 ${promo.bg.includes('neutral') ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {promo.desc}
                </p>
              </div>
              <button
                onClick={() => setStoreView('shop')}
                className={`mt-5 text-sm font-medium flex items-center gap-1.5 transition-colors ${promo.bg.includes('neutral') ? 'text-amber-400 hover:text-amber-300' : 'text-neutral-900 hover:text-neutral-700'}`}
              >
                {promo.cta} <ArrowRight className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== TESTIMONIALS ====================
function Testimonials() {
  const testimonials = [
    { name: 'Sarah J.', role: 'Verified Buyer', text: 'The quality of everything I\'ve ordered has been exceptional. The packaging alone makes you feel special. This is how online shopping should be.', rating: 5 },
    { name: 'Michael T.', role: 'Verified Buyer', text: 'I\'ve been a customer for 6 months now and I\'m consistently impressed. Fast shipping, great products, and their customer service is top-notch.', rating: 5 },
    { name: 'Priya K.', role: 'Verified Buyer', text: 'Finally found a store that matches my taste. Everything is curated so well — no junk, just beautiful, functional products I actually want.', rating: 5 },
    { name: 'David L.', role: 'Verified Buyer', text: 'Bought gifts for three different people here. Every single one loved their present. The gift-ready packaging is a huge plus.', rating: 5 },
  ];

  return (
    <section className="py-14 sm:py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-semibold text-amber-600 tracking-widest uppercase mb-2">Testimonials</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Loved by Thousands</h2>
          <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto">Don&apos;t just take our word for it — hear from our community of happy customers.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-2xl p-6 border border-neutral-100"
            >
              <Quote className="size-5 text-amber-300 mb-3" />
              <p className="text-sm text-neutral-700 leading-relaxed mb-4">{t.text}</p>
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
                <p className="text-xs text-neutral-400">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== NEWSLETTER ====================
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 3000); }
  };

  return (
    <section className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 rounded-3xl px-6 sm:px-12 lg:px-20 py-12 sm:py-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Stay in the Loop</h2>
            <p className="text-neutral-400 mt-2.5 text-sm sm:text-base max-w-md mx-auto">
              Get exclusive access to new arrivals, special offers, and style inspiration delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 h-12 px-4 text-sm bg-white/10 border border-white/10 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
              />
              <button
                type="submit"
                className="h-12 px-6 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
              >
                Subscribe
              </button>
            </form>
            {subscribed && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-emerald-400 mt-3"
              >
                Subscribed successfully! Welcome aboard.
              </motion.p>
            )}
            <p className="text-xs text-neutral-600 mt-4">No spam, unsubscribe anytime. We respect your privacy.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== BRAND LOGOS ====================
function BrandLogos() {
  const brands = ['Apple', 'Sony', 'Bose', 'Samsung', 'Dyson', 'Nespresso'];
  return (
    <section className="py-10 sm:py-14 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium text-neutral-400 tracking-widest uppercase mb-6">Trusted Brands We Carry</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-16 gap-y-4">
          {brands.map((brand) => (
            <span key={brand} className="text-lg sm:text-xl font-bold text-neutral-200 tracking-tight hover:text-neutral-400 transition-colors select-none">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== MEGA HOMEPAGE ====================
export default function MegaHomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <div className="bg-white">
        <CategorySection />
        <div className="border-t border-neutral-100" />
        <ProductRow
          title="Best Sellers"
          subtitle="Most loved by our community"
          apiParams="sortBy=popular&limit=12"
        />
        <PromoBanners />
        <ProductRow
          title="New Arrivals"
          subtitle="Fresh finds, just for you"
          apiParams="sortBy=newest&limit=12"
        />
        <div className="border-t border-neutral-100" />
        <ProductRow
          title="Top Rated"
          subtitle="Highest rated products across all categories"
          apiParams="sortBy=rating&limit=12"
        />
        <RecentlyViewedSection />
      </div>
      <Testimonials />
      <NewsletterSection />
      <BrandLogos />
    </>
  );
}