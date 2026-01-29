'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ZIGZAG_IMAGE_RADIUS } from '@/lib/product-page-config';

const BLUR_PLACEHOLDER =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

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
  priority?: boolean;
  unoptimized?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Zigzag/feature afbeelding met gegarandeerde ronde hoeken (10.5L Afvalbak, Gratis meegeleverd, etc.).
 * Eén component = één CSS-class feature-image-rounded = max specificiteit in globals.css.
 */
export function FeatureImageRounded({
  src,
  alt,
  className,
  innerClassName,
  objectFit = 'contain',
  sizes = '(max-width: 768px) 100vw, 50vw',
  quality = 80,
  priority = false,
  unoptimized = false,
  onError,
}: FeatureImageRoundedProps) {
  const radius = ZIGZAG_IMAGE_RADIUS;
  const clipStyle = {
    borderRadius: radius,
    overflow: 'hidden' as const,
    clipPath: `inset(0 round ${radius})`,
    WebkitClipPath: `inset(0 round ${radius})`,
  } as React.CSSProperties;
  return (
    <div
      className={cn('feature-image-rounded', className)}
      data-feature-image
      style={{
        borderRadius: radius,
        overflow: 'hidden',
        display: 'block',
        ...clipStyle,
      } as React.CSSProperties}
    >
      <div
        className={cn('relative w-full overflow-hidden', innerClassName)}
        style={{ ...clipStyle } as React.CSSProperties}
      >
        {/* Clip-wrapper: force rounded corners on Next/Image output (span + img) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ ...clipStyle } as React.CSSProperties}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className={cn(objectFit === 'cover' ? 'object-cover' : 'object-contain', 'feature-image-rounded-img')}
            style={{ borderRadius: radius } as React.CSSProperties}
            sizes={sizes}
            quality={quality}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            unoptimized={unoptimized}
            onError={onError}
          />
        </div>
      </div>
    </div>
  );
}
