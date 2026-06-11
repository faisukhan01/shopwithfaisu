'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ChevronRight,
  Home,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  useNavigationStore,
  useCartStore,
  useSettingsStore,
  useAuthStore,
} from '@/lib/stores';
import type { ProductWithCategory } from '@/lib/types';

export default function ProductDetail() {
  const { selectedProductId, setStoreView, setSelectedCategoryId, setSelectedProductId } =
    useNavigationStore();
  const { addItem } = useCartStore();
  const { settings } = useSettingsStore();
  const { user, isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviews, setReviews] = useState<
    { id: string; userName: string; rating: number; title: string | null; comment: string; createdAt: string }[]
  >([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!selectedProductId) return;
    setLoading(true);
    setQuantity(1);
    setSelectedImage(0);
    setAddedToCart(false);

    fetch(`/api/products/${selectedProductId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`/api/products/${selectedProductId}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(() => {});
  }, [selectedProductId]);

  useEffect(() => {
    if (user) setReviewName(user.name || '');
  }, [user]);

  const images: string[] = (() => {
    try {
      return product ? JSON.parse(product.images) : [];
    } catch {
      return product ? [product.images] : [];
    }
  })();

  const discount = product?.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0;

  const attributes: Record<string, string> = (() => {
    if (!product?.attributes) return {};
    try {
      return JSON.parse(product.attributes);
    } catch {
      return {};
    }
  })();

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      quantity,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        images: product.images,
        stock: product.stock,
      },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: reviewName,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => [data, ...prev]);
        setReviewComment('');
        setReviewRating(5);
      }
    } catch {
      // silently fail
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square rounded-2xl bg-neutral-100" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 rounded bg-neutral-100" />
            <Skeleton className="h-8 w-3/4 rounded bg-neutral-100" />
            <Skeleton className="h-4 w-full rounded bg-neutral-100" />
            <Skeleton className="h-6 w-32 rounded bg-neutral-100" />
            <Skeleton className="h-10 w-full rounded-lg bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-neutral-500">Product not found.</p>
        <Button
          variant="outline"
          onClick={() => setStoreView('shop')}
          className="mt-4"
        >
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-6 overflow-x-auto">
        <button
          onClick={() => setStoreView('home')}
          className="flex items-center gap-1 hover:text-neutral-600 transition-colors whitespace-nowrap"
        >
          <Home className="size-3.5" />
          Home
        </button>
        <ChevronRight className="size-3 flex-shrink-0" />
        <button
          onClick={() => {
            setSelectedCategoryId(product.category.id);
            setStoreView('shop');
          }}
          className="hover:text-neutral-600 transition-colors whitespace-nowrap"
        >
          {product.category.name}
        </button>
        <ChevronRight className="size-3 flex-shrink-0" />
        <span className="text-neutral-600 font-medium truncate">
          {product.name}
        </span>
      </nav>

      {/* Back button */}
      <button
        onClick={() => {
          setSelectedProductId(null);
          setStoreView('shop');
        }}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Shop
      </button>

      {/* Product Layout */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100">
            <img
              src={images[selectedImage] || '/products/blanket.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-rose-500 text-white border-0 text-xs font-semibold px-2.5 py-1 rounded-md">
                -{discount}% OFF
              </Badge>
            )}
            {product.isNew && (
              <Badge className="absolute top-4 right-4 bg-neutral-900 text-white border-0 text-xs font-semibold px-2.5 py-1 rounded-md">
                New
              </Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === i
                      ? 'border-neutral-900'
                      : 'border-transparent hover:border-neutral-300'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col"
        >
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-2">
            {product.category.name}
          </p>

          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${
                    i < Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-neutral-200 text-neutral-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-neutral-500">
              {product.rating.toFixed(1)} ({product.reviewCount} review
              {product.reviewCount !== 1 ? 's' : ''})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-5">
            <span className="text-2xl sm:text-3xl font-bold text-neutral-900">
              {settings.currencySymbol}
              {product.price.toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-neutral-400 line-through">
                {settings.currencySymbol}
                {product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          {product.shortDesc && (
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
              {product.shortDesc}
            </p>
          )}

          <Separator className="my-6" />

          {/* Attributes */}
          {Object.keys(attributes).length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(attributes).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-neutral-50 rounded-lg px-4 py-3 border border-neutral-100"
                >
                  <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm font-medium text-neutral-800 mt-0.5">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-neutral-700">
              Quantity
            </span>
            <div className="flex items-center border border-neutral-200 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-10 w-10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <Minus className="size-4" />
              </button>
              <span className="h-10 w-12 flex items-center justify-center text-sm font-medium text-neutral-900 border-x border-neutral-200">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                className="h-10 w-10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <span className="text-xs text-neutral-400">
              {product.stock > 0
                ? `${product.stock} in stock`
                : 'Out of stock'}
            </span>
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full h-12 text-sm font-semibold rounded-lg transition-all ${
              addedToCart
                ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white hover:shadow-lg hover:shadow-neutral-900/20'
            }`}
          >
            {addedToCart ? (
              <>
                <Check className="size-4 mr-2" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="size-4 mr-2" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </>
            )}
          </Button>

          {/* Free shipping notice */}
          <div className="flex items-center gap-2 mt-4 text-xs text-neutral-500">
            <Truck className="size-4 text-amber-600" />
            Free shipping on orders over {settings.currencySymbol}
            {settings.freeShippingThreshold}
          </div>

          {/* Description */}
          {product.description && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                  Description
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </>
          )}

          {/* Reviews section */}
          <Separator className="my-6" />
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">
              Customer Reviews ({reviews.length})
            </h3>

            {/* Review list */}
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-neutral-100 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-800">
                        {review.userName || 'Anonymous'}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3 ${
                              i < review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-neutral-200 text-neutral-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <p className="text-sm font-medium text-neutral-700">
                      {review.title}
                    </p>
                  )}
                  <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>

            {/* Submit review */}
            <form
              onSubmit={handleSubmitReview}
              className="bg-neutral-50 rounded-xl p-5 border border-neutral-100 space-y-4"
            >
              <h4 className="text-sm font-medium text-neutral-800">
                Write a Review
              </h4>
              <div className="flex items-center gap-1">
                <span className="text-xs text-neutral-500 mr-2">Rating:</span>
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-5 ${
                        i < reviewRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-neutral-200 text-neutral-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <Input
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder="Your name"
                className="h-10 text-sm border-neutral-200"
                required
              />
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="text-sm border-neutral-200 min-h-[80px] resize-none"
                required
              />
              <Button
                type="submit"
                disabled={submittingReview || !reviewComment.trim()}
                className="h-10 px-6 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}