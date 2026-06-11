'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/lib/stores';
import type { ProductWithCategory, CategoryWithCount } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ featured = false }: { featured?: boolean }) {
  const {
    storeView,
    selectedCategoryId,
    searchQuery,
    setSelectedCategoryId,
    setSearchQuery,
  } = useNavigationStore();

  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const fetchProducts = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (featured) {
          params.set('featured', 'true');
        }
        if (selectedCategoryId) params.set('categoryId', selectedCategoryId);
        if (searchQuery) params.set('search', searchQuery);
        if (sortBy) params.set('sortBy', sortBy);
        params.set('page', String(pageNum));
        params.set('limit', String(pageSize));

        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();

        if (append) {
          setProducts((prev) => [...prev, ...data.products]);
        } else {
          setProducts(data.products || []);
        }
        setTotalCount(data.total || 0);
        setHasMore(data.products?.length === pageSize);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [featured, selectedCategoryId, searchQuery, sortBy]
  );

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [fetchProducts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setPage(1);
  };

  const clearCategory = () => {
    setSelectedCategoryId(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setLocalSearch('');
  };

  const selectedCategoryName = categories.find(
    (c) => c.id === selectedCategoryId
  )?.name;

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        {!featured && (
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
              {selectedCategoryId
                ? selectedCategoryName || 'Shop'
                : searchQuery
                  ? 'Search Results'
                  : 'All Products'}
            </h1>
            {searchQuery && (
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-neutral-500">
                  Results for: <span className="font-medium text-neutral-700">&ldquo;{searchQuery}&rdquo;</span>
                </p>
                <button
                  onClick={clearSearch}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
            {selectedCategoryId && (
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-neutral-200 transition-colors"
                  onClick={clearCategory}
                >
                  {selectedCategoryName}
                  <X className="size-3 ml-1.5" />
                </Badge>
              </div>
            )}
            <p className="text-sm text-neutral-400 mt-1">
              {totalCount} product{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Featured heading for home */}
        {featured && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
                Featured Products
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Hand-picked favorites, just for you
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCategoryId(null);
                setSearchQuery('');
                setStoreView('shop');
              }}
              className="text-sm font-medium text-neutral-500 hover:text-neutral-900 hidden sm:flex"
            >
              View All
            </Button>
          </div>
        )}

        {/* Filters bar - only in shop view */}
        {!featured && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8 pb-6 border-b border-neutral-100">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs">
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search products..."
                className="h-10 text-sm border-neutral-200 pr-8"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </form>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-neutral-400" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-10 text-sm border-neutral-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: featured ? 4 : 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl bg-neutral-100" />
                <Skeleton className="h-3 w-16 rounded bg-neutral-100" />
                <Skeleton className="h-4 w-full rounded bg-neutral-100" />
                <Skeleton className="h-3 w-24 rounded bg-neutral-100" />
                <Skeleton className="h-4 w-20 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg font-medium">No products found</p>
            <p className="text-neutral-400 text-sm mt-1">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                clearCategory();
                clearSearch();
              }}
              className="mt-4 text-sm"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && !featured && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                  className="h-10 px-8 text-sm font-medium border-neutral-200 hover:bg-neutral-50 rounded-lg"
                >
                  {loading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    <>
                      Load More
                      <ChevronDown className="ml-1.5 size-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Featured view all button mobile */}
            {featured && (
              <div className="mt-8 text-center sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSearchQuery('');
                    setStoreView('shop');
                  }}
                  className="h-10 px-6 text-sm font-medium border-neutral-200 rounded-lg"
                >
                  View All Products
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}