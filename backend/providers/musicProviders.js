import { metricsService } from '../analytics/metricsService.js';

let spotifyTokenCache = { token: null, expiresAt: 0 };

function mmss(sec = 0) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (spotifyTokenCache.token && spotifyTokenCache.expiresAt > Date.now() + 15000) return spotifyTokenCache.token;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('Spotify token fetch failed');
  const data = await res.json();
  spotifyTokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return spotifyTokenCache.token;
}

async function searchSpotify(query, limit = 5) {
  const token = await getSpotifyToken();
  if (!token) return [];
  const res = await fetch(`https://api.spotify.com/v1/search?type=track&limit=${limit}&q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Spotify search failed');
  const data = await res.json();
  metricsService.inc('external_api.spotify');
  return (data?.tracks?.items || []).map((x) => ({
    track_title: x.name,
    artist: (x.artists || []).map((a) => a.name).join(', '),
    duration: mmss((x.duration_ms || 0) / 1000),
    album_art: x.album?.images?.[0]?.url || '',
    actual_audio: x.preview_url || '',
    source: 'spotify',
    source_url: x.external_urls?.spotify || '',
  }));
}

async function searchYouTube(query, maxResults = 5) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('videoEmbeddable', 'true');
  url.searchParams.set('videoSyndicated', 'true');
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('q', query);
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('YouTube search failed');
  const data = await res.json();
  metricsService.inc('external_api.youtube');
  return (data?.items || []).map((x) => ({
    track_title: x?.snippet?.title || 'YouTube Result',
    artist: x?.snippet?.channelTitle || 'YouTube',
    duration: '3:00',
    album_art: x?.snippet?.thumbnails?.high?.url || '',
    actual_audio: '',
    source: 'youtube',
    source_url: x?.id?.videoId ? `https://www.youtube.com/watch?v=${x.id.videoId}` : '',
    youtube_video_id: x?.id?.videoId || '',
  }));
}

export const musicProviders = {
  async search(provider, query) {
    if (provider === 'spotify') return searchSpotify(query, 6);
    if (provider === 'youtube') return searchYouTube(query, 6);
    return [];
  },
};
