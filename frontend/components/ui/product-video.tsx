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
 * Gebruikt voor: Product detail pagina + Homepage hero
 * Maximaal dynamisch, geen redundantie
 */
export function ProductVideo({ videoUrl, productName, className = '' }: ProductVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID from YouTube URL
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  if (!videoId) {
    return null;
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

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
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
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
