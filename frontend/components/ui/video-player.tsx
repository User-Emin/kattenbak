'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  type: 'hero' | 'product' | 'demo';
}

/**
 * Helper: Check if URL is YouTube or Vimeo
 */
function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

function isVimeoUrl(url: string): boolean {
  return /vimeo\.com/.test(url);
}

/**
 * Helper: Convert YouTube URL to embed URL
 */
function getYouTubeEmbedUrl(url: string): string {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

/**
 * Helper: Convert Vimeo URL to embed URL
 */
function getVimeoEmbedUrl(url: string): string {
  const videoId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}

/**
 * Universal Video Player
 * - Hero: autoplay, muted, loop, no controls
 * - Product: play button, full controls, sound
 * - Demo: same as product (DRY)
 * 
 * Supports: 
 * - Local MP4/WebM videos (up to 100MB)
 * - YouTube embeds
 * - Vimeo embeds
 */
export function VideoPlayer({
  videoUrl,
  posterUrl,
  autoplay = false,
  controls = true,
  muted = false,
  loop = false,
  className = '',
  type
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // DRY: Security - Prevent empty string in src
  if (!videoUrl || videoUrl.trim() === '') {
    return (
      <div className={`relative w-full bg-gray-100 flex items-center justify-center ${className}`}>
        <p className="text-gray-500 text-sm">Geen video beschikbaar</p>
      </div>
    );
  }

  // Check if YouTube or Vimeo
  const isYouTube = isYouTubeUrl(videoUrl);
  const isVimeo = isVimeoUrl(videoUrl);
  const isExternal = isYouTube || isVimeo;

  // If YouTube or Vimeo, use iframe
  if (isExternal) {
    const embedUrl = isYouTube 
      ? getYouTubeEmbedUrl(videoUrl) 
      : getVimeoEmbedUrl(videoUrl);

    return (
      <div className={`relative w-full aspect-video ${className}`}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video player"
        />
      </div>
    );
  }

  // Hero specifiek: altijd muted, loop, autoplay
  const isHero = type === 'hero';
  const finalMuted = isHero ? true : isMuted;
  const finalLoop = isHero ? true : loop;
  const finalControls = isHero ? false : controls;

  // WATERDICHT: NOOIT groene placeholder tonen als poster
  // Als posterUrl een placeholder is, gebruik GEEN poster
  const isPlaceholder = posterUrl && (
    posterUrl.includes('placeholder') || 
    posterUrl.includes('/images/hero') ||
    posterUrl.includes('/logo.png') ||
    posterUrl.includes('default')
  );
  const safePosterUrl = (!posterUrl || isPlaceholder) ? undefined : posterUrl;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      if (autoplay) {
        video.play().catch(() => setIsPlaying(false));
      }
    };

    video.addEventListener('canplay', handleCanPlay);
    return () => video.removeEventListener('canplay', handleCanPlay);
  }, [autoplay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  return (
    <div 
      className={`relative w-full ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={safePosterUrl}
        muted={finalMuted}
        loop={finalLoop}
        playsInline
        preload={isHero ? "auto" : "metadata"}
        controls={finalControls && !isHero}
        autoPlay={autoplay && isHero}
        style={{ backgroundColor: '#1a1a1a' }}
        key={`${videoUrl}-${Date.now()}`}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
      </video>

      {/* Custom controls voor hero */}
      {isHero && showControls && (
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <button
            onClick={togglePlay}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
      )}

      {/* Overlay voor product/demo video */}
      {!isHero && !isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
          aria-label="Speel video af"
        >
          <div className="w-20 h-20 bg-brand/90 hover:bg-brand rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-2xl">
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </div>
        </button>
      )}

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent" />
        </div>
      )}
    </div>
  );
}
