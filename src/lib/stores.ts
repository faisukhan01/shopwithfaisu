import { create } from 'zustand';
import type { StoreView, AdminView, CartItemWithProduct, StoreSettings, DEFAULT_SETTINGS } from './types';

// Navigation Store
interface NavigationStore {
  storeView: StoreView;
  adminView: AdminView;
  isAdminMode: boolean;
  selectedProductId: string | null;
  selectedCategoryId: string | null;
  selectedOrderNumber: string | null;
  selectedPageSlug: string | null;
  searchQuery: string;
  setStoreView: (view: StoreView) => void;
  setAdminView: (view: AdminView) => void;
  setAdminMode: (mode: boolean) => void;
  setSelectedProductId: (id: string | null) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSelectedOrderNumber: (num: string | null) => void;
  setSelectedPageSlug: (slug: string | null) => void;
  setSearchQuery: (q: string) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  storeView: 'home',
  adminView: 'dashboard',
  isAdminMode: false,
  selectedProductId: null,
  selectedCategoryId: null,
  selectedOrderNumber: null,
  selectedPageSlug: null,
  searchQuery: '',
  setStoreView: (view) => set({ storeView: view }),
  setAdminView: (view) => set({ adminView: view }),
  setAdminMode: (mode) => set({ isAdminMode: mode }),
  setSelectedProductId: (id) => set({ selectedProductId: id }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedOrderNumber: (num) => set({ selectedOrderNumber: num }),
  setSelectedPageSlug: (slug) => set({ selectedPageSlug: slug }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));

// Cart Store
interface CartStoreState {
  items: CartItemWithProduct[];
  isOpen: boolean;
  sessionId: string | null;
  setItems: (items: CartItemWithProduct[]) => void;
  addItem: (item: CartItemWithProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  setSessionId: (id: string) => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStoreState>((set, get) => ({
  items: [],
  isOpen: false,
  sessionId: typeof window !== 'undefined' ? localStorage.getItem('cartSessionId') || null : null,
  setItems: (items) => set({ items }),
  addItem: (item) => {
    const { items } = get();
    const existing = items.find((i) => i.productId === item.productId);
    if (existing) {
      set({
        items: items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
    } else {
      set({ items: [...items, item] });
    }
    set({ isOpen: true });
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    });
  },
  clearCart: () => set({ items: [] }),
  toggleCart: () => set({ isOpen: !get().isOpen }),
  setCartOpen: (open) => set({ isOpen: open }),
  setSessionId: (id) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartSessionId', id);
    }
    set({ sessionId: id });
  },
  getSubtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));

// Settings Store
interface SettingsStore {
  settings: typeof DEFAULT_SETTINGS;
  setSettings: (settings: Partial<typeof DEFAULT_SETTINGS>) => void;
  loadSettings: (settings: Record<string, string>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    storeName: 'Shop with Faisu!!',
    storeTagline: 'Where Style Meets Simplicity',
    storeDescription: 'Discover curated collections of premium products at Shop with Faisu!!. Clean design, fair prices, exceptional quality.',
    storeLogo: '',
    storeFavicon: '',
    primaryColor: '#1a1a1a',
    accentColor: '#e8a838',
    currency: 'USD',
    currencySymbol: '$',
    freeShippingThreshold: 75,
    taxRate: 0,
    contactEmail: 'hello@shopwithfaisu.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Faisu Avenue, New York, NY 10001',
    socialFacebook: '',
    socialInstagram: '',
    socialTwitter: '',
    socialYoutube: '',
    heroTitle: 'Curated for the Modern You',
    heroSubtitle: 'Premium products, thoughtfully selected. Free shipping on orders over $75.',
    heroCta: 'Shop Now',
    heroImage: '',
    footerText: 'Shop with Faisu!! — Where every purchase feels special.',
    copyrightText: '© 2025 Shop with Faisu!!. All rights reserved.',
    domainName: 'shopwithfaisu.com',
    metaTitle: 'Shop with Faisu!! | Premium Products, Beautifully Presented',
    metaDescription: 'Discover curated collections of premium products. Clean design, fair prices, exceptional quality.',
  },
  setSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),
  loadSettings: (rawSettings) => {
    const defaults = {
      storeName: 'Shop with Faisu!!',
      storeTagline: 'Where Style Meets Simplicity',
      storeDescription: 'Discover curated collections of premium products at Shop with Faisu!!. Clean design, fair prices, exceptional quality.',
      storeLogo: '',
      storeFavicon: '',
      primaryColor: '#1a1a1a',
      accentColor: '#e8a838',
      currency: 'USD',
      currencySymbol: '$',
      freeShippingThreshold: 75,
      taxRate: 0,
      contactEmail: 'hello@shopwithfaisu.com',
      contactPhone: '+1 (555) 123-4567',
      address: '123 Faisu Avenue, New York, NY 10001',
      socialFacebook: '',
      socialInstagram: '',
      socialTwitter: '',
      socialYoutube: '',
      heroTitle: 'Curated for the Modern You',
      heroSubtitle: 'Premium products, thoughtfully selected. Free shipping on orders over $75.',
      heroCta: 'Shop Now',
      heroImage: '',
      footerText: 'Shop with Faisu!! — Where every purchase feels special.',
      copyrightText: '© 2025 Shop with Faisu!!. All rights reserved.',
      domainName: 'shopwithfaisu.com',
      metaTitle: 'Shop with Faisu!! | Premium Products, Beautifully Presented',
      metaDescription: 'Discover curated collections of premium products. Clean design, fair prices, exceptional quality.',
    };
    const parsed = { ...defaults };
    for (const [key, value] of Object.entries(rawSettings)) {
      if (key in parsed) {
        const k = key as keyof typeof parsed;
        const v = value as string;
        if (['freeShippingThreshold', 'taxRate'].includes(key)) {
          (parsed as Record<string, unknown>)[key] = parseFloat(v) || 0;
        } else {
          (parsed as Record<string, unknown>)[key] = v;
        }
      }
    }
    set({ settings: parsed as SettingsStore['settings'] });
  },
}));

// Wishlist Store
interface WishlistStore {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wishlist') || '[]') : [],
  addItem: (productId) => {
    const { items } = get();
    if (!items.includes(productId)) {
      const newItems = [...items, productId];
      localStorage.setItem('wishlist', JSON.stringify(newItems));
      set({ items: newItems });
    }
  },
  removeItem: (productId) => {
    const newItems = get().items.filter((id) => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(newItems));
    set({ items: newItems });
  },
  toggleItem: (productId) => {
    if (get().items.includes(productId)) get().removeItem(productId);
    else get().addItem(productId);
  },
  isWishlisted: (productId) => get().items.includes(productId),
}));

// Auth Store
interface AuthStore {
  user: { id: string; email: string; name: string; role: string; avatar?: string | null } | null;
  isAuthenticated: boolean;
  setUser: (user: AuthStore['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    set({ user: null, isAuthenticated: false });
  },
}));