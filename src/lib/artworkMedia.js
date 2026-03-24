import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from './apiClient.js';

export const ARTWORK_FALLBACK_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#171126"/>
      <stop offset="50%" stop-color="#26184a"/>
      <stop offset="100%" stop-color="#0f1724"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <circle cx="260" cy="240" r="180" fill="rgba(91,19,236,0.22)"/>
  <circle cx="900" cy="540" r="220" fill="rgba(59,130,246,0.18)"/>
  <rect x="180" y="180" width="840" height="440" rx="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)"/>
  <text x="600" y="360" fill="#f8fafc" font-family="Arial, sans-serif" font-size="54" text-anchor="middle" letter-spacing="6">SEEDBAR</text>
  <text x="600" y="430" fill="#94a3b8" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" letter-spacing="4">PERFORMANCE ARTWORK</text>
</svg>
`)}`;

function normalizeUrl(url = '') {
  const value = String(url || '').trim();
  if (!value) return '';
  if (value.startsWith('data:')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return apiUrl(value);
  return apiUrl(`/${value}`);
}

function extractArtworkState(target = {}) {
  const artwork = target?.artwork || {};
  return {
    storageKey: artwork.storageKey || target?.storageKey || target?.pamphlet?.coverImageStorageKey || '',
    thumbnailKey: artwork.thumbnailKey || target?.thumbnailKey || target?.pamphlet?.coverThumbnailStorageKey || '',
    originalUrl: artwork.originalUrl || target?.coverImageUrl || target?.pamphlet?.coverImageUrl || '',
    thumbnailUrl: artwork.thumbnailUrl || target?.thumbnailUrl || target?.pamphlet?.coverThumbnailUrl || '',
  };
}

export function resolveArtworkUrl(target = {}, { prefer = 'thumbnail', allowFallback = true } = {}) {
  const artwork = extractArtworkState(target);
  const keyDrivenThumbnail = artwork.thumbnailKey ? apiUrl(`/media/${artwork.thumbnailKey}`) : '';
  const keyDrivenOriginal = artwork.storageKey ? apiUrl(`/media/${artwork.storageKey}`) : '';
  const explicitThumbnail = normalizeUrl(artwork.thumbnailUrl);
  const explicitOriginal = normalizeUrl(artwork.originalUrl);

  if (prefer === 'original') {
    return keyDrivenOriginal || explicitOriginal || keyDrivenThumbnail || explicitThumbnail || (allowFallback ? ARTWORK_FALLBACK_URL : '');
  }

  return keyDrivenThumbnail || explicitThumbnail || keyDrivenOriginal || explicitOriginal || (allowFallback ? ARTWORK_FALLBACK_URL : '');
}

export function buildArtworkPatch(asset = {}) {
  const originalUrl = asset.originalUrl || asset.imageUrl || '';
  const thumbnailUrl = asset.thumbnailUrl || asset.originalUrl || asset.imageUrl || '';

  return {
    artwork: {
      storageKey: asset.storageKey || '',
      thumbnailKey: asset.thumbnailKey || '',
      originalUrl,
      thumbnailUrl,
      persistedAt: asset.persistedAt || new Date().toISOString(),
      source: asset.source || 'stored',
    },
    thumbnailUrl,
    coverImageUrl: originalUrl,
    pamphlet: {
      coverImageUrl: originalUrl,
      coverThumbnailUrl: thumbnailUrl,
      coverImageStorageKey: asset.storageKey || '',
      coverThumbnailStorageKey: asset.thumbnailKey || '',
    },
  };
}

export function useValidatedImageUrl(source, fallback = ARTWORK_FALLBACK_URL) {
  const normalizedSource = useMemo(() => normalizeUrl(source), [source]);
  const [resolvedUrl, setResolvedUrl] = useState(normalizedSource || fallback);

  useEffect(() => {
    if (!normalizedSource) {
      setResolvedUrl(fallback);
      return undefined;
    }

    if (normalizedSource.startsWith('data:')) {
      setResolvedUrl(normalizedSource);
      return undefined;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled) setResolvedUrl(normalizedSource);
    };
    image.onerror = () => {
      if (!cancelled) setResolvedUrl(fallback);
    };
    image.src = normalizedSource;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [fallback, normalizedSource]);

  return resolvedUrl || fallback;
}
