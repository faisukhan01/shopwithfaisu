'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/lib/stores';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();

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
        onOpenChange(false);
        setEmail('');
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-neutral-200">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-2xl font-semibold text-neutral-900">
            Welcome back
          </DialogTitle>
          <DialogDescription className="text-neutral-500 mt-1">
            Enter your email to continue shopping
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm font-medium text-neutral-700">
              Email address
            </Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 border-neutral-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500"
              disabled={loading}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-sm text-rose-600"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg transition-colors"
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              'Continue'
            )}
          </Button>

          <p className="text-center text-xs text-neutral-400 mt-3">
            By continuing, you agree to our Terms of Service
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}