'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore, useSettingsStore } from '@/lib/stores';

export default function Footer() {
  const { setStoreView } = useNavigationStore();
  const { settings } = useSettingsStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const socialLinks = [
    { icon: Instagram, url: settings.socialInstagram, label: 'Instagram' },
    { icon: Twitter, url: settings.socialTwitter, label: 'Twitter' },
    { icon: Facebook, url: settings.socialFacebook, label: 'Facebook' },
    { icon: Youtube, url: settings.socialYoutube, label: 'YouTube' },
  ].filter((s) => s.url);

  return (
    <footer className="bg-neutral-950 text-neutral-300 mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {settings.storeName}
            </h3>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed max-w-xs">
              {settings.footerText}
            </p>

            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mt-5">
                {socialLinks.map(({ icon: Icon, url, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
                  >
                    <Icon className="size-4 text-neutral-400" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => setStoreView('shop')}
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setStoreView('shop');
                  }}
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setStoreView('shop');
                  }}
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Best Sellers
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
              Customer Service
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <button
                  onClick={() => setStoreView('orders')}
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Order Tracking
                </button>
              </li>
              <li>
                <span className="text-sm text-neutral-500">
                  {settings.contactEmail}
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-500">
                  {settings.contactPhone}
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
              Stay Updated
            </h4>
            <p className="text-sm text-neutral-500 mb-4">
              Get notified about new products and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
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
                size="icon"
                className="h-10 w-10 flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
              >
                <Send className="size-4" />
              </Button>
            </form>
            {subscribed && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-emerald-400 mt-2"
              >
                Subscribed successfully!
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <Separator className="bg-neutral-800" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-600">{settings.copyrightText}</p>
          <p className="text-xs text-neutral-600">{settings.address}</p>
        </div>
      </div>
    </footer>
  );
}