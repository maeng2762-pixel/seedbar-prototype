import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

function imageResponse() {
  const pngBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9JX2HFQAAAABJRU5ErkJggg==',
    'base64',
  );
  return new Response(pngBytes, {
    status: 200,
    headers: {
      'content-type': 'image/png',
      'content-length': String(pngBytes.length),
    },
  });
}

function buildSpotifyTrack(query, suffix, previewUrl = 'https://p.scdn.co/mp3-preview/test-preview.mp3') {
  return {
    id: `spotify_${suffix}`,
    name: `${query} Track ${suffix}`,
    explicit: false,
    duration_ms: 210000 + (suffix * 1000),
    preview_url: previewUrl,
    external_urls: {
      spotify: `https://open.spotify.com/track/spotify_${suffix}`,
    },
    album: {
      images: [{ url: `https://images.seedbar.local/spotify-${suffix}.jpg` }],
    },
    artists: [
      { name: `Seedbar Artist ${suffix}` },
    ],
  };
}

function buildYoutubeItem(query, suffix) {
  return {
    id: { videoId: `seedbar_video_${suffix}` },
    snippet: {
      title: `${query} Official Audio ${suffix}`,
      channelTitle: `Seedbar Channel ${suffix}`,
      thumbnails: {
        high: {
          url: `https://images.seedbar.local/youtube-${suffix}.jpg`,
        },
      },
    },
  };
}

export function installExternalServiceMocks() {
  const originalFetch = global.fetch.bind(global);

  global.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (/^https?:\/\/(127\.0\.0\.1|localhost):/i.test(url)) {
      return originalFetch(input, init);
    }

    if (url.includes('openai.com/v1/chat/completions')) {
      return jsonResponse({ error: 'Use deterministic fallback during smoke tests.' }, 500);
    }

    if (url.includes('openai.com/v1/images/generations')) {
      return jsonResponse({
        data: [
          { url: 'https://images.seedbar.local/generated-stage-poster.jpg' },
        ],
      });
    }

    if (url.includes('images.seedbar.local')) {
      return imageResponse();
    }

    if (url.includes('accounts.spotify.com/api/token')) {
      return jsonResponse({
        access_token: 'seedbar-test-spotify-token',
        token_type: 'Bearer',
        expires_in: 3600,
      });
    }

    if (url.includes('api.spotify.com/v1/search')) {
      const parsed = new URL(url);
      const query = parsed.searchParams.get('q') || 'seedbar';
      return jsonResponse({
        tracks: {
          items: [
            buildSpotifyTrack(query, 1),
            buildSpotifyTrack(query, 2, ''),
          ],
        },
      });
    }

    if (url.includes('www.googleapis.com/youtube/v3/search')) {
      const parsed = new URL(url);
      const query = parsed.searchParams.get('q') || 'seedbar';
      return jsonResponse({
        items: [
          buildYoutubeItem(query, 1),
          buildYoutubeItem(query, 2),
        ],
      });
    }

    return originalFetch(input, init);
  };

  return () => {
    global.fetch = originalFetch;
  };
}

export async function startTestServer(prefix = 'seedbar-smoke') {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const dbPath = path.join(os.tmpdir(), `${prefix}-${stamp}.sqlite`);

  const previousEnv = {
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_PATH: process.env.DATABASE_PATH,
    DEV_AUTH_SEED: process.env.DEV_AUTH_SEED,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_LOW_COST_MODEL: process.env.OPENAI_LOW_COST_MODEL,
    OPENAI_HIGH_QUALITY_MODEL: process.env.OPENAI_HIGH_QUALITY_MODEL,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  };

  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'seedbar-smoke-secret-12345';
  process.env.DATABASE_PATH = dbPath;
  process.env.DEV_AUTH_SEED = 'true';
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'seedbar-openai-test-key';
  process.env.OPENAI_LOW_COST_MODEL = process.env.OPENAI_LOW_COST_MODEL || 'gpt-4.1-mini';
  process.env.OPENAI_HIGH_QUALITY_MODEL = process.env.OPENAI_HIGH_QUALITY_MODEL || 'gpt-4.1';
  process.env.SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'seedbar-spotify-client-id';
  process.env.SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'seedbar-spotify-client-secret';
  process.env.YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'seedbar-youtube-api-key';

  const restoreFetch = installExternalServiceMocks();
  const { createApp } = await import('../../backend/app.js');
  const { db } = await import('../../backend/db/database.js');

  const app = createApp();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    server,
    db,
    dbPath,
    async cleanup() {
      await new Promise((resolve) => server.close(resolve));
      try {
        db.close();
      } catch {
        // ignore repeated closes
      }
      restoreFetch();
      await fs.rm(dbPath, { force: true }).catch(() => {});
      for (const [key, value] of Object.entries(previousEnv)) {
        if (value == null) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    },
  };
}

export async function apiJson(baseUrl, route, { method = 'GET', token = '', body = undefined, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  return {
    response,
    payload,
  };
}
