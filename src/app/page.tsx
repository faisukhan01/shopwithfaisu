'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationStore, useCartStore, useSettingsStore, useAuthStore } from '@/lib/stores';
import Header from '@/components/store/Header';
import CartDrawer from '@/components/store/CartDrawer';
import CheckoutForm from '@/components/store/CheckoutForm';
import CheckoutSuccess from '@/components/store/CheckoutSuccess';
import OrderHistory from '@/components/store/OrderHistory';
import WishlistView from '@/components/store/WishlistView';
import AuthModal from '@/components/store/AuthModal';
import Footer from '@/components/store/Footer';
import MegaHomePage from '@/components/store/MegaHomePage';
import ProductGrid from '@/components/store/ProductGrid';
import ProductDetail from '@/components/store/ProductDetail';
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

export default function Home() {
  const { storeView, isAdminMode, adminView } = useNavigationStore();
  const { settings, loadSettings } = useSettingsStore();
  const { user, setUser, isAuthenticated } = useAuthStore();
  const { setCartOpen } = useCartStore();

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => { if (data && typeof data === 'object') loadSettings(data); })
      .catch(() => {});
  }, [loadSettings]);

  useEffect(() => {
    if (isAuthenticated && user) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      try {
        const data = JSON.parse(atob(token));
        if (data.userId && data.email) {
          setUser({ id: data.userId, email: data.email, name: data.name || data.email.split('@')[0], role: data.role || 'customer', avatar: data.avatar || null });
        }
      } catch { localStorage.removeItem('authToken'); }
    }
  }, [isAuthenticated, user, setUser]);

  useEffect(() => { if (storeView === 'cart') setCartOpen(true); }, [storeView, setCartOpen]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [storeView, adminView]);

  // Admin panel
  if (isAdminMode) {
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
    return <AdminLayout>{renderAdminView()}</AdminLayout>;
  }

  // Store front
  const isAuthModal = storeView === 'login' || storeView === 'register';

  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  // Auth modal renders on top of home; other views replace content
  const contentView = isAuthModal ? <MegaHomePage /> : (() => {
    switch (storeView) {
      case 'home': return <MegaHomePage />;
      case 'shop': return <ProductGrid />;
      case 'product': return <ProductDetail />;
      case 'cart': setCartOpen(true); return <ProductGrid />;
      case 'checkout': return <CheckoutForm />;
      case 'checkout-success': return <CheckoutSuccess />;
      case 'orders': return <OrderHistory />;
      case 'wishlist': return <WishlistView />;
      default: return <MegaHomePage />;
    }
  })();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={storeView}
            variants={isAuthModal ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } } : pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {contentView}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />

      {/* Auth modal overlay */}
      <AuthModal />
    </div>
  );
}