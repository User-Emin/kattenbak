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
  /** Niet gebruikt bij native img – alleen voor backwards compatibility met callers */
  sizes?: string;
  quality?: number;
  unoptimized?: boolean;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Zigzag/feature afbeelding met gegarandeerde ronde hoeken (10.5L Afvalbak, Gratis meegeleverd, etc.).
 * Gebruikt gewone <img> in één wrapper – geen Next/Image span, zodat border-radius + overflow
 * direct op de afbeelding werken. Ronde hoeken zitten in de afbeeldingweergave zelf.
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
      className={cn('feature-image-rounded block overflow-hidden', className)}
      data-feature-image
      style={{
        borderRadius: radius,
        overflow: 'hidden',
      } as React.CSSProperties}
    >
      {/* Eén wrapper: aspect-ratio + overflow hidden. Geen Next/Image = geen span die clipping breekt. */}
      <div
        className={cn('relative w-full overflow-hidden', innerClassName)}
        style={{
          borderRadius: radius,
          overflow: 'hidden',
        } as React.CSSProperties}
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            'absolute inset-0 h-full w-full',
            objectFit === 'cover' ? 'object-cover' : 'object-contain'
          )}
          style={{
            borderRadius: radius,
            display: 'block',
          } as React.CSSProperties}
          loading="lazy"
          decoding="async"
          onError={onError}
        />
      </div>
    </div>
  );
}
