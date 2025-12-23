/**
 * VIDEO UPLOAD COMPONENT - ADMIN
 * Ondersteuning:
 * - Lokale video upload (MP4, WebM, MOV, etc.)
 * - YouTube/Vimeo URL
 * - Drag & drop
 * - File size validation
 * - Secure, DRY, maintainable
 */

'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Video, X, CheckCircle, AlertCircle, Youtube, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoUploadProps {
  value?: string; // Current video URL or path
  onChange: (url: string) => void;
  maxSizeMB?: number;
}

export function VideoUpload({ value = '', onChange, maxSizeMB = 100 }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [mode, setMode] = useState<'upload' | 'url'>(value && (value.includes('youtube.com') || value.includes('vimeo.com')) ? 'url' : 'upload');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed video formats
  const ALLOWED_FORMATS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  const ALLOWED_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];

  // Validate video URL (YouTube/Vimeo OR local /uploads/ path)
  const isValidVideoUrl = (url: string): boolean => {
    const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
    const localVideoRegex = /^\/uploads\/videos\/.+\.(mp4|webm|mov|avi|mkv|m4v)$/;
    return youtubeRegex.test(url) || vimeoRegex.test(url) || localVideoRegex.test(url);
  };

  // Handle file selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  // Handle drag & drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFile(file);
    }
  };

  // Process video file
  const handleFile = async (file: File) => {
    setError(null);

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(`Ongeldig bestandstype. Gebruik: ${ALLOWED_FORMATS.join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`Bestand te groot (${fileSizeMB.toFixed(1)}MB). Maximum: ${maxSizeMB}MB`);
      return;
    }

    // Upload to backend
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      // Simulate upload progress (replace with actual upload to /api/v1/admin/upload/video)
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          const videoUrl = response.data?.url || response.url;
          onChange(videoUrl);
          setIsUploading(false);
        } else {
          throw new Error('Upload mislukt');
        }
      });

      xhr.addEventListener('error', () => {
        setError('Upload mislukt. Probeer opnieuw.');
        setIsUploading(false);
      });

      xhr.open('POST', '/api/v1/admin/upload/video');
      
      // Add auth token from localStorage
      const token = localStorage.getItem('auth_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.send(formData);

    } catch (err: any) {
      setError(err.message || 'Upload mislukt');
      setIsUploading(false);
    }
  };

  // Handle URL input
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError('Voer een geldige URL in');
      return;
    }

    if (!isValidVideoUrl(urlInput)) {
      setError('Ongeldige video URL. Gebruik YouTube of Vimeo.');
      return;
    }

    onChange(urlInput);
    setError(null);
  };

  // Remove video
  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('upload')}
        >
          <Upload className="h-4 w-4 mr-2" />
          Bestand uploaden
        </Button>
        <Button
          type="button"
          variant={mode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('url')}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          YouTube/Vimeo URL
        </Button>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && !value && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_FORMATS.join(',')}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="space-y-3">
              <Video className="h-12 w-12 mx-auto text-accent animate-pulse" />
              <div className="space-y-1">
                <p className="font-medium">Uploaden... {uploadProgress.toFixed(0)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <Video className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Sleep video hierheen of klik om te selecteren
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Ondersteund: {ALLOWED_FORMATS.join(', ')} (max {maxSizeMB}MB)
              </p>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecteer bestand
              </Button>
            </>
          )}
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && !value && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... of https://vimeo.com/..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Toevoegen
            </Button>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Youtube className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>Plak een YouTube of Vimeo URL om de video te embedden</p>
          </div>
        </div>
      )}

      {/* Current Video Preview */}
      {value && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 mb-1">Video toegevoegd</p>
                <p className="text-xs text-gray-500 truncate">{value}</p>
                {isValidVideoUrl(value) && (
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Geldige video URL</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Preview */}
          {value && value.trim() !== '' && (
            <div className="mt-4 aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {value.includes('youtube') || value.includes('youtu.be') ? (
                <iframe
                  src={value.includes('youtube') 
                    ? `https://www.youtube.com/embed/${value.split('v=')[1]?.split('&')[0]}`
                    : `https://www.youtube.com/embed/${value.split('youtu.be/')[1]?.split('?')[0]}`
                  }
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : value.includes('vimeo') ? (
                <iframe
                  src={`https://player.vimeo.com/video/${value.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1]}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={value || undefined} 
                  controls 
                  className="w-full h-full"
                  onError={(e) => {
                    console.error('Video load error:', value);
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}


