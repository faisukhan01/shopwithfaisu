'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useAuthStore, useNavigationStore } from '@/lib/stores';

export default function AuthModal() {
  const { storeView, setStoreView } = useNavigationStore();
  const { setUser } = useAuthStore();

  const isLogin = storeView === 'login';
  const isOpen = isLogin || storeView === 'register';

  const [mode, setMode] = useState<'login' | 'register'>(isLogin ? 'login' : 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const close = () => {
    setStoreView('home');
    setName('');
    setEmail('');
    setError('');
  };

  // Sync mode with storeView changes
  useEffect(() => {
    setMode(storeView === 'login' ? 'login' : 'register');
    setName('');
    setEmail('');
    setError('');
  }, [storeView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) return;

    setLoading(true);

    try {
      const body: Record<string, string> = { email: email.trim() };
      if (mode === 'register') body.name = name.trim();

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token);
        }
        close();
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    setStoreView(newMode === 'login' ? 'login' : 'register');
    setName('');
    setEmail('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[380px] bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold accent line */}
              <div className="h-0.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

              {/* Close button */}
              <button
                onClick={close}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors z-10"
              >
                <X className="size-3.5" />
              </button>

              <div className="px-8 pt-8 pb-8 sm:px-10">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <img
                    src="/logo.svg"
                    alt=""
                    className="h-10 w-10 opacity-80"
                  />
                </div>

                {/* Heading */}
                <div className="text-center mb-7">
                  <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-[13px] text-neutral-400 mt-1.5 leading-relaxed">
                    {mode === 'login'
                      ? 'Enter your email to continue shopping'
                      : 'Join us for a premium shopping experience'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <AnimatePresence mode="wait">
                    {mode === 'register' && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <input
                          type="text"
                          placeholder="Full name"
                          value={name}
                          onChange={(e) => { setName(e.target.value); setError(''); }}
                          disabled={loading}
                          autoFocus={mode === 'register'}
                          className="w-full h-11 px-4 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                    disabled={loading}
                    autoFocus={mode === 'login'}
                    className="w-full h-11 px-4 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all"
                  />

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs text-rose-500 text-center -mt-0.5"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading || !email.trim() || (mode === 'register' && !name.trim())}
                    className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-all active:scale-[0.98] disabled:opacity-30 mt-1"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin mx-auto" />
                    ) : (
                      mode === 'login' ? 'Continue' : 'Create Account'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-100" />
                  </div>
                </div>

                {/* Switch mode */}
                <p className="text-center text-[13px] text-neutral-400">
                  {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-neutral-900 font-semibold hover:text-amber-700 transition-colors"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}