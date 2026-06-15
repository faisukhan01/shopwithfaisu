'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNavigationStore, useSettingsStore, useAuthStore } from '@/lib/stores';

// Dynamic imports to prevent SSR issues
const AdminLayout = dynamic(() => import('@/components/admin/AdminLayout'), { ssr: false });
const Dashboard = dynamic(() => import('@/components/admin/Dashboard'), { ssr: false });
const ProductManager = dynamic(() => import('@/components/admin/ProductManager'), { ssr: false });
const ProductForm = dynamic(() => import('@/components/admin/ProductForm'), { ssr: false });
const CategoryManager = dynamic(() => import('@/components/admin/CategoryManager'), { ssr: false });
const OrderManager = dynamic(() => import('@/components/admin/OrderManager'), { ssr: false });
const OrderDetail = dynamic(() => import('@/components/admin/OrderDetail'), { ssr: false });
const CustomerManager = dynamic(() => import('@/components/admin/CustomerManager'), { ssr: false });
const CouponManager = dynamic(() => import('@/components/admin/CouponManager'), { ssr: false });
const ReviewManager = dynamic(() => import('@/components/admin/ReviewManager'), { ssr: false });
const SettingsManager = dynamic(() => import('@/components/admin/SettingsManager'), { ssr: false });

export default function AdminPage() {
  const { adminView, setAdminMode } = useNavigationStore();
  const { loadSettings } = useSettingsStore();
  const { setUser, isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const initAdmin = async () => {
      try {
        // Enable admin mode
        setAdminMode(true);

        // Load settings
        try {
          const res = await fetch('/api/settings');
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data === 'object') {
              loadSettings(data);
            }
          }
        } catch (err) {
          console.error('Failed to load settings:', err);
          // Continue even if settings fail
        }

        // Check auth
        if (!isAuthenticated || !user) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
          if (token) {
            try {
              const data = JSON.parse(atob(token));
              if (data.userId && data.email) {
                setUser({ 
                  id: data.userId, 
                  email: data.email, 
                  name: data.name || data.email.split('@')[0], 
                  role: data.role || 'customer', 
                  avatar: data.avatar || null 
                });
              }
            } catch { 
              localStorage.removeItem('authToken'); 
            }
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Admin initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize admin panel');
        setIsLoading(false);
      }
    };

    initAdmin();
  }, [isMounted, setAdminMode, loadSettings, isAuthenticated, user, setUser]);

  const renderAdminView = () => {
    switch (adminView) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductManager />;
      case 'product-form': return <ProductForm />;
      case 'categories': return <CategoryManager />;
      case 'orders': return <OrderManager />;
      case 'order-detail': return <OrderDetail />;
      case 'customers': return <CustomerManager />;
      case 'coupons': return <CouponManager />;
      case 'reviews': return <ReviewManager />;
      case 'settings': return <SettingsManager />;
      default: return <Dashboard />;
    }
  };

  if (!isMounted || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md p-8">
          {error ? (
            <>
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-neutral-900 mb-2">Failed to Load Admin Panel</h1>
              <p className="text-sm text-neutral-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Reload Page
              </button>
            </>
          ) : (
            <>
              <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-neutral-600">Initializing...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-neutral-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{renderAdminView()}</AdminLayout>;
}
