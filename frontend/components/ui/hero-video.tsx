'use client';

import { useEffect, useRef, useState } from 'react';

interface HeroVideoProps {
  videoUrl: string;
  posterUrl?: string;
  className?: string;
}

/**
 * Geoptimaliseerde Hero Video Component
 * - Autoplay, muted, loop
 * - Lazy loading
 * - Fallback naar poster
 * - Maximale performance
 */
export function HeroVideo({ videoUrl, posterUrl, className = '' }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Probeer video te laden
    const handleCanPlay = () => setIsLoaded(true);
    const handleError = () => setHasError(true);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Start playback
    video.play().catch(() => setHasError(true));

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError && posterUrl) {
    // Fallback naar poster image
    return (
      <img
        src={posterUrl}
        alt="Hero"
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className={`w-full h-full object-cover ${className}`}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={posterUrl}
    >
      <source src={videoUrl} type="video/mp4" />
      <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
    </video>
  );
}
