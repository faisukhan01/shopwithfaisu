'use client';

import { useEffect, useState } from 'react';
import { useNavigationStore, useSettingsStore, useAuthStore } from '@/lib/stores';
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/components/admin/Dashboard';
import ProductManager from '@/components/admin/ProductManager';
import ProductForm from '@/components/admin/ProductForm';
import CategoryManager from '@/components/admin/CategoryManager';
import OrderManager from '@/components/admin/OrderManager';
import OrderDetail from '@/components/admin/OrderDetail';
import CustomerManager from '@/components/admin/CustomerManager';
import CouponManager from '@/components/admin/CouponManager';
import ReviewManager from '@/components/admin/ReviewManager';
import SettingsManager from '@/components/admin/SettingsManager';

export default function AdminPage() {
  const { adminView, setAdminMode } = useNavigationStore();
  const { loadSettings } = useSettingsStore();
  const { setUser, isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Enable admin mode
    setAdminMode(true);

    // Load settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => { if (data && typeof data === 'object') loadSettings(data); })
      .catch(() => {});

    // Check auth
    if (isAuthenticated && user) {
      setIsLoading(false);
      return;
    }
    
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
    
    setIsLoading(false);
  }, [setAdminMode, loadSettings, isAuthenticated, user, setUser]);

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
