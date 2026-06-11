'use client';

import { useEffect, useState } from 'react';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSettingsStore } from '@/lib/stores';
import { DEFAULT_SETTINGS } from '@/lib/types';
import type { StoreSettings } from '@/lib/types';

const tabs = [
  { value: 'general', label: 'General' },
  { value: 'appearance', label: 'Appearance' },
  { value: 'contact', label: 'Contact' },
  { value: 'social', label: 'Social' },
  { value: 'homepage', label: 'Homepage' },
  { value: 'seo', label: 'SEO' },
  { value: 'domain', label: 'Domain' },
];

interface SaveState {
  [key: string]: boolean;
}

export default function SettingsManager() {
  const { settings: storeSettings, setSettings } = useSettingsStore();
  const [settings, setLocalSettings] = useState<StoreSettings>(storeSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SaveState>({});
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json && typeof json === 'object' && !Array.isArray(json)) {
          // API returns raw key-value pairs
          const raw = json.settings || json;
          const mapped: StoreSettings = { ...DEFAULT_SETTINGS };
          for (const [key, value] of Object.entries(raw)) {
            if (key in mapped) {
              const k = key as keyof StoreSettings;
              if (['freeShippingThreshold', 'taxRate'].includes(key)) {
                (mapped as Record<string, unknown>)[key] = parseFloat(value as string) || 0;
              } else {
                (mapped as Record<string, unknown>)[key] = value;
              }
            }
          }
          setLocalSettings(mapped);
          setSettings(mapped);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [setSettings]);

  const updateField = (key: keyof StoreSettings, value: string | number) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (group: string, fields: (keyof StoreSettings)[]) => {
    setSaving((prev) => ({ ...prev, [group]: true }));
    const body: Record<string, string | number> = {};
    for (const key of fields) {
      body[key] = settings[key];
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      // Update store
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

  const handleResetDefaults = () => {
    setLocalSettings({ ...DEFAULT_SETTINGS });
    setSettings(DEFAULT_SETTINGS);
    toast.info('Settings reset to defaults. Click Save to apply.');
  };

  const generalFields: (keyof StoreSettings)[] = [
    'storeName', 'storeTagline', 'storeDescription', 'currency', 'currencySymbol',
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

  const SectionFooter = ({ group, fields }: { group: string; fields: (keyof StoreSettings)[] }) => (
    <div className="flex items-center justify-end pt-4 border-t border-zinc-100 mt-6">
      <Button
        onClick={() => handleSave(group, fields)}
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
        <Skeleton className="h-10 w-full max-w-lg" />
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
              className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 text-sm font-medium text-zinc-500 px-4 py-2 rounded-lg"
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
              <CardTitle className="text-base">Appearance Settings</CardTitle>
              <CardDescription>
                Customize your store colors and visual style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                      className="h-10 w-14 rounded-lg border border-zinc-200 cursor-pointer bg-transparent p-0.5"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => updateField('primaryColor', e.target.value)}
                      className="flex-1 font-mono"
                      placeholder="#1a1a1a"
                    />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Used for buttons, links, and accents</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      className="h-10 w-14 rounded-lg border border-zinc-200 cursor-pointer bg-transparent p-0.5"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      className="flex-1 font-mono"
                      placeholder="#e8a838"
                    />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Used for highlights, badges, and special elements</p>
                </div>
              </div>

              {/* Color preview */}
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="text-xs text-zinc-500 mb-3">Preview</p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-24 rounded-lg"
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                  <div
                    className="h-10 w-24 rounded-lg"
                    style={{ backgroundColor: settings.accentColor }}
                  />
                  <div
                    className="h-10 w-24 rounded-lg border border-zinc-200 text-white text-xs flex items-center justify-center font-medium"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Button
                  </div>
                  <div
                    className="h-10 w-24 rounded-lg text-xs flex items-center justify-center font-medium border"
                    style={{
                      backgroundColor: settings.accentColor,
                      color: settings.primaryColor,
                      borderColor: settings.accentColor,
                    }}
                  >
                    Accent
                  </div>
                </div>
              </div>

              <SectionFooter group="Appearance" fields={appearanceFields} />
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
                  shopwithfaisu.com
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
              <CardTitle className="text-base">Domain Settings</CardTitle>
              <CardDescription>
                Configure your custom domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="domainName">Domain Name</Label>
                <Input
                  id="domainName"
                  value={settings.domainName}
                  onChange={(e) => updateField('domainName', e.target.value)}
                  placeholder="yourstore.com"
                />
              </div>

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