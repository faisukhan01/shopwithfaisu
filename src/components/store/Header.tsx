'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Shield,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore, useCartStore, useSettingsStore, useAuthStore } from '@/lib/stores';
import LoginModal from './LoginModal';

export default function Header() {
  const {
    storeView,
    setStoreView,
    setSearchQuery,
    setSelectedCategoryId,
    setAdminMode,
  } = useNavigationStore();
  const { toggleCart, getTotalItems } = useCartStore();
  const { settings } = useSettingsStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalItems = getTotalItems();

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchQuery(searchValue.trim());
      setStoreView('shop');
      setSearchOpen(false);
    }
  };

  const handleNavClick = (view: 'home' | 'shop') => {
    setStoreView(view);
    setSelectedCategoryId(null);
    setSearchQuery('');
    setSearchValue('');
    setMobileMenuOpen(false);
  };

  const navLinks: { label: string; view: 'home' | 'shop' }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Shop', view: 'shop' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile menu + Logo */}
            <div className="flex items-center gap-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="size-5 text-neutral-800" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <SheetHeader>
                    <SheetTitle className="text-lg font-semibold text-neutral-900">
                      {settings.storeName}
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 mt-4 px-2">
                    {navLinks.map((link) => (
                      <button
                        key={link.view}
                        onClick={() => handleNavClick(link.view)}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          storeView === link.view
                            ? 'bg-neutral-100 text-neutral-900'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                      >
                        {link.label}
                      </button>
                    ))}
                    {isAuthenticated && (
                      <>
                        <Separator className="my-2" />
                        <button
                          onClick={() => {
                            setStoreView('orders');
                            setMobileMenuOpen(false);
                          }}
                          className="text-left px-4 py-3 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors flex items-center gap-3"
                        >
                          <Package className="size-4" />
                          My Orders
                        </button>
                      </>
                    )}
                    <Separator className="my-2" />
                    <button
                      onClick={() => {
                        setAdminMode(true);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left px-4 py-3 rounded-lg text-xs font-medium text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors flex items-center gap-3"
                    >
                      <Shield className="size-3.5" />
                      Admin Panel
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>

              <button
                onClick={() => handleNavClick('home')}
                className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors"
              >
                {settings.storeName}
              </button>
            </div>

            {/* Center: Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => handleNavClick(link.view)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    storeView === link.view
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              {/* Desktop search */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSearch}
                    className="overflow-hidden hidden sm:block"
                  >
                    <Input
                      ref={searchInputRef}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search products..."
                      className="h-9 text-sm border-neutral-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500"
                    />
                  </motion.form>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (searchOpen) {
                    if (searchValue.trim()) {
                      setSearchQuery(searchValue.trim());
                      setStoreView('shop');
                    }
                    setSearchOpen(false);
                  } else {
                    setSearchOpen(true);
                  }
                }}
                className="text-neutral-600 hover:text-neutral-900"
              >
                {searchOpen ? (
                  <X className="size-5" />
                ) : (
                  <Search className="size-5" />
                )}
                <span className="sr-only">Search</span>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative text-neutral-600 hover:text-neutral-900"
              >
                <ShoppingBag className="size-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-[10px] font-bold bg-amber-600 text-white border-0 rounded-full">
                    {totalItems > 99 ? '99+' : totalItems}
                  </Badge>
                )}
                <span className="sr-only">Cart</span>
              </Button>

              {/* User */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-neutral-600 hover:text-neutral-900"
                  >
                    <User className="size-5" />
                    <span className="sr-only">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-neutral-900">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setStoreView('orders')}>
                        <Package className="mr-2 size-4" />
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={logout}
                        className="text-rose-600 focus:text-rose-600"
                      >
                        <LogOut className="mr-2 size-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => setLoginOpen(true)}>
                      <User className="mr-2 size-4" />
                      Sign In
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setAdminMode(true)}
                    className="text-neutral-400 text-xs focus:text-neutral-600"
                  >
                    <Shield className="mr-2 size-3.5" />
                    Admin Panel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-neutral-100 sm:hidden"
            >
              <form onSubmit={handleSearch} className="px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search products..."
                    className="pl-9 h-10 text-sm border-neutral-200"
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}