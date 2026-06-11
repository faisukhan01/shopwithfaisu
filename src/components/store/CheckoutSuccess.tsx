'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/lib/stores';

export default function CheckoutSuccess() {
  const { setStoreView } = useNavigationStore();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-6"
        >
          <CheckCircle2 className="size-20 text-emerald-500 mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-neutral-500 mt-3 leading-relaxed">
            Thank you for your purchase. You&apos;ll receive a confirmation email
            with your order details and tracking information.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            onClick={() => setStoreView('shop')}
            className="h-11 px-8 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg transition-all"
          >
            Continue Shopping
            <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setStoreView('orders')}
            className="h-11 px-8 border-neutral-200 text-sm font-medium rounded-lg"
          >
            View Orders
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}