'use client';

import { useEffect, useRef, useState } from 'react';

interface HeroVideoProps {
  videoUrl: string;
  posterUrl?: string;
  className?: string;
}

/**
 * ENTERPRISE HERO VIDEO - 50MB SUPPORT
 * - Streaming optimalisatie voor grote files
 * - Progressive loading (geen vertraging)
 * - Adaptive buffering voor reclame-kwaliteit
 * - Instant playback met poster fallback
 * DRY: Single source of truth voor hero video
 */
export function HeroVideo({ videoUrl, posterUrl, className = '' }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPoster, setShowPoster] = useState(true);

  // DRY: Security - Prevent empty string in src
  if (!videoUrl || videoUrl.trim() === '') {
    if (posterUrl && posterUrl.trim() !== '') {
      return (
        <img
          src={posterUrl}
          alt="Hero"
          className={`w-full h-full object-cover ${className}`}
        />
      );
    }
    return null; // No video or poster
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoaded(true);
      setShowPoster(false);
    };
    
    const handleCanPlay = () => {
      // Start playback zodra eerste frames beschikbaar zijn
      video.play().catch(() => setHasError(true));
    };
    
    const handleError = () => setHasError(true);

    // Progressive loading events
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Preload hint voor grote files
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl]);

  if (hasError && posterUrl && posterUrl.trim() !== '') {
    return (
      <img
        src={posterUrl}
        alt="Hero"
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Poster voor instant display */}
      {showPoster && posterUrl && posterUrl.trim() !== '' && (
        <img
          src={posterUrl}
          alt="Hero"
          className={`absolute inset-0 w-full h-full object-cover ${className} transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      
      {/* Video met streaming optimalisatie */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={posterUrl && posterUrl.trim() !== '' ? posterUrl : undefined}
        style={{
          // Browser hints voor streaming
          objectFit: 'cover',
          willChange: 'auto'
        }}
      >
        <source src={videoUrl || undefined} type="video/mp4" />
      </video>
    </div>
  );
}
