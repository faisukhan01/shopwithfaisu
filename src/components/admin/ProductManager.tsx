'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Star,
  ImageOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigationStore } from '@/lib/stores';
import type { ProductWithCategory } from '@/lib/types';

interface CategoryOption {
  id: string;
  name: string;
}

export default function ProductManager() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<ProductWithCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { setAdminView, setSelectedProductId } = useNavigationStore();

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products');
      const json = await res.json();
      setProducts(Array.isArray(json) ? json : json.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetch('/api/categories')
      .then((r) => r.json())
      .then((json) => setCategories(Array.isArray(json) ? json : []))
      .catch(() => {});
  }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleToggleActive = async (product: ProductWithCategory) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      );
      toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update product');
    }
  };

  const handleToggleFeatured = async (product: ProductWithCategory) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !product.isFeatured }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p))
      );
      toast.success(`Product ${!product.isFeatured ? 'marked as featured' : 'unfeatured'}`);
    } catch {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleEdit = (product: ProductWithCategory) => {
    setSelectedProductId(product.id);
    setAdminView('product-form');
  };

  const handleAddProduct = () => {
    setSelectedProductId(null);
    setAdminView('product-form');
  };

  const getFirstImage = (images: string): string => {
    try {
      const arr = JSON.parse(images);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : '';
    } catch {
      return images || '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Products</h2>
          <p className="text-sm text-zinc-500 mt-1">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleAddProduct} className="bg-zinc-900 hover:bg-zinc-800 text-white">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <Card className="border-zinc-200/60">
          <CardContent className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200/60">
          <Search className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-500">No products found</p>
          <p className="text-xs text-zinc-400 mt-1">
            Try adjusting your search or add a new product
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-100 hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-zinc-500">Product</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-right">Price</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-right hidden sm:table-cell">Stock</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-center">Status</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-center hidden lg:table-cell">Featured</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-center hidden lg:table-cell">New</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => {
                  const img = getFirstImage(product.images);
                  return (
                    <TableRow
                      key={product.id}
                      className="border-zinc-50 hover:bg-zinc-50/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-zinc-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {img ? (
                              <img
                                src={img}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <ImageOff className="h-4 w-4 text-zinc-300" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">
                              {product.name}
                            </p>
                            {product.sku && (
                              <p className="text-xs text-zinc-400">{product.sku}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-zinc-600">{product.category?.name || '—'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium text-zinc-900">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-xs text-zinc-400 line-through">
                              ${product.comparePrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        <span
                          className={`text-sm font-medium ${
                            product.stock <= 0
                              ? 'text-red-500'
                              : product.stock <= 5
                                ? 'text-amber-600'
                                : 'text-zinc-700'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={product.isActive}
                          onCheckedChange={() => handleToggleActive(product)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className="inline-flex"
                          aria-label="Toggle featured"
                        >
                          <Star
                            className={`h-4 w-4 transition-colors ${
                              product.isFeatured
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-300 hover:text-zinc-400'
                            }`}
                          />
                        </button>
                      </TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        {product.isNew && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[11px]">
                            NEW
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-zinc-900"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget(product)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}