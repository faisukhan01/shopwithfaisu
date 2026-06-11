// Store types
export type StoreView = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'checkout-success' | 'orders' | 'login' | 'register' | 'page' | 'wishlist';
export type AdminView = 'dashboard' | 'products' | 'product-form' | 'categories' | 'orders' | 'order-detail' | 'customers' | 'settings' | 'pages' | 'coupons' | 'reviews';

export interface StoreState {
  currentView: StoreView;
  selectedProductId: string | null;
  selectedCategoryId: string | null;
  selectedOrderNumber: string | null;
  selectedPageSlug: string | null;
  searchQuery: string;
  isStoreMode: boolean;
  isAdminMode: boolean;
}

export interface CartStore {
  items: CartItemWithProduct[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
}

export interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice?: number | null;
    images: string;
    stock: number;
  };
}

export interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDesc: string | null;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  images: string;
  categoryId: string;
  stock: number;
  sku: string | null;
  weight: number | null;
  dimensions: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  attributes: string | null;
  rating: number;
  reviewCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: {
    products: number;
  };
}

export interface OrderWithItems {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  couponCode: string | null;
  shippingAddress: string | null;
  billingAddress: string | null;
  paymentMethod: string | null;
  paymentStatus: string;
  notes: string | null;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    productImage: string | null;
    price: number;
    quantity: number;
  }[];
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeDescription: string;
  storeLogo: string;
  storeFavicon: string;
  primaryColor: string;
  accentColor: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  taxRate: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialYoutube: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroImage: string;
  footerText: string;
  copyrightText: string;
  domainName: string;
  metaTitle: string;
  metaDescription: string;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: string;
}

export const DEFAULT_SETTINGS: StoreSettings = {
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