'use client';

import { cn } from '@/lib/utils';

export interface FeatureImageRoundedProps {
  src: string;
  alt: string;
  /** Buitenste wrapper: layout (bijv. w-full, max-w-sm) */
  className?: string;
  /** aspect-[3/4] md:aspect-[4/5] – ZELFDE container als productafbeelding */
  innerClassName?: string;
  /** Ronde hoeken – uit config (bijv. rounded-xl md:rounded-2xl) voor zigzag duidelijkheid */
  borderRadiusClassName?: string;
  objectFit?: 'cover' | 'contain';
  /** object-position uit config – horizontale kant meer zichtbaar */
  objectPositionClassName?: string;
  sizes?: string;
  quality?: number;
  unoptimized?: boolean;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Zigzag-afbeelding – FUNDAMENTEEL ZELFDE als productafbeelding:
 * Eén wrapper met rounded-lg + overflow-hidden, één img die de container vult.
 * Geen background-image, geen extra lagen. Zo werkt de productafbeelding ook.
 */
export function FeatureImageRounded({
  src,
  alt,
  className,
  innerClassName,
  borderRadiusClassName = 'rounded-lg',
  objectFit = 'contain',
  objectPositionClassName = 'object-center',
  onError,
  sizes: _sizes,
  quality: _quality,
  unoptimized: _unoptimized,
  priority: _priority,
}: FeatureImageRoundedProps) {
  return (
    <div
      className={cn(
        'feature-image-rounded relative w-full overflow-hidden bg-white',
        borderRadiusClassName,
        innerClassName,
        className
      )}
      data-feature-image
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          'absolute inset-0 h-full w-full',
          objectFit === 'cover' ? 'object-cover' : 'object-contain',
          objectPositionClassName
        )}
        loading="lazy"
        decoding="async"
        onError={onError}
      />
    </div>
  );
}
