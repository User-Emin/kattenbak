/**
 * PRODUCT FORM - DRY Reusable Form Component
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/image-upload';
import { VideoUpload } from '@/components/video-upload';
import { VariantManager } from '@/components/variant-manager';
import { Badge } from '@/components/ui/badge';
import { Product, ProductFormData } from '@/types/product';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { productValidationSchema } from '@/lib/validation/product.schema';

// DRY: Video URL validation helper
function isValidVideoUrl(url: string): boolean {
  if (!url) return true;
  const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  return youtubeRegex.test(url) || vimeoRegex.test(url);
}

// DRY: Use centralized validation schema with security
const productSchema = productValidationSchema;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      sku: initialData.sku,
      name: initialData.name,
      slug: initialData.slug,
      description: initialData.description,
      shortDescription: initialData.shortDescription,
      price: initialData.price,
      compareAtPrice: initialData.compareAtPrice || 0,
      costPrice: initialData.costPrice || 0,
      stock: initialData.stock,
      lowStockThreshold: initialData.lowStockThreshold || 10,
      trackInventory: initialData.trackInventory,
      weight: initialData.weight || 0,
      dimensions: initialData.dimensions || { length: 0, width: 0, height: 0 },
      images: initialData.images,
      videoUrl: initialData.videoUrl || '', // DRY: Video URL
      variants: initialData.variants || [], // DRY: Variants
      metaTitle: initialData.metaTitle || '',
      metaDescription: initialData.metaDescription || '',
      isActive: initialData.isActive,
      isFeatured: initialData.isFeatured,
    } : {
      sku: '',
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      price: 0,
      compareAtPrice: 0,
      costPrice: 0,
      stock: 0,
      lowStockThreshold: 10,
      trackInventory: true,
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      images: [],
      videoUrl: '', // DRY: Default empty
      variants: [], // DRY: Default empty
      metaTitle: '',
      metaDescription: '',
      isActive: true,
      isFeatured: false,
    },
  });

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    if (!initialData) { // Only auto-generate for new products
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', slug);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">Basisgegevens</h2>
              {initialData && (
                <Badge variant="outline">ID: {initialData.id}</Badge>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="KB-AUTO-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naam *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Automatische Kattenbak Premium"
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="automatische-kattenbak-premium" />
                  </FormControl>
                  <FormDescription>
                    URL-vriendelijke versie van de naam
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Korte Beschrijving *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Zelfreinigende kattenbak met app-bediening"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volledige Beschrijving *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Uitgebreide productbeschrijving..."
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">Afbeeldingen</h2>
            
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Afbeeldingen *</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      maxImages={10}
                    />
                  </FormControl>
                  <FormDescription>
                    Sleep afbeeldingen of voeg URLs toe (minimaal 1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* ✅ DRY: Video Upload Field - YouTube/Vimeo + Lokale bestanden */}
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Demo Video</FormLabel>
                  <FormControl>
                    <VideoUpload
                      value={field.value}
                      onChange={field.onChange}
                      maxFileSize={50}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload een video bestand (MP4, WebM, OGG) of voeg een YouTube/Vimeo link toe.
                    Video verschijnt op product pagina en homepage (als featured product).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Variants - Color/Size Options */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">Varianten (Kleuren/Maten)</h2>
            
            <FormField
              control={form.control}
              name="variants"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <VariantManager
                      variants={field.value || []}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Voeg kleur- of maatopties toe. Elke variant kan een eigen prijs, voorraad en afbeeldingen hebben.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">Prijzen</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verkoopprijs *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="299.99" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compareAtPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Was-prijs</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="399.99" />
                    </FormControl>
                    <FormDescription>Voor kortingen</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kostprijs</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="250.00" />
                    </FormControl>
                    <FormDescription>Interne kostprijs</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">Voorraad</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voorraad *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="15" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laag-voorraad drempel</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="10" />
                    </FormControl>
                    <FormDescription>Waarschuwing bij lage voorraad</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status & Actions */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">Status</h2>

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="!m-0 cursor-pointer">Actief</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="!m-0 cursor-pointer">Uitgelicht</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opslaan...
              </>
            ) : (
              'Opslaan'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

