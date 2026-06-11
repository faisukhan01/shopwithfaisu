'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore, useNavigationStore } from '@/lib/stores';

export default function HeroSection() {
  const { settings } = useSettingsStore();
  const { setStoreView } = useNavigationStore();

  const heroImage = settings.heroImage || '/banners/hero.png';

  return (
    <section className="relative w-full overflow-hidden bg-neutral-950">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] py-16 sm:py-20 lg:py-24">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-amber-400 text-sm font-medium tracking-widest uppercase mb-4"
            >
              {settings.storeTagline}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight"
            >
              {settings.heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-md"
            >
              {settings.heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-8"
            >
              <Button
                onClick={() => setStoreView('shop')}
                size="lg"
                className="h-12 px-8 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-amber-600/25"
              >
                {settings.heroCta || 'Shop Now'}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}