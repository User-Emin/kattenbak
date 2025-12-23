/**
 * IMAGE UPLOAD COMPONENT - DRY met Real File Upload
 * Transparant: Files → Upload → Public URLs → Save
 */

'use client';

import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadImages } from '@/lib/api/upload';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ value = [], onChange, maxImages = 10 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  // DRY: Real file upload handler
  const handleFiles = async (files: File[]) => {
    // Filter image files only
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Geen geldige afbeeldingen geselecteerd');
      return;
    }

    // Check max limit
    if (value.length + imageFiles.length > maxImages) {
      toast.error(`Maximaal ${maxImages} afbeeldingen toegestaan`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(`Uploaden ${imageFiles.length} afbeelding(en)...`);

      // Upload files to backend
      const uploadedUrls = await uploadImages(imageFiles);
      
      // Add uploaded URLs to existing images
      const updatedImages = [...value, ...uploadedUrls];
      onChange(updatedImages);

      toast.success(`${imageFiles.length} afbeelding(en) geüpload!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Upload mislukt: ' + (error.message || 'Onbekende fout'));
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleAddUrl = () => {
    const url = prompt('Voer een image URL in:');
    if (url && url.trim()) {
      // Validate URL format
      try {
        new URL(url);
        onChange([...value, url.trim()]);
      } catch {
        toast.error('Ongeldige URL');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isUploading ? 'opacity-50 cursor-not-allowed' : '',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-primary mb-4 animate-spin" />
            <p className="text-sm font-medium mb-1">{uploadProgress}</p>
            <p className="text-xs text-muted-foreground">Even geduld...</p>
          </>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">
              Sleep afbeeldingen hier, of klik om te selecteren
            </p>
            <p className="text-xs text-muted-foreground">
              Maximaal {maxImages} afbeeldingen • Upload naar server
            </p>
          </>
        )}
      </div>

      {/* Image previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.filter(img => img && img.trim() !== '').map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg border bg-muted overflow-hidden group"
            >
              <img
                src={image || 'https://placehold.co/400x400/666/fff?text=Geen+afbeelding'}
                alt={`Afbeelding ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback for broken images
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/666/fff?text=Fout';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add URL button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddUrl}
        disabled={value.length >= maxImages || isUploading}
      >
        <ImageIcon className="mr-2 h-4 w-4" />
        Voeg URL toe
      </Button>

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        💡 Tip: Upload files worden naar de server gestuurd en krijgen een permanente URL
      </p>
    </div>
  );
}
