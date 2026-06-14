'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Mail, User, ArrowRight } from 'lucide-react';
import { useAuthStore, useNavigationStore, useSettingsStore } from '@/lib/stores';

export default function AuthModal() {
  const { storeView, setStoreView } = useNavigationStore();
  const { setUser } = useAuthStore();
  const { settings } = useSettingsStore();

  const isLogin = storeView === 'login';
  const isOpen = isLogin || storeView === 'register';

  const [mode, setMode] = useState<'login' | 'register'>(isLogin ? 'login' : 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const close = () => {
    setStoreView('home');
    setName('');
    setEmail('');
    setError('');
  };

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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={close}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[400px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Outer glow */}
              <div className="absolute -inset-[1px] bg-gradient-to-b from-amber-600/40 via-amber-500/10 to-transparent rounded-[22px] pointer-events-none" />

              {/* Card */}
              <div className="relative bg-[#1a1a1a] rounded-[20px] shadow-2xl shadow-black/40">
                {/* Close button */}
                <button
                  onClick={close}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-all duration-200 z-10"
                >
                  <X className="size-3.5" />
                </button>

                <div className="px-8 pt-10 pb-8 sm:px-10">
                  {/* Logo */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex justify-center mb-5"
                  >
                    <div className="relative">
                      <div className="absolute -inset-2 bg-amber-500/10 rounded-full blur-lg" />
                      <img
                        src={settings.storeLogo || '/logo.svg'}
                        alt="Logo"
                        className="relative h-12 w-12 brightness-0 invert opacity-90"
                      />
                    </div>
                  </motion.div>

                  {/* Heading */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-xl font-semibold text-white tracking-tight">
                      {mode === 'login' ? 'Welcome Back' : 'Join Us'}
                    </h2>
                    <p className="text-[13px] text-white/35 mt-2 leading-relaxed">
                      {mode === 'login'
                        ? 'Sign in to continue your shopping experience'
                        : 'Create an account for a personalized experience'}
                    </p>
                  </motion.div>

                  {/* Form */}
                  <motion.form
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    onSubmit={handleSubmit}
                    className="space-y-3"
                  >
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
                          <div className={`relative group transition-all duration-200 ${focusedField === 'name' ? 'scale-[1.01]' : ''}`}>
                            <User className={`absolute left-4 top-1/2 -translate-y-1/2 size-4 transition-colors duration-200 ${focusedField === 'name' ? 'text-amber-500' : 'text-white/20'}`} />
                            <input
                              type="text"
                              placeholder="Full name"
                              value={name}
                              onChange={(e) => { setName(e.target.value); setError(''); }}
                              onFocus={() => setFocusedField('name')}
                              onBlur={() => setFocusedField(null)}
                              disabled={loading}
                              autoFocus={mode === 'register'}
                              className="w-full h-12 pl-11 pr-4 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.06] transition-all duration-200"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className={`relative group transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 size-4 transition-colors duration-200 ${focusedField === 'email' ? 'text-amber-500' : 'text-white/20'}`} />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        disabled={loading}
                        autoFocus={mode === 'login'}
                        className="w-full h-12 pl-11 pr-4 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.06] transition-all duration-200"
                      />
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-rose-400 text-center pt-1"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={loading || !email.trim() || (mode === 'register' && !name.trim())}
                      className="w-full h-12 mt-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-semibold rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
                    >
                      {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          {mode === 'login' ? 'Continue' : 'Create Account'}
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                  </motion.form>

                  {/* Divider with text */}
                  <div className="relative my-7">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.06]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#1a1a1a] px-4 text-[11px] text-white/20 uppercase tracking-widest">
                        or
                      </span>
                    </div>
                  </div>

                  {/* Switch mode */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-center text-[13px] text-white/30"
                  >
                    {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="text-amber-400/90 font-medium hover:text-amber-400 transition-colors duration-200"
                    >
                      {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}