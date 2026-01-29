'use client';

import { cn } from '@/lib/utils';
import { ZIGZAG_IMAGE_RADIUS } from '@/lib/product-page-config';

export interface FeatureImageRoundedProps {
  src: string;
  alt: string;
  /** Buitenste wrapper: layout (bijv. w-full, max-w-sm, aspect) */
  className?: string;
  /** aspect-[3/4] md:aspect-[4/5] of h-64 md:h-80 */
  innerClassName?: string;
  objectFit?: 'cover' | 'contain';
  sizes?: string;
  quality?: number;
  unoptimized?: boolean;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Zigzag/feature afbeelding met gegarandeerde ronde hoeken (10.5L Afvalbak, Gratis meegeleverd).
 * Gebruikt background-image op een div – geen <img>, dus geen element dat buiten de
 * border-radius kan vallen. De afbeelding ís de achtergrond van de ronde div.
 */
export function FeatureImageRounded({
  src,
  alt,
  className,
  innerClassName,
  objectFit = 'contain',
  onError,
  sizes: _sizes,
  quality: _quality,
  unoptimized: _unoptimized,
  priority: _priority,
}: FeatureImageRoundedProps) {
  const radius = ZIGZAG_IMAGE_RADIUS;

  return (
    <div
      className={cn('feature-image-rounded block overflow-hidden rounded-lg', className)}
      data-feature-image
      style={{
        borderRadius: radius,
        overflow: 'hidden',
      } as React.CSSProperties}
    >
      {/* Zelfde ronde hoeken als productafbeelding (rounded-lg) */}
      <div
        className={cn('relative w-full overflow-hidden bg-white rounded-lg', innerClassName)}
        style={{
          borderRadius: radius,
          overflow: 'hidden',
          backgroundImage: `url(${src})`,
          backgroundSize: objectFit === 'cover' ? 'cover' : 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        } as React.CSSProperties}
        role="img"
        aria-label={alt}
      >
        {/* Fallback: onzichtbare img voor accessibility en onError */}
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
          loading="lazy"
          decoding="async"
          onError={onError}
        />
      </div>
    </div>
  );
}
