import { metricsService } from '../analytics/metricsService.js';

let spotifyTokenCache = { token: null, expiresAt: 0 };

function mmss(sec = 0) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ─── Words that signal a non-music video ───
const BAD_TITLE_PATTERNS = [
  /interview/i,
  /behind the scenes/i,
  /making of/i,
  /rehearsal/i,
  /tutorial/i,
  /class/i,
  /lesson/i,
  /reaction/i,
  /review/i,
  /unboxing/i,
  /trailer/i,
  /teaser/i,
  /vlog/i,
  /podcast/i,
  /talk/i,
  /Q\s*&\s*A/i,
  /choreograph/i, // dance choreography videos, not music
  /dance cover/i,
  /dance practice/i,
  /dance video/i,
  /live performance/i, // live shows often can't be embedded
  /meet the artist/i,
  /documentary/i,
  /광고/,
  /리뷰/,
  /인터뷰/,
  /연습/,
];

function isLikelyMusicTrack(snippet = {}) {
  const title = snippet.title || '';
  // Reject if title matches any non-music pattern
  if (BAD_TITLE_PATTERNS.some((pat) => pat.test(title))) return false;
  return true;
}

// ─── Clean up YouTube title to extract song info ───
function cleanYouTubeTitle(title = '') {
  return title
    .replace(/\(Official\s*(Music\s*)?Video\)/gi, '')
    .replace(/\(Official\s*Audio\)/gi, '')
    .replace(/\[Official\s*(Music\s*)?Video\]/gi, '')
    .replace(/\[Official\s*Audio\]/gi, '')
    .replace(/\(Lyrics?\)/gi, '')
    .replace(/\[Lyrics?\]/gi, '')
    .replace(/\(HD\)/gi, '')
    .replace(/\(HQ\)/gi, '')
    .replace(/\|\s*.*$/, '') // everything after pipe
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ─── Force query to target music, not dance videos ───
function musicifyQuery(query = '') {
  // If query already contains "music", "song", "audio", "soundtrack" → keep it
  if (/\b(music|song|audio|soundtrack|official|lyric)\b/i.test(query)) return query;
  // Strip "dance" related terms that attract non-music results
  let cleaned = query
    .replace(/\b(contemporary\s+)?dance\b/gi, '')
    .replace(/\b(choreograph(y|ic)?|performance|routine)\b/gi, '')
    .trim();
  // Append "music" to refocus
  return `${cleaned} music`.replace(/\s{2,}/g, ' ').trim();
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

  // Force query to be music-focused
  const musicQuery = musicifyQuery(query);

  async function fetchSearch(strict = true) {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    // ★ KEY FIX: Only return Music category (id=10)
    url.searchParams.set('videoCategoryId', '10');
    if (strict) {
      url.searchParams.set('videoEmbeddable', 'true');
      url.searchParams.set('videoSyndicated', 'true');
    }
    // Request more results so we can filter out bad ones
    url.searchParams.set('maxResults', String(maxResults * 2));
    url.searchParams.set('q', musicQuery);
    url.searchParams.set('key', apiKey);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`);
    return res.json();
  }

  let data = await fetchSearch(true);
  let items = (data?.items || []).filter((x) => isLikelyMusicTrack(x?.snippet));

  // If strict + music category yields nothing, try without category but still filter
  if (!items.length) {
    data = await fetchSearch(false);
    items = (data?.items || []).filter((x) => isLikelyMusicTrack(x?.snippet));
  }

  metricsService.inc('external_api.youtube');
  return items.slice(0, maxResults).map((x) => ({
    track_title: cleanYouTubeTitle(x?.snippet?.title || 'YouTube Result'),
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
