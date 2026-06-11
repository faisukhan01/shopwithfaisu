'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CreditCard,
  X,
  ArrowLeft,
  Truck,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCartStore, useSettingsStore, useNavigationStore, useAuthStore } from '@/lib/stores';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  cardNumber: z.string().min(16, 'Enter a valid card number').max(19, 'Enter a valid card number'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Use MM/YY format'),
  cvv: z.string().min(3, 'Enter a valid CVV').max(4, 'Enter a valid CVV'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutForm() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { settings } = useSettingsStore();
  const { setStoreView } = useNavigationStore();
  const { user, isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponRawValue, setCouponRawValue] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      cardNumber: '',
      expiry: '',
      cvv: '',
    },
  });

  const subtotal = getSubtotal();
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : 5.99;
  const total = subtotal + shipping - (couponApplied ? couponDiscount : 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();

      if (data.valid) {
        setCouponApplied(true);
        setCouponType(data.type || 'percentage');
        setCouponRawValue(data.value || 0);
        setCouponDiscount(data.discountAmount || 0);
        setCouponError('');
      } else {
        setCouponError(data.error || 'Invalid coupon code');
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponType('percentage');
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponType('percentage');
    setCouponRawValue(0);
    setCouponError('');
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    setError('');

    try {
      const orderData = {
        email: data.email,
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          street: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
        paymentMethod: 'card',
        couponCode: couponApplied ? couponCode : null,
        userId: user?.id || null,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.images,
          price: item.product.price,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();

      if (res.ok) {
        clearCart();
        setStoreView('checkout-success');
      } else {
        setError(result.error || 'Failed to place order. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const productImage = (images: string) => {
    try {
      const parsed = JSON.parse(images);
      return parsed[0] || '/products/blanket.png';
    } catch {
      return images || '/products/blanket.png';
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500 text-lg">Your cart is empty.</p>
        <Button
          onClick={() => setStoreView('shop')}
          variant="outline"
          className="mt-4"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => setStoreView('cart')}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Cart
      </button>

      <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-8">
            {/* Contact */}
            <section>
              <h2 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs">
                  1
                </span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm text-neutral-700">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="mt-1.5 h-11 border-neutral-200"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Shipping */}
            <section>
              <h2 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs">
                  2
                </span>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm text-neutral-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className="mt-1.5 h-11 border-neutral-200"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-rose-500 mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm text-neutral-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className="mt-1.5 h-11 border-neutral-200"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-rose-500 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="phone" className="text-sm text-neutral-700">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    className="mt-1.5 h-11 border-neutral-200"
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address" className="text-sm text-neutral-700">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    {...register('address')}
                    className="mt-1.5 h-11 border-neutral-200"
                    placeholder="123 Main St, Apt 4"
                  />
                  {errors.address && (
                    <p className="text-xs text-rose-500 mt-1">{errors.address.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm text-neutral-700">
                    City
                  </Label>
                  <Input
                    id="city"
                    {...register('city')}
                    className="mt-1.5 h-11 border-neutral-200"
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="text-xs text-rose-500 mt-1">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm text-neutral-700">
                    State / Province
                  </Label>
                  <Input
                    id="state"
                    {...register('state')}
                    className="mt-1.5 h-11 border-neutral-200"
                    placeholder="NY"
                  />
                  {errors.state && (
                    <p className="text-xs text-rose-500 mt-1">{errors.state.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-sm text-neutral-700">
                    ZIP / Postal Code
                  </Label>
                  <Input
                    id="zipCode"
                    {...register('zipCode')}
                    className="mt-1.5 h-11 border-neutral-200"
                    placeholder="10001"
                  />
                  {errors.zipCode && (
                    <p className="text-xs text-rose-500 mt-1">{errors.zipCode.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="country" className="text-sm text-neutral-700">
                    Country
                  </Label>
                  <Input
                    id="country"
                    {...register('country')}
                    className="mt-1.5 h-11 border-neutral-200"
                    placeholder="US"
                  />
                  {errors.country && (
                    <p className="text-xs text-rose-500 mt-1">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Coupon Code */}
            <section>
              <h2 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs">
                  3
                </span>
                Coupon Code
              </h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Input
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Enter coupon code"
                    className="h-11 border-neutral-200 flex-1"
                    disabled={couponApplied}
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponApplied || !couponCode.trim() || couponLoading}
                    className="h-11 px-6 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg transition-colors"
                  >
                    {couponLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : couponApplied ? (
                      'Applied'
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-sm text-rose-500">{couponError}</p>
                )}
                <AnimatePresence>
                  {couponApplied && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5"
                    >
                      <span className="text-sm text-emerald-700 font-medium">
                        {couponType === 'percentage'
                          ? `${couponRawValue}% off applied`
                          : `-${settings.currencySymbol}${couponDiscount.toFixed(2)} applied`
                        }
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-emerald-500 hover:text-emerald-700 transition-colors ml-3"
                        aria-label="Remove coupon"
                      >
                        <X className="size-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            <Separator />

            {/* Payment */}
            <section>
              <h2 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs">
                  4
                </span>
                Payment
              </h2>
              <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100 space-y-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <CreditCard className="size-4 text-neutral-400" />
                  <span className="font-medium">Credit / Debit Card</span>
                </div>
                <div>
                  <Label htmlFor="cardNumber" className="text-sm text-neutral-700">
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    {...register('cardNumber')}
                    className="mt-1.5 h-11 border-neutral-200"
                    placeholder="4242 4242 4242 4242"
                  />
                  {errors.cardNumber && (
                    <p className="text-xs text-rose-500 mt-1">{errors.cardNumber.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry" className="text-sm text-neutral-700">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry"
                      {...register('expiry')}
                      className="mt-1.5 h-11 border-neutral-200"
                      placeholder="MM/YY"
                    />
                    {errors.expiry && (
                      <p className="text-xs text-rose-500 mt-1">{errors.expiry.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-sm text-neutral-700">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      {...register('cvv')}
                      className="mt-1.5 h-11 border-neutral-200"
                      placeholder="123"
                    />
                    {errors.cvv && (
                      <p className="text-xs text-rose-500 mt-1">{errors.cvv.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-900 mb-5">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-5 pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-neutral-100 flex-shrink-0">
                      <img
                        src={productImage(item.product.images)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-neutral-900 flex-shrink-0">
                      {settings.currencySymbol}
                      {(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="text-neutral-800 font-medium">
                    {settings.currencySymbol}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Shipping</span>
                  <span
                    className={
                      shipping === 0
                        ? 'text-emerald-600 font-medium'
                        : 'text-neutral-800 font-medium'
                    }
                  >
                    {shipping === 0
                      ? 'Free'
                      : `${settings.currencySymbol}${shipping.toFixed(2)}`}
                  </span>
                </div>
                {couponApplied && couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Discount</span>
                    <span className="text-emerald-600 font-medium">
                      -{settings.currencySymbol}
                      {couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-neutral-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-neutral-900">
                    {settings.currencySymbol}
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Place order */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-6 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-neutral-900/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order • ${settings.currencySymbol}${total.toFixed(2)}`
                )}
              </Button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Shield className="size-3" />
                  Secure
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="size-3" />
                  {shipping === 0 ? 'Free Shipping' : 'Fast Shipping'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}