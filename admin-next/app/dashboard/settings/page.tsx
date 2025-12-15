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
    if (settings) {
      setFormData(settings);
    }
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



