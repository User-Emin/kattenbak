'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Film } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept: string; // e.g., "image/*" or "video/*"
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  helpText?: string;
}

export function FileUpload({ label, accept, currentUrl, onUpload, helpText }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = accept.includes('video');
  const isImage = accept.includes('image');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // Show preview
      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else if (isVideo) {
        setPreview(URL.createObjectURL(file));
      }

      // Upload to backend
      const formData = new FormData();
      formData.append('file', file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://catsupply.nl';
      // Use /upload/image for both images and videos (backend supports both)
      const uploadUrl = API_URL.includes('/api/v1') 
        ? `${API_URL}/upload/image` 
        : `${API_URL}/api/v1/upload/image`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Get the URL from response
      const uploadedUrl = isImage ? result.data.urls.large : result.data.url;
      
      onUpload(uploadedUrl);
      setPreview(uploadedUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-900">
        {label}
      </label>

      {preview ? (
        <div className="relative">
          {isImage ? (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={preview}
                alt={label}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Check if it's a YouTube URL */}
              {preview.includes('youtube.com') || preview.includes('youtu.be') ? (
                <iframe
                  src={preview}
                  className="w-full h-48 rounded-lg border-2 border-gray-200"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="w-full h-48 bg-black rounded-lg"
                />
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition z-10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-gray-50 transition flex flex-col items-center justify-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              <span className="text-sm text-gray-600">Uploaden...</span>
            </>
          ) : (
            <>
              {isImage ? <ImageIcon className="h-8 w-8 text-gray-400" /> : <Film className="h-8 w-8 text-gray-400" />}
              <span className="text-sm font-medium text-gray-600">Klik om {isImage ? 'afbeelding' : 'video'} te uploaden</span>
              <span className="text-xs text-gray-500">{isImage ? 'PNG, JPG, WebP (max 10MB)' : 'MP4, MOV (max 100MB)'}</span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {helpText && <p className="text-sm text-gray-500">{helpText}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

