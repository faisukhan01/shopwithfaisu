'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Instagram, Twitter, Facebook, Youtube, ShieldCheck, Truck, RotateCcw, CreditCard, Lock, MapPin, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore, useSettingsStore } from '@/lib/stores';

export default function Footer() {
  const { setStoreView, setSelectedCategoryId } = useNavigationStore();
  const { settings } = useSettingsStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => { if (Array.isArray(d)) setCategories(d); }).catch(() => {});
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 3000); }
  };

  const handleCategoryNav = (id: string) => {
    setSelectedCategoryId(id);
    setStoreView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300 mt-auto">
      {/* Main footer content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand - spans 4 cols on large */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {settings.storeName}
            </h3>
            <p className="text-sm text-neutral-500 mt-3 leading-relaxed max-w-xs">
              {settings.footerText}
            </p>

            {/* Contact info */}
            <div className="mt-5 space-y-2.5">
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                <Mail className="size-4 flex-shrink-0" /> {settings.contactEmail}
              </a>
              <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                <Phone className="size-4 flex-shrink-0" /> {settings.contactPhone}
              </a>
              <div className="flex items-start gap-2.5 text-sm text-neutral-500">
                <MapPin className="size-4 flex-shrink-0 mt-0.5" /> {settings.address}
              </div>
            </div>
          </div>

          {/* Shop - spans 2 cols */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">Shop</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => { setSelectedCategoryId(null); setStoreView('shop'); window.scrollTo({ top: 0 }); }} className="text-sm text-neutral-500 hover:text-white transition-colors">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategoryId(null); setStoreView('shop'); window.scrollTo({ top: 0 }); }} className="text-sm text-neutral-500 hover:text-white transition-colors">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategoryId(null); setStoreView('shop'); window.scrollTo({ top: 0 }); }} className="text-sm text-neutral-500 hover:text-white transition-colors">
                  Best Sellers
                </button>
              </li>
              <li>
                <button onClick={() => { setSelectedCategoryId(null); setStoreView('shop'); window.scrollTo({ top: 0 }); }} className="text-sm text-neutral-500 hover:text-white transition-colors">
                  Sale
                </button>
              </li>
            </ul>
          </div>

          {/* Categories - spans 2 cols */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button onClick={() => handleCategoryNav(cat.id)} className="text-sm text-neutral-500 hover:text-white transition-colors">
                    {cat.name}
                  </button>
                </li>
              ))}
              {categories.length > 6 && (
                <li>
                  <button onClick={() => { setSelectedCategoryId(null); setStoreView('shop'); window.scrollTo({ top: 0 }); }} className="text-sm text-neutral-500 hover:text-white transition-colors">
                    All Categories →
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Customer Service - spans 2 cols */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">Help</h4>
            <ul className="space-y-2.5">
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="text-sm text-neutral-500 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <button onClick={() => setStoreView('orders')} className="text-sm text-neutral-500 hover:text-white transition-colors">
                  Order Tracking
                </button>
              </li>
              <li>
                <span className="text-sm text-neutral-500">Shipping & Returns</span>
              </li>
              <li>
                <span className="text-sm text-neutral-500">FAQ</span>
              </li>
              <li>
                <span className="text-sm text-neutral-500">Size Guide</span>
              </li>
            </ul>
          </div>

          {/* Newsletter - spans 2 cols */}
          <div className="col-span-2 lg:col-span-2">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">Stay Updated</h4>
            <p className="text-sm text-neutral-500 mb-4">
              Get notified about new products and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="h-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600 text-sm focus-visible:ring-amber-500/20 focus-visible:border-amber-500"
                required
              />
              <Button
                type="submit"
                className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg"
              >
                Subscribe <Send className="ml-2 size-3.5" />
              </Button>
            </form>
            {subscribed && (
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-emerald-400 mt-2">
                Subscribed successfully!
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Trust features */}
      <Separator className="bg-neutral-800" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: Truck, label: 'Free Shipping', desc: 'On orders over $75' },
            { icon: RotateCcw, label: '30-Day Returns', desc: 'Hassle-free refunds' },
            { icon: ShieldCheck, label: 'Secure Checkout', desc: '256-bit SSL encryption' },
            { icon: CreditCard, label: 'Flexible Payment', desc: 'All major cards accepted' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="size-5 text-neutral-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-neutral-300">{label}</p>
                <p className="text-[11px] text-neutral-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <Separator className="bg-neutral-800" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-600">{settings.copyrightText}</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-700">We accept</span>
            <div className="flex items-center gap-2">
              {['Visa', 'MC', 'Amex', 'PayPal'].map((p) => (
                <span key={p} className="px-2 py-1 bg-neutral-800 rounded text-[10px] font-medium text-neutral-400">{p}</span>
              ))}
            </div>
            <Lock className="size-3 text-neutral-700" />
          </div>
        </div>
      </div>
    </footer>
  );
}