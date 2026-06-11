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
  Heart,
  ChevronDown,
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
import { useNavigationStore, useCartStore, useSettingsStore, useAuthStore, useWishlistStore } from '@/lib/stores';
import LoginModal from './LoginModal';

const NAV_LINKS = [
  { label: 'Home', view: 'home' as const },
  { label: 'Shop', view: 'shop' as const },
];

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
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; _count: { products: number } }[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const catTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const totalItems = getTotalItems();

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => { if (Array.isArray(d)) setCategories(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
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

  const handleCategoryClick = (id: string) => {
    setSelectedCategoryId(id);
    setStoreView('shop');
    setCatDropdownOpen(false);
  };

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-neutral-900 text-center py-2 px-4">
        <p className="text-xs text-neutral-300">
          Free shipping on orders over {settings.currencySymbol}{settings.freeShippingThreshold} &nbsp;·&nbsp; Use code <span className="font-semibold text-amber-400">WELCOME10</span> for 10% off your first order
        </p>
      </div>

      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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
                    <SheetTitle className="text-lg font-semibold text-neutral-900">{settings.storeName}</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 mt-4 px-2">
                    {NAV_LINKS.map((link) => (
                      <button
                        key={link.view}
                        onClick={() => handleNavClick(link.view)}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${storeView === link.view ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                      >
                        {link.label}
                      </button>
                    ))}
                    <div className="my-2 border-t border-neutral-100" />
                    <p className="px-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">Categories</p>
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { handleCategoryClick(cat.id); setMobileMenuOpen(false); }}
                        className="text-left px-4 py-2.5 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors flex items-center justify-between"
                      >
                        {cat.name}
                        <span className="text-xs text-neutral-400">{cat._count.products}</span>
                      </button>
                    ))}
                    {categories.length > 6 && (
                      <button
                        onClick={() => { handleNavClick('shop'); setMobileMenuOpen(false); }}
                        className="text-left px-4 py-2.5 rounded-lg text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        View All Categories
                      </button>
                    )}
                    {isAuthenticated && (
                      <>
                        <div className="my-2 border-t border-neutral-100" />
                        <button onClick={() => { setStoreView('orders'); setMobileMenuOpen(false); }} className="text-left px-4 py-3 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors flex items-center gap-3">
                          <Package className="size-4" /> My Orders
                        </button>
                        <button onClick={() => { setStoreView('wishlist'); setMobileMenuOpen(false); }} className="text-left px-4 py-3 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors flex items-center gap-3">
                          <Heart className="size-4" /> Wishlist {wishlistCount > 0 && <span className="text-xs text-amber-600">({wishlistCount})</span>}
                        </button>
                      </>
                    )}
                    <div className="my-2 border-t border-neutral-100" />
                    <button onClick={() => { setAdminMode(true); setMobileMenuOpen(false); }} className="text-left px-4 py-3 rounded-lg text-xs font-medium text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors flex items-center gap-3">
                      <Shield className="size-3.5" /> Admin Panel
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

            {/* Center: Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.view}
                  onClick={() => handleNavClick(link.view)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${storeView === link.view ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
                >
                  {link.label}
                </button>
              ))}

              {/* Categories dropdown */}
              <div
                className="relative"
                onMouseEnter={() => { clearTimeout(catTimeoutRef.current); setCatDropdownOpen(true); }}
                onMouseLeave={() => { catTimeoutRef.current = setTimeout(() => setCatDropdownOpen(false), 200); }}
              >
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors flex items-center gap-1">
                  Categories <ChevronDown className="size-3.5" />
                </button>
                <AnimatePresence>
                  {catDropdownOpen && categories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl shadow-neutral-900/10 border border-neutral-100 overflow-hidden z-50"
                    >
                      <div className="py-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors flex items-center justify-between group"
                          >
                            <span>{cat.name}</span>
                            <span className="text-xs text-neutral-400 group-hover:text-neutral-500">{cat._count.products}</span>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-neutral-100 px-4 py-2.5">
                        <button
                          onClick={() => { setSelectedCategoryId(null); setStoreView('shop'); setCatDropdownOpen(false); }}
                          className="text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors"
                        >
                          View All Categories →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
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
                      placeholder="Search 500+ products..."
                      className="h-9 text-sm border-neutral-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500"
                    />
                  </motion.form>
                )}
              </AnimatePresence>

              <Button variant="ghost" size="icon" onClick={() => { if (searchOpen) { if (searchValue.trim()) { setSearchQuery(searchValue.trim()); setStoreView('shop'); } setSearchOpen(false); } else setSearchOpen(true); }} className="text-neutral-600 hover:text-neutral-900">
                {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
                <span className="sr-only">Search</span>
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="icon" onClick={toggleCart} className="relative text-neutral-600 hover:text-neutral-900">
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
                  <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-900">
                    <User className="size-5" />
                    <span className="sr-only">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-neutral-900">{user.name || user.email}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setStoreView('orders')}>
                        <Package className="mr-2 size-4" /> My Orders
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-rose-600 focus:text-rose-600">
                        <LogOut className="mr-2 size-4" /> Sign Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => setLoginOpen(true)}>
                      <User className="mr-2 size-4" /> Sign In
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setAdminMode(true)} className="text-neutral-400 text-xs focus:text-neutral-600">
                    <Shield className="mr-2 size-3.5" /> Admin Panel
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
                    placeholder="Search 500+ products..."
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