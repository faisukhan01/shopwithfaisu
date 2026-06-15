'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  ShoppingCart,
  Users,
  Ticket,
  Star,
  Settings,
  Store,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useNavigationStore } from '@/lib/stores';
import { useAuthStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { AdminView } from '@/lib/types';

const navItems: { label: string; icon: React.ElementType; view: AdminView }[] = [
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
  { label: 'Products', icon: Package, view: 'products' },
  { label: 'Categories', icon: Grid3X3, view: 'categories' },
  { label: 'Orders', icon: ShoppingCart, view: 'orders' },
  { label: 'Customers', icon: Users, view: 'customers' },
  { label: 'Coupons', icon: Ticket, view: 'coupons' },
  { label: 'Reviews', icon: Star, view: 'reviews' },
  { label: 'Settings', icon: Settings, view: 'settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminView, setAdminView, setAdminMode, setAdminView: setView } = useNavigationStore();
  const user = useAuthStore((s) => s.user);

  const handleNavClick = (view: AdminView) => {
    setAdminView(view);
    setSidebarOpen(false);
  };

  const handleBackToStore = () => {
    setAdminMode(false);
  };

  const handleViewStore = () => {
    setAdminMode(false);
  };

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-zinc-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <span className="text-white text-sm font-bold">SF</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Shop with Faisu</h2>
              <p className="text-[11px] text-zinc-500">Admin Panel</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = adminView === item.view || 
                (item.view === 'products' && adminView === 'product-form') ||
                (item.view === 'orders' && adminView === 'order-detail');
              const Icon = item.icon;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-60" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-zinc-100">
          <button
            onClick={handleBackToStore}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <Store className="h-4.5 w-4.5" />
            <span>Back to Store</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200">
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-zinc-900">Admin Panel</h1>
                <span className="hidden sm:inline text-xs text-zinc-400 font-medium bg-zinc-100 px-2 py-0.5 rounded-full capitalize">
                  {adminView.replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 text-xs"
                onClick={handleViewStore}
              >
                <Store className="h-3.5 w-3.5" />
                View Store
              </Button>
              <Separator orientation="vertical" className="hidden sm:block h-6" />
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-zinc-900 text-white text-xs font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-zinc-900 leading-tight">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-[11px] text-zinc-500">{user?.email || 'admin@store.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}