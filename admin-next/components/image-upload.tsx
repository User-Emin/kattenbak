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
    // ✅ OVERSCHRIJVING BEVESTIGING: Check of er bestaande afbeeldingen zijn die overschreven worden
    if (value.length > 0 && files.length > 0) {
      const willOverwrite = value.length + files.length > maxImages;
      if (willOverwrite) {
        const overwriteCount = (value.length + files.length) - maxImages;
        const confirmed = window.confirm(
          `⚠️ OVERSCHRIJVING BEVESTIGING\n\n` +
          `Je uploadt ${files.length} nieuwe afbeelding(en), maar er is ruimte voor ${maxImages - value.length}.\n\n` +
          `${overwriteCount} bestaande afbeelding(en) zullen worden overschreven.\n\n` +
          `Weet je zeker dat je door wilt gaan?`
        );
        if (!confirmed) {
          return;
        }
      }
    }
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    // ✅ OVERSCHRIJVING BEVESTIGING: Check of er bestaande afbeeldingen zijn die overschreven worden
    if (value.length > 0 && files.length > 0) {
      const willOverwrite = value.length + files.length > maxImages;
      if (willOverwrite) {
        const overwriteCount = (value.length + files.length) - maxImages;
        const confirmed = window.confirm(
          `⚠️ OVERSCHRIJVING BEVESTIGING\n\n` +
          `Je uploadt ${files.length} nieuwe afbeelding(en), maar er is ruimte voor ${maxImages - value.length}.\n\n` +
          `${overwriteCount} bestaande afbeelding(en) zullen worden overschreven.\n\n` +
          `Weet je zeker dat je door wilt gaan?`
        );
        if (!confirmed) {
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
      }
    }
    handleFiles(files);
  };

  // ✅ STABLE: Real file upload handler with better state management
  const handleFiles = async (files: File[]) => {
    // ✅ SECURITY: Pre-validate file sizes before upload (client-side check)
    const MAX_FILE_SIZE_MB = 20;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        toast.error(`Bestand te groot: ${file.name} (${fileSizeMB}MB). Maximum ${MAX_FILE_SIZE_MB}MB per afbeelding.`);
        return;
      }
    }
    // Filter image files only
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Geen geldige afbeeldingen geselecteerd');
      return;
    }

    // ✅ OVERSCHRIJVING: Als max overschreden, trim tot max (eerste afbeeldingen blijven)
    let finalImages = [...value];
    if (value.length + imageFiles.length > maxImages) {
      // Trim bestaande afbeeldingen tot er ruimte is voor nieuwe
      const spaceAvailable = maxImages - imageFiles.length;
      finalImages = value.slice(0, Math.max(0, spaceAvailable));
      
      const removedCount = value.length - finalImages.length;
      if (removedCount > 0) {
        toast.info(`${removedCount} bestaande afbeelding(en) verwijderd om ruimte te maken voor nieuwe uploads.`);
      }
    }

    // ✅ STABLE: Lock state to prevent concurrent uploads
    if (isUploading) {
      toast.warning('Upload al bezig, even geduld...');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(`Uploaden ${imageFiles.length} afbeelding(en)...`);

      // ✅ STABLE: Upload files sequentially to prevent haperen
      const uploadedUrls = await uploadImages(imageFiles);
      
      // ✅ OVERSCHRIJVING: Combineer getrimde bestaande afbeeldingen met nieuwe uploads
      const updatedImages = [...finalImages, ...uploadedUrls];
      
      // ✅ STABLE: Call onChange immediately to persist state
      onChange(updatedImages);

      // ✅ SUCCESS: Show success message with count en overschrijving info
      const overwriteInfo = finalImages.length < value.length 
        ? ` (${value.length - finalImages.length} oude afbeelding(en) overschreven)`
        : '';
      toast.success(`${uploadedUrls.length} afbeelding(en) succesvol geüpload!${overwriteInfo}`);
    } catch (error: any) {
      console.error('Upload error:', error);
      // ✅ BETTER ERROR HANDLING: Show detailed error message
      const errorMessage = error?.message || error?.details?.error || error?.details?.message || 'Onbekende fout';
      const networkError = error?.status === 0 || error?.code === 'ERR_NETWORK' 
        ? 'Netwerkfout: Kan geen verbinding maken met de server. Controleer je internetverbinding.' 
        : null;
      toast.error(networkError || `Upload mislukt: ${errorMessage}`);
      
      // ✅ STABLE: Don't clear state on error - keep existing images
      // State remains unchanged, user can retry
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
          {value.filter(img => img && img.trim() !== '').map((image, index) => {
            // ✅ Na 4e upload: volledig plaatje zichtbaar (object-contain), anders object-cover
            const isAfterFourth = index >= 4;
            const objectFit = isAfterFourth ? 'object-contain' : 'object-cover';
            const bgColor = isAfterFourth ? 'bg-gray-900' : 'bg-muted';
            
            return (
              <div
                key={index}
                className={`relative aspect-square rounded-lg border overflow-hidden group ${bgColor}`}
              >
                {image && image.trim() ? (
                  <img
                    src={
                      // Support absolute URLs (http/https), data URIs, and relative paths
                      image.startsWith('http') || image.startsWith('data:') 
                        ? image 
                        : `${typeof window !== 'undefined' ? window.location.origin : ''}${image.startsWith('/') ? image : '/' + image}`
                    }
                    alt={`Afbeelding ${index + 1}`}
                    className={`w-full h-full ${objectFit}`}
                    onError={(e) => {
                      // Fallback for broken images
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/666/fff?text=Fout';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
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
            );
          })}
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
