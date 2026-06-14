'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Save,
  RotateCcw,
  Loader2,
  ArrowUp,
  ArrowDown,
  Eye,
  Shield,
  Globe,
  Palette,
  Megaphone,
  ImageIcon,
  Navigation,
  Plus,
  Trash2,
  MousePointerClick,
  PanelBottom,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/lib/stores';
import { DEFAULT_SETTINGS } from '@/lib/types';
import type { StoreSettings } from '@/lib/types';

const tabs = [
  { value: 'general', label: 'General' },
  { value: 'appearance', label: 'Appearance' },
  { value: 'hero-slides', label: 'Hero Slides' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'contact', label: 'Contact' },
  { value: 'social', label: 'Social' },
  { value: 'homepage', label: 'Homepage' },
  { value: 'footer', label: 'Footer' },
  { value: 'seo', label: 'SEO' },
  { value: 'domain', label: 'Domain' },
];

const DEFAULT_HERO_SLIDES = [
  '/banners/hero-1.jpg',
  '/banners/hero-2.jpg',
  '/banners/hero-3.jpg',
  '/banners/hero-4.jpg',
  '/banners/hero-5.jpg',
];

interface HeroSlide {
  url: string;
  enabled: boolean;
}

interface NavLinkItem {
  label: string;
  view: string;
  icon?: string;
}

interface SlideTextItem {
  tagline: string;
  title: string;
  subtitle: string;
  cta: string;
  theme: 'light' | 'dark';
}

interface FooterColumnLink {
  label: string;
  view?: string;
  url?: string;
}

interface FooterColumn {
  title: string;
  links: FooterColumnLink[];
}

interface FooterConfig {
  showCategories: boolean;
  showNewsletter: boolean;
  columns: FooterColumn[];
}

interface SaveState {
  [key: string]: boolean;
}

export default function SettingsManager() {
  const { settings: storeSettings, setSettings } = useSettingsStore();
  const [settings, setLocalSettings] = useState<StoreSettings>(storeSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SaveState>({});

  // Hero slides local state
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(
    DEFAULT_HERO_SLIDES.map((url) => ({ url, enabled: true }))
  );
  const [slideInterval, setSlideInterval] = useState(5);
  const [overlayOpacity, setOverlayOpacity] = useState(0.6);

  // Announcement local state
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementText, setAnnouncementText] = useState(
    '🚚 Free shipping on orders over $75 — Shop Now!'
  );

  // Navigation links local state
  const [navLinks, setNavLinks] = useState<NavLinkItem[]>([
    { label: 'Home', view: 'home' },
    { label: 'Shop', view: 'shop' },
  ]);

  // Hero slide texts local state
  const [heroSlideTexts, setHeroSlideTexts] = useState<SlideTextItem[]>([]);

  // Footer local state
  const [footerEnabled, setFooterEnabled] = useState(true);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    showCategories: true,
    showNewsletter: true,
    columns: [],
  });

  // Appearance preview state
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json && typeof json === 'object' && !Array.isArray(json)) {
          const raw = json.settings || json;
          const mapped: StoreSettings = { ...DEFAULT_SETTINGS };
          for (const [key, value] of Object.entries(raw)) {
            if (key in mapped) {
              const k = key as keyof StoreSettings;
              if (['freeShippingThreshold', 'taxRate', 'heroSlideInterval', 'heroOverlayOpacity'].includes(key)) {
                (mapped as Record<string, unknown>)[key] = parseFloat(value as string) || 0;
              } else if (key === 'announcementBarEnabled' || key === 'footerEnabled') {
                (mapped as Record<string, unknown>)[key] = value === 'true';
              } else {
                (mapped as Record<string, unknown>)[key] = value;
              }
            }
          }
          setLocalSettings(mapped);
          setSettings(mapped);

          // Parse hero slides
          try {
            const parsed = JSON.parse(mapped.heroSlides);
            if (Array.isArray(parsed)) {
              setHeroSlides(parsed.map((url: string, i: number) => ({ url, enabled: true })));
            }
          } catch {
            // keep defaults
          }
          setSlideInterval(mapped.heroSlideInterval);
          setOverlayOpacity(mapped.heroOverlayOpacity);
          setAnnouncementEnabled(mapped.announcementBarEnabled);
          setAnnouncementText(mapped.announcementBar);

          // Parse navigation links
          try {
            const parsed = JSON.parse(mapped.navLinks);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setNavLinks(parsed.map((l: { label: string; view: string; icon?: string }) => ({
                label: l.label,
                view: l.view,
                icon: l.icon,
              })));
            }
          } catch { /* keep defaults */ }

          // Parse hero slide texts
          try {
            const parsed = JSON.parse(mapped.heroSlideTexts);
            if (Array.isArray(parsed)) {
              setHeroSlideTexts(parsed);
            }
          } catch { /* keep defaults */ }

          // Parse footer config
          setFooterEnabled(mapped.footerEnabled);
          try {
            const parsed = JSON.parse(mapped.footerColumns);
            if (parsed && typeof parsed === 'object') {
              setFooterConfig({
                showCategories: parsed.showCategories !== false,
                showNewsletter: parsed.showNewsletter !== false,
                columns: Array.isArray(parsed.columns) ? parsed.columns : [],
              });
            }
          } catch { /* keep defaults */ }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [setSettings]);

  const updateField = (key: keyof StoreSettings, value: string | number | boolean) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (file: File, folder: string = 'uploads'): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) return data.url;
      toast.error(data.error || 'Upload failed');
      return null;
    } catch {
      toast.error('Upload failed');
      return null;
    }
  };

  const handleSave = async (group: string, fields: (keyof StoreSettings)[]) => {
    setSaving((prev) => ({ ...prev, [group]: true }));
    const body: Record<string, string | number | boolean> = {};
    for (const key of fields) {
      body[key] = settings[key] as string | number | boolean;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const partial: Partial<StoreSettings> = {};
      for (const key of fields) {
        partial[key] = settings[key];
      }
      setSettings(partial);
      toast.success(`${group} settings saved`);
    } catch {
      toast.error(`Failed to save ${group} settings`);
    } finally {
      setSaving((prev) => ({ ...prev, [group]: false }));
    }
  };

  const handleSaveAnnouncement = async () => {
    setSaving((prev) => ({ ...prev, announcement: true }));
    const body: Record<string, string | boolean> = {
      announcementBar: announcementText,
      announcementBarEnabled: announcementEnabled,
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setSettings({
        announcementBar: announcementText,
        announcementBarEnabled: announcementEnabled,
      });
      toast.success('Announcement settings saved');
    } catch {
      toast.error('Failed to save announcement settings');
    } finally {
      setSaving((prev) => ({ ...prev, announcement: false }));
    }
  };

  const handleSaveNavLinks = async () => {
    setSaving((prev) => ({ ...prev, navigation: true }));
    const validLinks = navLinks.filter((l) => l.label.trim() !== '');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ navLinks: JSON.stringify(validLinks) }),
      });
      if (!res.ok) throw new Error();
      setSettings({ navLinks: JSON.stringify(validLinks) });
      toast.success('Navigation links saved');
    } catch {
      toast.error('Failed to save navigation links');
    } finally {
      setSaving((prev) => ({ ...prev, navigation: false }));
    }
  };

  const handleSaveHeroSlides = async () => {
    setSaving((prev) => ({ ...prev, 'hero-slides': true }));
    const activeSlides = heroSlides
      .filter((s) => s.enabled)
      .map((s) => s.url);
    const body: Record<string, string | number> = {
      heroSlides: JSON.stringify(activeSlides),
      heroSlideInterval: slideInterval,
      heroOverlayOpacity: overlayOpacity,
      heroSlideTexts: JSON.stringify(heroSlideTexts),
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setSettings({
        heroSlides: JSON.stringify(activeSlides),
        heroSlideInterval: slideInterval,
        heroOverlayOpacity: overlayOpacity,
        heroSlideTexts: JSON.stringify(heroSlideTexts),
      });
      toast.success('Hero slides settings saved');
    } catch {
      toast.error('Failed to save hero slides settings');
    } finally {
      setSaving((prev) => ({ ...prev, 'hero-slides': false }));
    }
  };

  const handleSaveFooter = async () => {
    setSaving((prev) => ({ ...prev, footer: true }));
    const body: Record<string, string | boolean> = {
      footerEnabled,
      footerColumns: JSON.stringify(footerConfig),
    };
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setSettings({
        footerEnabled,
        footerColumns: JSON.stringify(footerConfig),
      });
      toast.success('Footer settings saved');
    } catch {
      toast.error('Failed to save footer settings');
    } finally {
      setSaving((prev) => ({ ...prev, footer: false }));
    }
  };

  const handleResetDefaults = () => {
    setLocalSettings({ ...DEFAULT_SETTINGS });
    setSettings(DEFAULT_SETTINGS);
    toast.info('Settings reset to defaults. Click Save to apply.');
  };

  const moveSlide = useCallback((index: number, direction: 'up' | 'down') => {
    setHeroSlides((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const toggleSlide = useCallback((index: number) => {
    setHeroSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  const updateSlideUrl = (index: number, url: string) => {
    setHeroSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, url } : s))
    );
  };

  // Nav link management
  const addNavLink = () => {
    setNavLinks((prev) => [...prev, { label: '', view: 'home' }]);
  };
  const removeNavLink = (index: number) => {
    setNavLinks((prev) => prev.filter((_, i) => i !== index));
  };
  const moveNavLink = useCallback((index: number, direction: 'up' | 'down') => {
    setNavLinks((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);
  const updateNavLink = (index: number, field: keyof NavLinkItem, value: string) => {
    setNavLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  // Hero slide text management
  const updateSlideText = (index: number, field: keyof SlideTextItem, value: string) => {
    setHeroSlideTexts((prev) => {
      const next = [...prev];
      if (!next[index]) {
        next[index] = { tagline: '', title: '', subtitle: '', cta: '', theme: 'dark' };
      }
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Footer column management
  const addFooterColumn = () => {
    setFooterConfig((prev) => ({
      ...prev,
      columns: [...prev.columns, { title: '', links: [{ label: '', view: 'shop' }] }],
    }));
  };
  const removeFooterColumn = (index: number) => {
    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index),
    }));
  };
  const updateFooterColumnTitle = (index: number, title: string) => {
    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((c, i) => (i === index ? { ...c, title } : c)),
    }));
  };
  const addFooterColumnLink = (colIndex: number) => {
    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((c, i) =>
        i === colIndex ? { ...c, links: [...c.links, { label: '', view: 'shop' }] } : c
      ),
    }));
  };
  const removeFooterColumnLink = (colIndex: number, linkIndex: number) => {
    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((c, i) =>
        i === colIndex ? { ...c, links: c.links.filter((_, li) => li !== linkIndex) } : c
      ),
    }));
  };
  const updateFooterColumnLink = (colIndex: number, linkIndex: number, field: string, value: string) => {
    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((c, i) =>
        i === colIndex ? {
          ...c,
          links: c.links.map((l, li) =>
            li === linkIndex ? { ...l, [field]: value || undefined, ...(field === 'view' && value ? { url: undefined } : {}), ...(field === 'url' && value ? { view: undefined } : {}) } : l
          ),
        } : c
      ),
    }));
  };

  const generalFields: (keyof StoreSettings)[] = [
    'storeName', 'storeTagline', 'storeDescription', 'storeLogo', 'currency', 'currencySymbol',
    'freeShippingThreshold', 'taxRate',
  ];

  const appearanceFields: (keyof StoreSettings)[] = ['primaryColor', 'accentColor'];

  const contactFields: (keyof StoreSettings)[] = ['contactEmail', 'contactPhone', 'address'];

  const socialFields: (keyof StoreSettings)[] = ['socialFacebook', 'socialInstagram', 'socialTwitter', 'socialYoutube'];

  const homepageFields: (keyof StoreSettings)[] = [
    'heroTitle', 'heroSubtitle', 'heroCta', 'heroImage', 'footerText', 'copyrightText',
  ];

  const seoFields: (keyof StoreSettings)[] = ['metaTitle', 'metaDescription'];

  const domainFields: (keyof StoreSettings)[] = ['domainName'];

  const SectionFooter = ({ group, fields, onSave }: { group: string; fields: (keyof StoreSettings)[]; onSave?: () => void }) => (
    <div className="flex items-center justify-end pt-4 border-t border-zinc-100 mt-6">
      <Button
        onClick={onSave || (() => handleSave(group, fields))}
        disabled={saving[group]}
        className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[120px]"
      >
        {saving[group] ? (
          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-1.5" />
        )}
        Save Changes
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-4xl" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Settings</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Configure your store appearance, content, and behavior
          </p>
        </div>
        <Button
          variant="outline"
          className="text-zinc-600"
          onClick={handleResetDefaults}
        >
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Reset to Defaults
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-zinc-100 p-1 h-auto flex-wrap gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 text-sm font-medium text-zinc-500 px-3 py-2 rounded-lg"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">General Settings</CardTitle>
              <CardDescription>
                Basic store information and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) => updateField('storeName', e.target.value)}
                    placeholder="Your Store Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="storeTagline">Tagline</Label>
                  <Input
                    id="storeTagline"
                    value={settings.storeTagline}
                    onChange={(e) => updateField('storeTagline', e.target.value)}
                    placeholder="Your store tagline"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={settings.storeDescription}
                  onChange={(e) => updateField('storeDescription', e.target.value)}
                  placeholder="Describe your store..."
                  rows={3}
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Store Logo</Label>
                <div className="flex items-start gap-4">
                  <div className="relative group">
                    <img
                      src={settings.storeLogo || '/logo.svg'}
                      alt="Logo preview"
                      className="h-16 w-16 rounded-xl object-contain border border-zinc-200 bg-white p-1.5"
                    />
                    <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.svg"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await handleImageUpload(file, 'banners');
                            if (url) {
                              updateField('storeLogo', url);
                              setSettings({ storeLogo: url });
                            }
                            e.target.value = '';
                          }}
                        />
                        <Button variant="outline" size="sm" type="button" className="h-9">
                          <Upload className="h-3.5 w-3.5 mr-1.5" />
                          Upload Logo
                        </Button>
                      </label>
                      {(settings.storeLogo && settings.storeLogo !== '/logo.svg') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-9 text-zinc-500 hover:text-rose-600"
                          onClick={() => {
                            updateField('storeLogo', '/logo.svg');
                            setSettings({ storeLogo: '/logo.svg' });
                          }}
                        >
                          Reset Default
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">Recommended: SVG or PNG, transparent background</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="currency">Currency Code</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    placeholder="USD"
                    className="uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={settings.currencySymbol}
                    onChange={(e) => updateField('currencySymbol', e.target.value)}
                    placeholder="$"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.taxRate}
                    onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => updateField('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                  placeholder="75"
                />
                <p className="text-xs text-zinc-400 mt-1">
                  Orders above this amount get free shipping. Set to 0 to disable.
                </p>
              </div>

              <SectionFooter group="General" fields={generalFields} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-zinc-500" />
                <div>
                  <CardTitle className="text-base">Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize your store colors and visual style
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => updateField('primaryColor', e.target.value)}
                        className="h-12 w-12 rounded-lg border border-zinc-200 cursor-pointer bg-transparent p-0.5"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => updateField('primaryColor', e.target.value)}
                        className="font-mono text-sm"
                        placeholder="#1a1a1a"
                      />
                      <p className="text-xs text-zinc-400">Buttons, links, and accents</p>
                    </div>
                  </div>
                  {/* Color swatch */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Swatch:</span>
                    <div
                      className="h-8 w-full max-w-[200px] rounded-md border border-zinc-200 transition-colors"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => updateField('accentColor', e.target.value)}
                        className="h-12 w-12 rounded-lg border border-zinc-200 cursor-pointer bg-transparent p-0.5"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        value={settings.accentColor}
                        onChange={(e) => updateField('accentColor', e.target.value)}
                        className="font-mono text-sm"
                        placeholder="#e8a838"
                      />
                      <p className="text-xs text-zinc-400">Highlights, badges, special elements</p>
                    </div>
                  </div>
                  {/* Color swatch */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Swatch:</span>
                    <div
                      className="h-8 w-full max-w-[200px] rounded-md border border-zinc-200 transition-colors"
                      style={{ backgroundColor: settings.accentColor }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Color Preview Panel */}
              <div className="rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-zinc-700">Color Preview</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setShowPreview(true);
                      setTimeout(() => setShowPreview(false), 3000);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Live Preview
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className="h-10 w-24 rounded-lg transition-colors"
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                  <div
                    className="h-10 w-24 rounded-lg transition-colors"
                    style={{ backgroundColor: settings.accentColor }}
                  />
                  <div
                    className="h-10 px-4 rounded-lg text-white text-xs flex items-center justify-center font-medium transition-colors"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Button
                  </div>
                  <div
                    className="h-10 px-4 rounded-lg text-xs flex items-center justify-center font-medium border transition-colors"
                    style={{
                      backgroundColor: settings.accentColor,
                      color: settings.primaryColor,
                      borderColor: settings.accentColor,
                    }}
                  >
                    Accent
                  </div>
                  <div
                    className="h-10 px-4 rounded-lg text-xs flex items-center justify-center font-medium border-2 transition-colors"
                    style={{
                      borderColor: settings.primaryColor,
                      color: settings.primaryColor,
                    }}
                  >
                    Outlined
                  </div>
                  <Badge
                    className="text-white text-xs"
                    style={{ backgroundColor: settings.accentColor }}
                  >
                    Badge
                  </Badge>
                </div>

                {/* Expanded Live Preview */}
                {showPreview && (
                  <div className="mt-4 rounded-lg border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div
                      className="h-24 flex items-center justify-center relative"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                      />
                      <div className="relative z-10 text-center">
                        <h3 className="text-white font-bold text-lg">{settings.storeName}</h3>
                        <p className="text-white/70 text-xs mt-1">{settings.storeTagline}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 px-4 rounded-md text-white text-xs font-medium flex items-center"
                          style={{ backgroundColor: settings.primaryColor }}
                        >
                          {settings.heroCta}
                        </div>
                        <Badge
                          className="text-xs text-white"
                          style={{ backgroundColor: settings.accentColor }}
                        >
                          New
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <SectionFooter group="Appearance" fields={appearanceFields} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Slides Tab */}
        <TabsContent value="hero-slides">
          <div className="space-y-6">
            {/* Slide Controls */}
            <Card className="border-zinc-200/60 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-zinc-500" />
                  <div>
                    <CardTitle className="text-base">Hero Slides</CardTitle>
                    <CardDescription>
                      Manage the hero carousel slides on your homepage
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Slide list */}
                <div className="space-y-3">
                  {heroSlides.map((slide, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-white group hover:border-zinc-300 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="h-16 w-24 rounded-md overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-100 flex items-center justify-center">
                        <img
                          src={slide.url}
                          alt={`Hero slide ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const el = e.target as HTMLImageElement;
                            el.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-900 truncate">
                            Slide {index + 1}
                          </p>
                          {slide.enabled ? (
                            <Badge variant="secondary" className="text-emerald-700 bg-emerald-50 text-[10px] px-1.5 py-0">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-zinc-500 bg-zinc-100 text-[10px] px-1.5 py-0">
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs text-zinc-500 truncate max-w-[180px]">{slide.url}</p>
                          <label className="cursor-pointer flex-shrink-0">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const url = await handleImageUpload(file, 'banners');
                                if (url) {
                                  updateSlideUrl(index, url);
                                }
                                e.target.value = '';
                              }}
                            />
                            <Button variant="ghost" size="icon" className="h-6 w-6" type="button" title="Upload image">
                              <ImageIcon className="h-3 w-3 text-zinc-400" />
                            </Button>
                          </label>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === 0}
                          onClick={() => moveSlide(index, 'up')}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === heroSlides.length - 1}
                          onClick={() => moveSlide(index, 'down')}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <div className="flex items-center gap-1.5 ml-1.5 pl-1.5 border-l border-zinc-200">
                          <Label className="text-xs text-zinc-500">Show</Label>
                          <Switch
                            checked={slide.enabled}
                            onCheckedChange={() => toggleSlide(index)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Interval */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Slide Transition Interval</Label>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Seconds between automatic slide transitions
                      </p>
                    </div>
                    <span className="text-sm font-mono font-medium text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md">
                      {slideInterval}s
                    </span>
                  </div>
                  <Slider
                    value={[slideInterval]}
                    onValueChange={([v]) => setSlideInterval(v)}
                    min={2}
                    max={15}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>2s (fast)</span>
                    <span>15s (slow)</span>
                  </div>
                </div>

                <Separator />

                {/* Overlay Opacity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Overlay Opacity</Label>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Controls the dark overlay on hero images
                      </p>
                    </div>
                    <span className="text-sm font-mono font-medium text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md">
                      {(overlayOpacity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[overlayOpacity * 100]}
                    onValueChange={([v]) => setOverlayOpacity(v / 100)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>0% (no overlay)</span>
                    <span>100% (fully dark)</span>
                  </div>

                  {/* Opacity preview */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="relative h-12 w-32 rounded-md overflow-hidden bg-gradient-to-br from-zinc-300 to-zinc-500">
                      <div
                        className="absolute inset-0 bg-black transition-all"
                        style={{ opacity: overlayOpacity }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium z-10">
                        Preview
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">Overlay preview with current opacity</p>
                  </div>
                </div>

                <Separator />

                {/* Per-Slide Text */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Per-Slide Text</Label>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Customize the text for each slide. Leave fields empty to use the global hero text from the Homepage tab.
                    </p>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {heroSlides.map((slide, index) => (
                      <div key={index} className="p-4 rounded-lg border border-zinc-200 bg-zinc-50/30 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-700">Slide {index + 1}</span>
                          {slide.enabled ? (
                            <Badge variant="secondary" className="text-emerald-700 bg-emerald-50 text-[10px] px-1.5 py-0">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-zinc-500 bg-zinc-100 text-[10px] px-1.5 py-0">Hidden</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-zinc-500">Tagline</Label>
                            <Input
                              value={heroSlideTexts[index]?.tagline || ''}
                              onChange={(e) => updateSlideText(index, 'tagline', e.target.value)}
                              placeholder={settings.storeTagline}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-zinc-500">Title</Label>
                            <Input
                              value={heroSlideTexts[index]?.title || ''}
                              onChange={(e) => updateSlideText(index, 'title', e.target.value)}
                              placeholder={settings.heroTitle}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-xs text-zinc-500">Subtitle</Label>
                            <Input
                              value={heroSlideTexts[index]?.subtitle || ''}
                              onChange={(e) => updateSlideText(index, 'subtitle', e.target.value)}
                              placeholder={settings.heroSubtitle}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-zinc-500">CTA Button Text</Label>
                            <Input
                              value={heroSlideTexts[index]?.cta || ''}
                              onChange={(e) => updateSlideText(index, 'cta', e.target.value)}
                              placeholder={settings.heroCta || 'Shop Now'}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-zinc-500">Text Section Theme</Label>
                            <div className="flex items-center gap-2 h-9">
                              <button
                                type="button"
                                onClick={() => updateSlideText(index, 'theme', 'dark')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                                  (heroSlideTexts[index]?.theme || 'dark') === 'dark'
                                    ? 'bg-zinc-900 text-white border-zinc-900'
                                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                                }`}
                              >
                                <span className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-700" />
                                Dark
                              </button>
                              <button
                                type="button"
                                onClick={() => updateSlideText(index, 'theme', 'light')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                                  heroSlideTexts[index]?.theme === 'light'
                                    ? 'bg-white text-zinc-900 border-zinc-900 shadow-sm'
                                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                                }`}
                              >
                                <span className="w-3 h-3 rounded-full bg-white border border-zinc-300" />
                                Light
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {heroSlideTexts.length === 0 && (
                    <div className="text-center py-6 rounded-lg border border-dashed border-zinc-300">
                      <MousePointerClick className="h-5 w-5 text-zinc-400 mx-auto mb-2" />
                      <p className="text-xs text-zinc-400">Fill in any field above to set custom text for a slide</p>
                    </div>
                  )}
                </div>

                <SectionFooter group="hero-slides" fields={[]} onSave={handleSaveHeroSlides} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="navigation">
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-zinc-500" />
                <div>
                  <CardTitle className="text-base">Navigation Links</CardTitle>
                  <CardDescription>
                    Manage the main navigation links in your store header
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-zinc-500">
                Add, remove, and reorder the navigation links shown in the header. Each link requires a label and a target view.
              </p>

              <div className="space-y-3">
                {navLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 bg-white group hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-500">Label</Label>
                        <Input
                          value={link.label}
                          onChange={(e) => updateNavLink(index, 'label', e.target.value)}
                          placeholder="e.g., Home, Shop, Wishlist"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-500">Target View</Label>
                        <select
                          value={link.view}
                          onChange={(e) => updateNavLink(index, 'view', e.target.value)}
                          className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-300"
                        >
                          <option value="home">Home</option>
                          <option value="shop">Shop</option>
                          <option value="wishlist">Wishlist</option>
                          <option value="orders">Orders</option>
                          <option value="login">Sign In</option>
                          <option value="register">Sign Up</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 pt-5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index === 0}
                        onClick={() => moveNavLink(index, 'up')}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index === navLinks.length - 1}
                        onClick={() => moveNavLink(index, 'down')}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => removeNavLink(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={addNavLink}
                className="text-zinc-600 border-dashed"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Navigation Link
              </Button>

              <Separator />

              {/* Preview */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-700">Preview</p>
                <div className="flex items-center gap-1 p-3 rounded-lg border border-zinc-200 bg-zinc-50/50">
                  {navLinks.filter((l) => l.label.trim()).map((link, i) => (
                    <span key={i} className="px-3 py-1.5 text-xs font-medium bg-white rounded-md border border-zinc-200 text-zinc-700">
                      {link.label}
                    </span>
                  ))}
                  {navLinks.filter((l) => l.label.trim()).length === 0 && (
                    <span className="text-xs text-zinc-400">No links added yet</span>
                  )}
                </div>
              </div>

              <SectionFooter group="navigation" fields={[]} onSave={handleSaveNavLinks} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcement Tab */}
        <TabsContent value="announcement">
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-zinc-500" />
                <div>
                  <CardTitle className="text-base">Announcement Bar</CardTitle>
                  <CardDescription>
                    Display a promotional message at the top of your store
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-zinc-50/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Enable Announcement Bar</Label>
                  <p className="text-xs text-zinc-400">Show a banner at the very top of your store</p>
                </div>
                <Switch
                  checked={announcementEnabled}
                  onCheckedChange={setAnnouncementEnabled}
                />
              </div>

              {/* Text */}
              <div className="space-y-1.5">
                <Label htmlFor="announcementText">Announcement Text</Label>
                <Textarea
                  id="announcementText"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g., 🚚 Free shipping on orders over $75 — Shop Now!"
                  rows={2}
                  disabled={!announcementEnabled}
                />
                <p className="text-xs text-zinc-400 mt-1">
                  Supports emoji and plain text. Keep it short for best results.
                </p>
              </div>

              <Separator />

              {/* Preview */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-700">Preview</p>
                {announcementEnabled && announcementText ? (
                  <div className="rounded-lg border border-zinc-200 overflow-hidden">
                    <div className="bg-zinc-900 text-white text-center text-sm py-2.5 px-4">
                      <span className="font-medium">{announcementText}</span>
                    </div>
                    <div className="h-20 bg-zinc-50 flex items-center justify-center">
                      <p className="text-xs text-zinc-400">↑ This will appear at the top of your store</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 py-8 flex items-center justify-center">
                    <p className="text-sm text-zinc-400">Announcement bar is disabled</p>
                  </div>
                )}
              </div>

              <SectionFooter group="announcement" fields={[]} onSave={handleSaveAnnouncement} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
              <CardDescription>
                How customers can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    placeholder="hello@yourstore.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={settings.contactPhone}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Store Address</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="123 Store Street, City, State 12345"
                  rows={2}
                />
              </div>

              <SectionFooter group="Contact" fields={contactFields} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social">
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Social Media Links</CardTitle>
              <CardDescription>
                Connect your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="socialFacebook">Facebook URL</Label>
                  <Input
                    id="socialFacebook"
                    value={settings.socialFacebook}
                    onChange={(e) => updateField('socialFacebook', e.target.value)}
                    placeholder="https://facebook.com/yourstore"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialInstagram">Instagram URL</Label>
                  <Input
                    id="socialInstagram"
                    value={settings.socialInstagram}
                    onChange={(e) => updateField('socialInstagram', e.target.value)}
                    placeholder="https://instagram.com/yourstore"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialTwitter">Twitter / X URL</Label>
                  <Input
                    id="socialTwitter"
                    value={settings.socialTwitter}
                    onChange={(e) => updateField('socialTwitter', e.target.value)}
                    placeholder="https://twitter.com/yourstore"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialYoutube">YouTube URL</Label>
                  <Input
                    id="socialYoutube"
                    value={settings.socialYoutube}
                    onChange={(e) => updateField('socialYoutube', e.target.value)}
                    placeholder="https://youtube.com/@yourstore"
                  />
                </div>
              </div>

              <SectionFooter group="Social" fields={socialFields} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Homepage Tab */}
        <TabsContent value="homepage">
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Homepage Content</CardTitle>
              <CardDescription>
                Customize your homepage hero section and footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={settings.heroTitle}
                  onChange={(e) => updateField('heroTitle', e.target.value)}
                  placeholder="Curated for the Modern You"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Textarea
                  id="heroSubtitle"
                  value={settings.heroSubtitle}
                  onChange={(e) => updateField('heroSubtitle', e.target.value)}
                  placeholder="Premium products, thoughtfully selected."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="heroCta">Hero CTA Button Text</Label>
                  <Input
                    id="heroCta"
                    value={settings.heroCta}
                    onChange={(e) => updateField('heroCta', e.target.value)}
                    placeholder="Shop Now"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="heroImage">Hero Image URL</Label>
                  <Input
                    id="heroImage"
                    value={settings.heroImage}
                    onChange={(e) => updateField('heroImage', e.target.value)}
                    placeholder="https://example.com/hero.jpg"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label htmlFor="footerText">Footer Text</Label>
                <Textarea
                  id="footerText"
                  value={settings.footerText}
                  onChange={(e) => updateField('footerText', e.target.value)}
                  placeholder="Footer content text"
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="copyrightText">Copyright Text</Label>
                <Input
                  id="copyrightText"
                  value={settings.copyrightText}
                  onChange={(e) => updateField('copyrightText', e.target.value)}
                  placeholder="© 2025 Your Store. All rights reserved."
                />
              </div>

              <SectionFooter group="Homepage" fields={homepageFields} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Tab */}
        <TabsContent value="footer">
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PanelBottom className="h-5 w-5 text-zinc-500" />
                <div>
                  <CardTitle className="text-base">Footer Settings</CardTitle>
                  <CardDescription>
                    Control your store footer appearance and content
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-zinc-50/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Enable Footer</Label>
                  <p className="text-xs text-zinc-400">Show the footer at the bottom of your store pages</p>
                </div>
                <Switch
                  checked={footerEnabled}
                  onCheckedChange={setFooterEnabled}
                />
              </div>

              <Separator />

              {/* Toggle sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-white">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show Categories</Label>
                    <p className="text-xs text-zinc-400">Display category links in footer</p>
                  </div>
                  <Switch
                    checked={footerConfig.showCategories}
                    onCheckedChange={(v) => setFooterConfig((prev) => ({ ...prev, showCategories: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-white">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show Newsletter</Label>
                    <p className="text-xs text-zinc-400">Display newsletter signup in footer</p>
                  </div>
                  <Switch
                    checked={footerConfig.showNewsletter}
                    onCheckedChange={(v) => setFooterConfig((prev) => ({ ...prev, showNewsletter: v }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Custom Columns */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Custom Link Columns</Label>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Add custom footer columns with links. Leave empty to use defaults (Shop, Help).
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addFooterColumn}
                    className="text-zinc-600 border-dashed"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Column
                  </Button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {footerConfig.columns.map((col, colIdx) => (
                    <div key={colIdx} className="p-4 rounded-lg border border-zinc-200 bg-zinc-50/30 space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={col.title}
                          onChange={(e) => updateFooterColumnTitle(colIdx, e.target.value)}
                          placeholder="Column title (e.g., Shop, Help)"
                          className="h-9 text-sm font-medium max-w-[200px]"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 ml-auto"
                          onClick={() => removeFooterColumn(colIdx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {col.links.map((link, linkIdx) => (
                          <div key={linkIdx} className="flex items-center gap-2">
                            <Input
                              value={link.label}
                              onChange={(e) => updateFooterColumnLink(colIdx, linkIdx, 'label', e.target.value)}
                              placeholder="Link label"
                              className="h-8 text-xs flex-1"
                            />
                            <select
                              value={link.view || ''}
                              onChange={(e) => updateFooterColumnLink(colIdx, linkIdx, 'view', e.target.value)}
                              className="h-8 w-28 rounded-md border border-zinc-200 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-950/5"
                            >
                              <option value="">URL</option>
                              <option value="home">Home</option>
                              <option value="shop">Shop</option>
                              <option value="wishlist">Wishlist</option>
                              <option value="orders">Orders</option>
                              <option value="login">Sign In</option>
                              <option value="register">Sign Up</option>
                            </select>
                            {(link.view || link.url) && (
                              <Input
                                value={link.url || ''}
                                onChange={(e) => updateFooterColumnLink(colIdx, linkIdx, 'url', e.target.value)}
                                placeholder={link.view ? 'Already set' : 'https://...'}
                                className="h-8 text-xs flex-1"
                                disabled={!!link.view}
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-rose-500"
                              onClick={() => removeFooterColumnLink(colIdx, linkIdx)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addFooterColumnLink(colIdx)}
                          className="text-xs h-7 border-dashed text-zinc-500"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Link
                        </Button>
                      </div>
                    </div>
                  ))}
                  {footerConfig.columns.length === 0 && (
                    <div className="text-center py-6 rounded-lg border border-dashed border-zinc-300">
                      <PanelBottom className="h-5 w-5 text-zinc-400 mx-auto mb-2" />
                      <p className="text-xs text-zinc-400">No custom columns. Default columns (Shop, Help) will be shown.</p>
                    </div>
                  )}
                </div>
              </div>

              <SectionFooter group="footer" fields={[]} onSave={handleSaveFooter} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">SEO Settings</CardTitle>
              <CardDescription>
                Improve your store&apos;s search engine visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={settings.metaTitle}
                  onChange={(e) => updateField('metaTitle', e.target.value)}
                  placeholder="Your Store | Premium Products"
                />
                <p className="text-xs text-zinc-400 mt-1">
                  {settings.metaTitle.length}/60 characters recommended
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.metaDescription}
                  onChange={(e) => updateField('metaDescription', e.target.value)}
                  placeholder="A brief description of your store for search engines..."
                  rows={3}
                />
                <p className="text-xs text-zinc-400 mt-1">
                  {settings.metaDescription.length}/160 characters recommended
                </p>
              </div>

              {/* Preview */}
              <div className="rounded-lg border border-zinc-200 p-4 bg-zinc-50/50">
                <p className="text-xs text-zinc-500 mb-2">Search Engine Preview</p>
                <p className="text-blue-700 text-base font-medium truncate">
                  {settings.metaTitle || 'Your Store Name'}
                </p>
                <p className="text-green-700 text-sm truncate">
                  {settings.domainName || 'yourstore.com'}
                </p>
                <p className="text-sm text-zinc-600 line-clamp-2 mt-0.5">
                  {settings.metaDescription || 'Your store description will appear here...'}
                </p>
              </div>

              <SectionFooter group="SEO" fields={seoFields} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Tab */}
        <TabsContent value="domain">
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-zinc-500" />
                <div>
                  <CardTitle className="text-base">Domain Settings</CardTitle>
                  <CardDescription>
                    Configure your custom domain and SSL
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="domainName">Domain Name</Label>
                <Input
                  id="domainName"
                  value={settings.domainName}
                  onChange={(e) => updateField('domainName', e.target.value)}
                  placeholder="yourstore.com"
                />
              </div>

              {/* URL Preview */}
              <div className="rounded-lg border border-zinc-200 p-4 bg-zinc-50/50">
                <p className="text-xs text-zinc-500 mb-2">Store URL Preview</p>
                <div className="flex items-center gap-2 p-3 bg-white rounded-md border border-zinc-200">
                  <span className="text-sm text-zinc-400">https://</span>
                  <span className="text-sm font-mono font-medium text-zinc-900">
                    {settings.domainName || 'yourstore.com'}
                  </span>
                </div>
              </div>

              {/* SSL Status */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100">
                    <Shield className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-emerald-800">SSL Certificate</p>
                      <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 border-0">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Your store is secured with an SSL certificate. All connections are encrypted.
                    </p>
                  </div>
                </div>
              </div>

              {/* DNS Configuration */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-800">Domain Configuration</p>
                <p className="text-xs text-amber-700 mt-1">
                  To use a custom domain, configure your DNS settings to point to our servers.
                  This typically involves setting up a CNAME record. Contact support if you need
                  assistance with domain configuration.
                </p>
              </div>

              <SectionFooter group="Domain" fields={domainFields} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}