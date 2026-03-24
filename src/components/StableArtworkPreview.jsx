import React from 'react';
import { ARTWORK_FALLBACK_URL, useValidatedImageUrl } from '../lib/artworkMedia.js';

export default function StableArtworkPreview({
  src,
  alt = 'Seedbar artwork',
  className = '',
  imgClassName = 'h-full w-full object-cover',
}) {
  const safeUrl = useValidatedImageUrl(src, ARTWORK_FALLBACK_URL);

  return (
    <img
      src={safeUrl}
      alt={alt}
      className={`${imgClassName} ${className}`.trim()}
      loading="lazy"
      decoding="async"
    />
  );
}
