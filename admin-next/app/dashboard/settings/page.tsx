'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings, SiteSettings } from '@/lib/api/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/image-upload';
import { VideoUpload } from '@/components/video-upload';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  
  // DRY: Fetch settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  // DRY: Local state for form
  const [formData, setFormData] = useState<Partial<SiteSettings>>(settings || {});

  // Update local form when data loads
  useEffect(() => {
    if (settings && JSON.stringify(settings) !== JSON.stringify(formData)) {
      setFormData(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // DRY: Update mutation
  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      toast.success('Instellingen opgeslagen!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Fout bij opslaan');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Fout bij laden van instellingen</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Site Instellingen
          </h1>
          <p className="text-gray-600 mt-1">
            Beheer hero, USP images en teksten
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hero-title">Titel</Label>
              <Input
                id="hero-title"
                value={formData.hero?.title || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  hero: { ...formData.hero!, title: e.target.value }
                })}
                placeholder="Slimste Kattenbak"
              />
            </div>

            <div>
              <Label htmlFor="hero-subtitle">Subtitel</Label>
              <Input
                id="hero-subtitle"
                value={formData.hero?.subtitle || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  hero: { ...formData.hero!, subtitle: e.target.value }
                })}
                placeholder="Automatisch • Smart • Hygiënisch"
              />
            </div>

            <div>
              <Label>Hero Afbeelding</Label>
              <ImageUpload
                value={formData.hero?.image ? [formData.hero.image] : []}
                onChange={(images) => setFormData({
                  ...formData,
                  hero: { ...formData.hero!, image: images[0] || '' }
                })}
                maxImages={1}
              />
            </div>

            <div>
              <Label>Hero Video (optioneel)</Label>
              <p className="text-xs text-gray-500 mb-2">
                Upload een 50MB MP4 voor reclame-kwaliteit achtergrond video
              </p>
              <VideoUpload
                value={formData.hero?.videoUrl || ''}
                onChange={(url) => setFormData({
                  ...formData,
                  hero: { ...formData.hero!, videoUrl: url }
                })}
                maxSizeMB={50}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* USP Section */}
        <Card>
          <CardHeader>
            <CardTitle>De Beste Innovatie (USPs)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="usp-title">Sectie Titel</Label>
              <Input
                id="usp-title"
                value={formData.usps?.title || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  usps: { ...formData.usps!, title: e.target.value }
                })}
                placeholder="De Beste Innovatie"
              />
            </div>

            <Separator />

            {/* Feature 1 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Feature 1</h3>
              
              <div>
                <Label htmlFor="feature1-title">Titel</Label>
                <Input
                  id="feature1-title"
                  value={formData.usps?.feature1?.title || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    usps: {
                      ...formData.usps!,
                      feature1: { ...formData.usps!.feature1!, title: e.target.value }
                    }
                  })}
                  placeholder="10.5L Capaciteit"
                />
              </div>

              <div>
                <Label htmlFor="feature1-description">Beschrijving</Label>
                <Textarea
                  id="feature1-description"
                  value={formData.usps?.feature1?.description || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    usps: {
                      ...formData.usps!,
                      feature1: { ...formData.usps!.feature1!, description: e.target.value }
                    }
                  })}
                  placeholder="De grootste afvalbak..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Feature 1 Afbeelding</Label>
                <ImageUpload
                  value={formData.usps?.feature1?.image ? [formData.usps.feature1.image] : []}
                  onChange={(images) => setFormData({
                    ...formData,
                    usps: {
                      ...formData.usps!,
                      feature1: { ...formData.usps!.feature1!, image: images[0] || '' }
                    }
                  })}
                  maxImages={1}
                />
              </div>
            </div>

            <Separator />

            {/* Feature 2 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Feature 2</h3>
              
              <div>
                <Label htmlFor="feature2-title">Titel</Label>
                <Input
                  id="feature2-title"
                  value={formData.usps?.feature2?.title || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    usps: {
                      ...formData.usps!,
                      feature2: { ...formData.usps!.feature2!, title: e.target.value }
                    }
                  })}
                  placeholder="Ultra-Quiet Motor"
                />
              </div>

              <div>
                <Label htmlFor="feature2-description">Beschrijving</Label>
                <Textarea
                  id="feature2-description"
                  value={formData.usps?.feature2?.description || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    usps: {
                      ...formData.usps!,
                      feature2: { ...formData.usps!.feature2!, description: e.target.value }
                    }
                  })}
                  placeholder="Werkt onder 40 decibel..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Feature 2 Afbeelding</Label>
                <ImageUpload
                  value={formData.usps?.feature2?.image ? [formData.usps.feature2.image] : []}
                  onChange={(images) => setFormData({
                    ...formData,
                    usps: {
                      ...formData.usps!,
                      feature2: { ...formData.usps!.feature2!, image: images[0] || '' }
                    }
                  })}
                  maxImages={1}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Detail USPs - DRY: 2 belangrijkste features */}
        <Card>
          <CardHeader>
            <CardTitle>Product Detail USPs (Productpagina)</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              2 belangrijkste features met zigzag layout onder de product video
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* USP 1 */}
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-lg">USP 1 - Automatische Functie</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usp1-icon">Icon</Label>
                  <select
                    id="usp1-icon"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.productUsps?.usp1?.icon || 'sparkles'}
                    onChange={(e) => setFormData({
                      ...formData,
                      productUsps: {
                        ...formData.productUsps!,
                        usp1: { ...formData.productUsps!.usp1!, icon: e.target.value }
                      }
                    })}
                  >
                    <option value="sparkles">✨ Sparkles</option>
                    <option value="shield">🛡️ Shield</option>
                    <option value="truck">🚚 Truck</option>
                    <option value="star">⭐ Star</option>
                    <option value="check">✓ Check</option>
                    <option value="zap">⚡ Zap</option>
                    <option value="package">📦 Package</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="usp1-color">Kleur</Label>
                  <select
                    id="usp1-color"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.productUsps?.usp1?.color || 'brand'}
                    onChange={(e) => setFormData({
                      ...formData,
                      productUsps: {
                        ...formData.productUsps!,
                        usp1: { ...formData.productUsps!.usp1!, color: e.target.value }
                      }
                    })}
                  >
                    <option value="brand">🔵 Blauw (Brand)</option>
                    <option value="blue">🔷 Lichtblauw</option>
                    <option value="accent">⚫ Zwart (Accent)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="usp1-title">Titel</Label>
                <Input
                  id="usp1-title"
                  value={formData.productUsps?.usp1?.title || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    productUsps: {
                      ...formData.productUsps!,
                      usp1: { ...formData.productUsps!.usp1!, title: e.target.value }
                    }
                  })}
                  placeholder="Volledig Automatisch met Dubbele Beveiliging"
                />
              </div>

              <div>
                <Label htmlFor="usp1-description">Beschrijving</Label>
                <Textarea
                  id="usp1-description"
                  value={formData.productUsps?.usp1?.description || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    productUsps: {
                      ...formData.productUsps!,
                      usp1: { ...formData.productUsps!.usp1!, description: e.target.value }
                    }
                  })}
                  placeholder="Zelfreinigende functie met dubbele veiligheidssensoren..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Afbeelding USP 1</Label>
                <ImageUpload
                  value={formData.productUsps?.usp1?.image ? [formData.productUsps.usp1.image] : []}
                  onChange={(images) => setFormData({
                    ...formData,
                    productUsps: {
                      ...formData.productUsps!,
                      usp1: { ...formData.productUsps!.usp1!, image: images[0] || '' }
                    }
                  })}
                  maxImages={1}
                />
              </div>
            </div>

            <Separator />

            {/* USP 2 */}
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-lg">USP 2 - Capaciteit</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usp2-icon">Icon</Label>
                  <select
                    id="usp2-icon"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.productUsps?.usp2?.icon || 'package'}
                    onChange={(e) => setFormData({
                      ...formData,
                      productUsps: {
                        ...formData.productUsps!,
                        usp2: { ...formData.productUsps!.usp2!, icon: e.target.value }
                      }
                    })}
                  >
                    <option value="sparkles">✨ Sparkles</option>
                    <option value="shield">🛡️ Shield</option>
                    <option value="truck">🚚 Truck</option>
                    <option value="star">⭐ Star</option>
                    <option value="check">✓ Check</option>
                    <option value="zap">⚡ Zap</option>
                    <option value="package">📦 Package</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="usp2-color">Kleur</Label>
                  <select
                    id="usp2-color"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.productUsps?.usp2?.color || 'brand'}
                    onChange={(e) => setFormData({
                      ...formData,
                      productUsps: {
                        ...formData.productUsps!,
                        usp2: { ...formData.productUsps!.usp2!, color: e.target.value }
                      }
                    })}
                  >
                    <option value="brand">🔵 Blauw (Brand)</option>
                    <option value="blue">🔷 Lichtblauw</option>
                    <option value="accent">⚫ Zwart (Accent)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="usp2-title">Titel</Label>
                <Input
                  id="usp2-title"
                  value={formData.productUsps?.usp2?.title || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    productUsps: {
                      ...formData.productUsps!,
                      usp2: { ...formData.productUsps!.usp2!, title: e.target.value }
                    }
                  })}
                  placeholder="10.5L XL Afvalbak Capaciteit"
                />
              </div>

              <div>
                <Label htmlFor="usp2-description">Beschrijving</Label>
                <Textarea
                  id="usp2-description"
                  value={formData.productUsps?.usp2?.description || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    productUsps: {
                      ...formData.productUsps!,
                      usp2: { ...formData.productUsps!.usp2!, description: e.target.value }
                    }
                  })}
                  placeholder="De grootste afvalbak in zijn klasse..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Afbeelding USP 2</Label>
                <ImageUpload
                  value={formData.productUsps?.usp2?.image ? [formData.productUsps.usp2.image] : []}
                  onChange={(images) => setFormData({
                    ...formData,
                    productUsps: {
                      ...formData.productUsps!,
                      usp2: { ...formData.productUsps!.usp2!, image: images[0] || '' }
                    }
                  })}
                  maxImages={1}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={updateMutation.isPending}
            leftIcon={updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          >
            {updateMutation.isPending ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </form>
    </div>
  );
}



