'use client';

import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigationStore } from '@/lib/stores';

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface Attribute {
  key: string;
  value: string;
}

export default function ProductForm() {
  const { selectedProductId, setAdminView, setSelectedProductId } = useNavigationStore();
  const isEditing = !!selectedProductId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  // Auto-generate slug from name
  const autoSlug = useMemo(() => slugify(name), [name]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((json) => {
        const cats = Array.isArray(json) ? json : [];
        setCategories(cats.filter((c: Category) => c.isActive));
      })
      .catch(() => {});

    if (selectedProductId) {
      fetch(`/api/products/${selectedProductId}`)
        .then((r) => r.json())
        .then((p) => {
          setName(p.name || '');
          setSlug(p.slug || '');
          setDescription(p.description || '');
          setShortDesc(p.shortDesc || '');
          setPrice(p.price?.toString() || '');
          setComparePrice(p.comparePrice?.toString() || '');
          setCostPrice(p.costPrice?.toString() || '');
          setCategoryId(p.categoryId || '');
          setStock(p.stock?.toString() || '');
          setSku(p.sku || '');
          setWeight(p.weight?.toString() || '');
          setDimensions(p.dimensions || '');
          setIsFeatured(p.isFeatured || false);
          setIsNew(p.isNew || false);
          setIsActive(p.isActive !== false);
          try {
            const imgs = JSON.parse(p.images || '[]');
            setImageUrls(Array.isArray(imgs) && imgs.length > 0 ? imgs : ['']);
          } catch {
            setImageUrls(p.images ? [p.images] : ['']);
          }
          try {
            const attrs = JSON.parse(p.attributes || '[]');
            setAttributes(Array.isArray(attrs) ? attrs : []);
          } catch {
            setAttributes([]);
          }
          setLoading(false);
        })
        .catch(() => {
          toast.error('Failed to load product');
          setLoading(false);
        });
    }
  }, [selectedProductId]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(slugify(val));
    }
  };

  const addImageUrl = () => setImageUrls([...imageUrls, '']);
  const removeImageUrl = (idx: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls(imageUrls.filter((_, i) => i !== idx));
  };
  const updateImageUrl = (idx: number, val: string) => {
    const updated = [...imageUrls];
    updated[idx] = val;
    setImageUrls(updated);
  };

  const addAttribute = () => setAttributes([...attributes, { key: '', value: '' }]);
  const removeAttribute = (idx: number) => setAttributes(attributes.filter((_, i) => i !== idx));
  const updateAttribute = (idx: number, field: 'key' | 'value', val: string) => {
    const updated = [...attributes];
    updated[idx] = { ...updated[idx], [field]: val };
    setAttributes(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!price || parseFloat(price) < 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!categoryId) {
      toast.error('Category is required');
      return;
    }

    const validImages = imageUrls.filter((u) => u.trim());
    const validAttrs = attributes.filter((a) => a.key.trim());

    const body = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim() || null,
      shortDesc: shortDesc.trim() || null,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      categoryId,
      stock: parseInt(stock) || 0,
      sku: sku.trim() || null,
      weight: weight ? parseFloat(weight) : null,
      dimensions: dimensions.trim() || null,
      images: JSON.stringify(validImages),
      attributes: validAttrs.length > 0 ? JSON.stringify(validAttrs) : null,
      isFeatured,
      isNew,
      isActive,
    };

    setSaving(true);
    try {
      const url = isEditing ? `/api/products/${selectedProductId}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save product');
      }
      toast.success(isEditing ? 'Product updated' : 'Product created');
      setSelectedProductId(null);
      setAdminView('products');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedProductId(null);
    setAdminView('products');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              {isEditing ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {isEditing ? 'Update product information' : 'Fill in the product details'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel} className="text-zinc-700">
            <X className="h-4 w-4 mr-1.5" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder={autoSlug}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product description"
                  rows={5}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shortDesc">Short Description</Label>
                <Textarea
                  id="shortDesc"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Brief product description"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="comparePrice">Compare at Price</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-001"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dimensions">Dimensions (L×W×H)</Label>
                  <Input
                    id="dimensions"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="10×10×10 cm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateImageUrl(idx, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  {imageUrls.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-red-400 hover:text-red-600"
                      onClick={() => removeImageUrl(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="text-zinc-600"
                onClick={addImageUrl}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Image URL
              </Button>
            </CardContent>
          </Card>

          {/* Attributes */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Attributes</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-zinc-600"
                  onClick={addAttribute}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {attributes.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-4">
                  No attributes added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {attributes.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={attr.key}
                        onChange={(e) => updateAttribute(idx, 'key', e.target.value)}
                        placeholder="Key (e.g., Color)"
                        className="flex-1"
                      />
                      <Input
                        value={attr.value}
                        onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
                        placeholder="Value (e.g., Red)"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-red-400 hover:text-red-600"
                        onClick={() => removeAttribute(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Status toggles */}
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900">Active</p>
                  <p className="text-xs text-zinc-500">Product is visible on the store</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900">Featured</p>
                  <p className="text-xs text-zinc-500">Show in featured section</p>
                </div>
                <Switch
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900">New Arrival</p>
                  <p className="text-xs text-zinc-500">Mark as a new product</p>
                </div>
                <Switch
                  checked={isNew}
                  onCheckedChange={setIsNew}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}