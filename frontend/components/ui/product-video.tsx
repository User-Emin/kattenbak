'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface ProductVideoProps {
  videoUrl: string;
  productName: string;
  className?: string;
}

/**
 * DRY Product Video Component
 * Ondersteunt: YouTube + Vimeo URLs + Lokale video bestanden (MP4, WebM, etc.)
 * Gebruikt voor: Product detail pagina + Homepage hero
 * Maximaal dynamisch, geen redundantie
 */
export function ProductVideo({ videoUrl, productName, className = '' }: ProductVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // DRY: Security - Prevent empty string in src
  if (!videoUrl || videoUrl.trim() === '') {
    return null; // Don't render anything if no video
  }

  // Check if it's a local video file (MP4, WebM, OGG, etc.)
  const isLocalVideo = /\.(mp4|webm|ogg|mov)$/i.test(videoUrl);
  
  // Check if it's a YouTube URL
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Check if it's a Vimeo URL
  const getVimeoId = (url: string): string | null => {
    const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(videoUrl);
  const vimeoId = getVimeoId(videoUrl);

  // Render local video file
  if (isLocalVideo) {
    return (
      <div className={`relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 ${className}`}>
        <video
          src={videoUrl || undefined}
          poster={videoUrl ? `${videoUrl.replace(/\.[^.]+$/, '')}-thumbnail.jpg` : undefined}
          controls
          className="w-full h-full object-cover"
          preload="metadata"
        >
          <source src={videoUrl || undefined} type={`video/${videoUrl.split('.').pop()}`} />
          Je browser ondersteunt geen HTML5 video.
        </video>
        
        {/* Video Badge */}
        <div 
          className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-sm font-medium"
          style={{
            background: 'linear-gradient(135deg, rgba(60, 60, 61, 0.7) 0%, rgba(122, 122, 125, 0.7) 100%)', // ✅ GRADIENT met opacity (was bg-black/70)
          }}
        >
          🎥 Demo Video
        </div>
      </div>
    );
  }

  // Render YouTube video
  if (youtubeId) {
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;

    return (
      <div className={`relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 ${className}`}>
        {!isPlaying ? (
          <>
            {/* Video Thumbnail */}
            <img
              src={thumbnailUrl}
              alt={`${productName} demo video`}
              className="w-full h-full object-cover"
            />
            
            {/* Play Button Overlay */}
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
              aria-label={`Speel ${productName} demo video af`}
            >
              <div className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-2xl">
                <Play className="w-10 h-10 text-white ml-1" fill="white" />
              </div>
            </button>

            {/* Video Badge */}
            <div 
          className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-sm font-medium"
          style={{
            background: 'linear-gradient(135deg, rgba(60, 60, 61, 0.7) 0%, rgba(122, 122, 125, 0.7) 100%)', // ✅ GRADIENT met opacity (was bg-black/70)
          }}
        >
              🎥 Demo Video
            </div>
          </>
        ) : (
          /* YouTube Embed */
          <iframe
            src={embedUrl}
            title={`${productName} demo video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        )}
      </div>
    );
  }

  // Render Vimeo video
  if (vimeoId) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=${isPlaying ? 1 : 0}`;

    return (
      <div className={`relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 ${className}`}>
        {!isPlaying ? (
          <>
            {/* Vimeo Thumbnail */}
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-20 h-20 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform shadow-2xl"
                aria-label={`Speel ${productName} demo video af`}
              >
                <Play className="w-10 h-10 text-white ml-1" fill="white" />
              </button>
            </div>

            {/* Video Badge */}
            <div 
          className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-sm font-medium"
          style={{
            background: 'linear-gradient(135deg, rgba(60, 60, 61, 0.7) 0%, rgba(122, 122, 125, 0.7) 100%)', // ✅ GRADIENT met opacity (was bg-black/70)
          }}
        >
              🎥 Demo Video
            </div>
          </>
        ) : (
          /* Vimeo Embed */
          <iframe
            src={embedUrl}
            title={`${productName} demo video`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        )}
      </div>
    );
  }

  // Invalid URL
  return null;
}


