'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore, useNavigationStore } from '@/lib/stores';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const { setStoreView } = useNavigationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token);
        }
        setStoreView('home');
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm"
      >
        {/* Back */}
        <button
          onClick={() => setStoreView('home')}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors mb-8 group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-neutral-400 mt-1.5">
              Enter your email to continue
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                disabled={loading}
                className="h-11 border-neutral-200 bg-neutral-50/50 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-900 focus-visible:border-neutral-900 focus-visible:bg-white rounded-lg transition-all text-sm"
                autoFocus
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-rose-600 text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Continue'
                )}
              </Button>
            </motion.div>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center text-xs text-neutral-400 mt-6 pt-6 border-t border-neutral-100"
          >
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setStoreView('register')}
              className="text-neutral-900 font-medium hover:underline underline-offset-2"
            >
              Sign up
            </button>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}