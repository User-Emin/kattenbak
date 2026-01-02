"use client";

import { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';
import { getFallbackImage } from '@/lib/demo-images';

interface ProductImageProps {
  src: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  enableZoom?: boolean;
  zoomScale?: number;
}

/**
 * PROFESSIONAL IMAGE ZOOM - HOVER TO ZOOM
 * DRY, dynamisch, maintainable
 * 
 * Features:
 * - Hover → Instant zoom on that area (like e-commerce sites)
 * - Smooth lens effect following mouse
 * - Click → Full-screen lightbox with zoom
 * - ESC key close
 * - Professional UX
 */
export function ProductImage({ 
  src, 
  alt, 
  fill = false, 
  className = '', 
  priority = false,
  width,
  height,
  enableZoom = false,
  zoomScale = 2.5
}: ProductImageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // DRY: Use fallback from demo-images (sync met backend)
  // MAXIMAAL DYNAMISCH: Eerst API, dan demo fallback
  const imageSrc = src || getFallbackImage();
  
  // WATERDICHT FIX: Disable Next.js optimization for /uploads/ paths (served by nginx)
  const isUploadPath = imageSrc.startsWith('/uploads/');

  // Open lightbox on click
  const handleImageClick = () => {
    if (enableZoom) {
      setIsLightboxOpen(true);
      setIsHovering(false);
      document.body.style.overflow = 'hidden';
    }
  };

  // Close lightbox
  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setMousePosition({ x: 50, y: 50 });
    document.body.style.overflow = 'auto';
  };

  // Mouse tracking for hover zoom
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !enableZoom) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setMousePosition({ x: clampedX, y: clampedY });
  };

  const handleMouseEnter = () => {
    if (enableZoom) setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 50, y: 50 });
  };

  // Keyboard ESC to close lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleCloseLightbox();
  };

  const transformOrigin = `${mousePosition.x}% ${mousePosition.y}%`;
  const baseClassName = className || 'object-cover';

  // Main image with hover zoom
  const imageElement = (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleImageClick}
    >
      {fill ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          unoptimized={isUploadPath}
          className={`${baseClassName} transition-transform duration-200 ease-out ${
            enableZoom ? 'cursor-zoom-in' : ''
          }`}
          style={{
            transform: isHovering ? `scale(${zoomScale})` : 'scale(1)',
            transformOrigin: transformOrigin,
          }}
          priority={priority}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={width || 800}
          height={height || 800}
          unoptimized={isUploadPath}
          className={`${baseClassName} transition-transform duration-200 ease-out ${
            enableZoom ? 'cursor-zoom-in' : ''
          }`}
          style={{
            transform: isHovering ? `scale(${zoomScale})` : 'scale(1)',
            transformOrigin: transformOrigin,
          }}
          priority={priority}
        />
      )}
      
      {/* Zoom hint icon */}
      {enableZoom && !isHovering && (
        <div className="absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-opacity">
          <ZoomIn className="h-5 w-5" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Main image with hover zoom */}
      {imageElement}

      {/* LIGHTBOX MODAL - Voor full screen view */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={handleCloseLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={handleCloseLightbox}
            className="absolute top-6 right-6 z-[10000] bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all"
            aria-label="Sluiten"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Large image in lightbox */}
          <div
            className="relative max-w-6xl max-h-[90vh] w-full h-full mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={imageSrc}
                alt={alt}
                fill
                unoptimized={isUploadPath}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm text-center">
            <p>ESC of klik buiten om te sluiten</p>
          </div>
        </div>
      )}
    </>
  );
}
