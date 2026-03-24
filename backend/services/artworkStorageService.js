import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const ARTWORK_STORAGE_ROOT = path.join(process.cwd(), 'persistent_media');
const MAX_ARTWORK_BYTES = 10 * 1024 * 1024;

fs.mkdirSync(ARTWORK_STORAGE_ROOT, { recursive: true });

function sanitizeSegment(value = 'shared') {
  return String(value || 'shared')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'shared';
}

function isDataUrl(url = '') {
  return /^data:image\/[a-z0-9.+-]+;base64,/i.test(String(url || ''));
}

function contentTypeToExtension(contentType = '', fallback = 'png') {
  const normalized = String(contentType || '').toLowerCase();
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'jpg';
  if (normalized.includes('png')) return 'png';
  if (normalized.includes('webp')) return 'webp';
  if (normalized.includes('gif')) return 'gif';
  if (normalized.includes('svg')) return 'svg';
  return fallback;
}

function inferExtensionFromUrl(url = '') {
  const pathname = String(url || '').split('?')[0];
  const ext = pathname.split('.').pop();
  if (!ext || ext === pathname) return 'png';
  return ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
}

function buildMediaUrl(storageKey = '') {
  return `/media/${storageKey}`;
}

function parseExistingStorageKey(imageUrl = '') {
  const normalized = String(imageUrl || '');
  const marker = '/media/';
  const index = normalized.indexOf(marker);
  if (index === -1) return '';
  return normalized.slice(index + marker.length).replace(/^\/+/, '');
}

function resolveStoragePath(storageKey = '') {
  return path.join(ARTWORK_STORAGE_ROOT, String(storageKey || '').replace(/^\/+/, ''));
}

async function writeBuffer(storageKey, buffer) {
  const targetPath = resolveStoragePath(storageKey);
  await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.promises.writeFile(targetPath, buffer);
}

async function readImageBuffer(imageUrl = '') {
  if (!imageUrl) {
    throw new Error('imageUrl is required.');
  }

  if (isDataUrl(imageUrl)) {
    const [meta, encoded] = String(imageUrl).split(',');
    const contentType = meta.match(/^data:(image\/[a-z0-9.+-]+);base64$/i)?.[1] || 'image/png';
    return {
      buffer: Buffer.from(encoded || '', 'base64'),
      contentType,
      extension: contentTypeToExtension(contentType),
    };
  }

  if (!/^https?:\/\//i.test(imageUrl)) {
    throw new Error('Only http(s) or data URLs can be persisted.');
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch generated artwork (${response.status}).`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error('Artwork source is not an image.');
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType,
    extension: contentTypeToExtension(contentType, inferExtensionFromUrl(imageUrl)),
  };
}

export async function persistArtworkAsset({ imageUrl, projectId, userId }) {
  const existingKey = parseExistingStorageKey(imageUrl);
  if (existingKey) {
    const existingPath = resolveStoragePath(existingKey);
    if (fs.existsSync(existingPath)) {
      const thumbnailKey = existingKey.replace(/(\.[a-z0-9]+)$/i, '-thumb$1');
      const thumbnailPath = resolveStoragePath(thumbnailKey);
      return {
        storageKey: existingKey,
        thumbnailKey: fs.existsSync(thumbnailPath) ? thumbnailKey : existingKey,
        originalUrl: buildMediaUrl(existingKey),
        thumbnailUrl: buildMediaUrl(fs.existsSync(thumbnailPath) ? thumbnailKey : existingKey),
        source: 'stored',
        byteSize: fs.statSync(existingPath).size,
      };
    }
  }

  const { buffer, contentType, extension } = await readImageBuffer(imageUrl);
  if (!buffer.length) {
    throw new Error('Generated artwork was empty.');
  }
  if (buffer.length > MAX_ARTWORK_BYTES) {
    throw new Error('Generated artwork exceeds the upload limit.');
  }

  const ownerSegment = sanitizeSegment(userId || 'guest');
  const projectSegment = sanitizeSegment(projectId || 'draft');
  const fileId = `cover-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const storageKey = path.posix.join('artwork', ownerSegment, projectSegment, `${fileId}.${extension}`);
  const thumbnailKey = path.posix.join('artwork', ownerSegment, projectSegment, `${fileId}-thumb.${extension}`);

  await writeBuffer(storageKey, buffer);
  await writeBuffer(thumbnailKey, buffer);

  return {
    storageKey,
    thumbnailKey,
    originalUrl: buildMediaUrl(storageKey),
    thumbnailUrl: buildMediaUrl(thumbnailKey),
    source: 'stored',
    contentType,
    byteSize: buffer.length,
  };
}
