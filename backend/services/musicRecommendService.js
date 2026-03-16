import crypto from 'crypto';
import { cacheService, CACHE_TTL } from '../cache/cacheService.js';
import { llmProvider } from '../providers/llmProvider.js';
import { musicProviders } from '../providers/musicProviders.js';
import { metricsService } from '../analytics/metricsService.js';

const CLICHE_TERMS = [
  'sad piano',
  'on the nature of daylight',
  'nuvole bianche',
  'interstellar',
  'tiktok viral',
  'time ost',
  'max richter',
  'ludovico einaudi',
  'hans zimmer',
  'blinding lights',
  'dance monkey',
];

const STRATEGY_ORDER = ['trend', 'balanced', 'counterpoint'];

function fingerprint(input) {
  const normalized = {
    genre: input.genre || 'Contemporary',
    mood: input.mood || '',
    keywords: Array.isArray(input.keywords) ? input.keywords.map((x) => String(x).toLowerCase()).sort() : [],
    competitionMode: Boolean(input.competitionMode),
    duration: input.duration || '03:00',
    tempo: input.tempo || '',
    emotionCurve: Array.isArray(input.emotionCurve) ? input.emotionCurve : [],
  };
  const raw = JSON.stringify(normalized);
  return crypto.createHash('sha1').update(raw).digest('hex');
}

function dedupeTracks(items = [], globalSeenStr = new Set(), globalSeenIds = new Set()) {
  return items.filter((item) => {
    const key = `${(item.track_title || '').toLowerCase()}::${(item.artist || '').toLowerCase()}`;
    const trackId = item.spotify_track_id || item.youtube_video_id;

    if (!key || globalSeenStr.has(key)) return false;
    if (trackId && globalSeenIds.has(trackId)) return false;

    globalSeenStr.add(key);
    if (trackId) globalSeenIds.add(trackId);
    return true;
  });
}

function filterTracks(items = [], excludes = []) {
  const blocked = [...CLICHE_TERMS, ...(excludes || [])].map((x) => String(x || '').toLowerCase());
  return items.filter((item) => {
    const s = `${item.track_title || ''} ${item.artist || ''}`.toLowerCase();
    return !blocked.some((term) => term && s.includes(term));
  });
}

function isPlayableTrack(item = {}) {
  if (item.source === 'youtube' && item.youtube_video_id) return true;
  if (item.source === 'spotify' && (item.actual_audio || item.source_url)) return true;
  return false;
}

const FALLBACK_TRACKS = {
  trend: [
    {
      track_title: 'Experience',
      artist: 'Ludovico Einaudi',
      duration: '5:15',
      album_art: 'https://i.ytimg.com/vi/hN_q-_nGv4U/hqdefault.jpg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'hN_q-_nGv4U',
      source_url: 'https://www.youtube.com/watch?v=hN_q-_nGv4U',
    },
    {
      track_title: 'Intro',
      artist: 'The xx',
      duration: '2:07',
      album_art: 'https://i.ytimg.com/vi/xMV6l2y67rk/hqdefault.jpg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'xMV6l2y67rk',
      source_url: 'https://www.youtube.com/watch?v=xMV6l2y67rk',
    }
  ],
  balanced: [
    {
      track_title: 'Gymnopédie No.1',
      artist: 'Erik Satie',
      duration: '3:09',
      album_art: 'https://i.ytimg.com/vi/S-Xm7s9eGxU/hqdefault.jpg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'S-Xm7s9eGxU',
      source_url: 'https://www.youtube.com/watch?v=S-Xm7s9eGxU',
    },
    {
      track_title: 'Clair de Lune',
      artist: 'Debussy',
      duration: '5:00',
      album_art: 'https://i.ytimg.com/vi/WNcsUNKlAKw/hqdefault.jpg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'WNcsUNKlAKw',
      source_url: 'https://www.youtube.com/watch?v=WNcsUNKlAKw',
    }
  ],
  counterpoint: [
    {
      track_title: 'An Ending (Ascent)',
      artist: 'Brian Eno',
      duration: '4:18',
      album_art: 'https://i.ytimg.com/vi/It4WxQ6dnn0/hqdefault.jpg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'It4WxQ6dnn0',
      source_url: 'https://www.youtube.com/watch?v=It4WxQ6dnn0',
    },
    {
      track_title: 'Comptine d\'un autre été',
      artist: 'Yann Tiersen',
      duration: '2:20',
      album_art: 'https://i.ytimg.com/vi/NvryolGa19A/hqdefault.jpg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'NvryolGa19A',
      source_url: 'https://www.youtube.com/watch?v=NvryolGa19A',
    }
  ]
};

function buildQueryFallbackTrack(strategyName, strategy = {}) {
  // Use pre-crafted rich fallbacks instead of a dead search query
  return FALLBACK_TRACKS[strategyName] || FALLBACK_TRACKS['trend'];
}

function fallbackPayload(input) {
  const comp = Boolean(input.competitionMode);
  const notes = comp
    ? {
      trend: 'Competition-safe kinetic tension arc tailored for judges.',
      balanced: 'Body readability with restrained melodic load.',
      counterpoint: 'Deliberate contrast and silence-ready structure for memorability.',
    }
    : {
      trend: 'Current contemporary trend texture with clear emotional progression.',
      balanced: 'Blend of texture and rhythm for broad usability.',
      counterpoint: 'Unexpected but fitting contrast for choreographic impact.',
    };

  return {
    fingerprint: fingerprint(input),
    competitionMode: comp,
    strategy: {
      trend: {
        searchQueries: {
          spotify: 'cinematic heavy bass string tension emotional soundtrack',
          youtube: 'cinematic tension strings bass official audio soundtrack',
        },
        excludes: CLICHE_TERMS,
        rationale: notes.trend,
      },
      balanced: {
        searchQueries: {
          spotify: 'minimal ambient pulse hybrid texture atmospheric',
          youtube: 'ambient minimal rhythmic texture official audio instrumental',
        },
        excludes: CLICHE_TERMS,
        rationale: notes.balanced,
      },
      counterpoint: {
        searchQueries: {
          spotify: 'deconstructed classical piano sudden silence experimental',
          youtube: 'experimental ambient noise texture silence official audio',
        },
        excludes: CLICHE_TERMS,
        rationale: notes.counterpoint,
      },
    },
    recommendations: {
      trend: [],
      balanced: [],
      counterpoint: [],
    },
  };
}

function buildSystemPrompt() {
  return [
    'You are Seedbar Music Strategy Engine.',
    'Return compact JSON only.',
    'Generate three recommendation strategies: trend, balanced, counterpoint.',
    'Each strategy must include spotify and youtube query strings, excludes list, and one-sentence rationale.',
    'CRITICAL: The queries are for finding MUSIC TRACKS, not dance videos.',
    'NEVER include words like "dance", "choreography", "performance", "routine" in any query.',
    'YouTube queries MUST target actual songs/music — use terms like "official audio", "soundtrack", "ambient music", "instrumental".',
    'Spotify queries should use genre, mood, and texture keywords — e.g. "cinematic ambient strings tension" not "contemporary dance music".',
    'Incorporate the provided Genre, Mood, Tempo, and Emotion Curve properties to narrow down the mood and pacing.',
    'If competitionMode=true, strengthen jury-focused tension, readability, and differentiating counterpoint.',
    'Avoid cliché tracks and globally overused pieces.',
  ].join(' ');
}

async function createMusicStrategy(input) {
  const fallback = () => fallbackPayload(input).strategy;
  const payload = await llmProvider.lowCostJson({
    system: buildSystemPrompt(),
    user: {
      genre: input.genre,
      mood: input.mood,
      keywords: input.keywords,
      competitionMode: Boolean(input.competitionMode),
      duration: input.duration,
      tempo: input.tempo,
      emotionCurve: input.emotionCurve,
    },
    fallback,
  });

  const normalizeStrategyEntry = (entry, fallbackEntry) => {
    const spotify = entry?.searchQueries?.spotify || entry?.spotify_query || fallbackEntry?.searchQueries?.spotify || '';
    const youtube = entry?.searchQueries?.youtube || entry?.youtube_query || fallbackEntry?.searchQueries?.youtube || '';
    return {
      searchQueries: { spotify, youtube },
      excludes: Array.isArray(entry?.excludes) ? entry.excludes : (fallbackEntry?.excludes || []),
      rationale: entry?.rationale || fallbackEntry?.rationale || '',
    };
  };

  const fallbackStrategy = fallback();
  const strategy = {
    trend: normalizeStrategyEntry(payload?.trend, fallbackStrategy.trend),
    balanced: normalizeStrategyEntry(payload?.balanced, fallbackStrategy.balanced),
    counterpoint: normalizeStrategyEntry(payload?.counterpoint, fallbackStrategy.counterpoint),
  };

  return strategy;
}

async function searchStrategyTracks(strategyName, strategy, cacheKeyPrefix, youtubeBudget, globalSeenStr, globalSeenIds) {
  const searchQueries = strategy?.searchQueries || {};
  const spotifyQuery = searchQueries.spotify || '';
  const youtubeQuery = searchQueries.youtube || '';
  const excludes = Array.isArray(strategy?.excludes) ? strategy.excludes : [];

  const queryCacheKey = cacheService.buildKey(`${cacheKeyPrefix}:query`, { strategyName, spotifyQuery, youtubeQuery, excludes });
  const cached = cacheService.get(queryCacheKey);
  if (cached) return cached;

  let spotify = [];
  let youtube = [];

  try {
    if (spotifyQuery) spotify = await musicProviders.search('spotify', spotifyQuery);
  } catch (error) {
    metricsService.track({ type: 'music_provider_error', provider: 'spotify', strategy: strategyName, error: error.message });
  }

  const spotifyFiltered = filterTracks(dedupeTracks(spotify, globalSeenStr, globalSeenIds), excludes);
  const spotifyPlayableCount = spotifyFiltered.filter(isPlayableTrack).length;

  try {
    const needYoutube = youtubeBudget.remaining > 0 && (spotifyFiltered.length < youtubeBudget.minTracksBeforeSkip || spotifyPlayableCount < 1);
    if (needYoutube && youtubeQuery) {
      youtube = await musicProviders.search('youtube', youtubeQuery);
      youtubeBudget.remaining -= 1;
    }
  } catch (error) {
    metricsService.track({ type: 'music_provider_error', provider: 'youtube', strategy: strategyName, error: error.message });
  }

  const merged = filterTracks(dedupeTracks([...spotifyFiltered, ...youtube], globalSeenStr, globalSeenIds), excludes);
  const playableFirst = [
    ...merged.filter(isPlayableTrack),
    ...merged.filter((item) => !isPlayableTrack(item)),
  ];
  let selected = playableFirst.slice(0, 3);
  
  // If API search yields zero playable tracks (or throws), insert rich fallbacks
  if (selected.length === 0) {
    selected = buildQueryFallbackTrack(strategyName, strategy);
  }

  const result = selected;

  cacheService.set(queryCacheKey, result, CACHE_TTL.externalMusicSearch);
  return result;
}

export async function getMusicRecommendations(input = {}, context = {}) {
  const fp = fingerprint(input);
  const cacheKey = cacheService.buildKey('music:recommend', { fp, userId: context.userId || 'anonymous' });
  const cached = cacheService.get(cacheKey);
  if (cached) {
    metricsService.inc('music.cache_hit');
    return { ...cached, cacheHit: true };
  }

  metricsService.inc('music.cache_miss');

  const strategy = await createMusicStrategy(input);
  const youtubeBudget = { remaining: 2, minTracksBeforeSkip: 2 }; // quota 절약: 최대 2회만 조회

  const recommendations = {};
  const globalSeenStr = new Set();
  const globalSeenIds = new Set();
  for (const name of STRATEGY_ORDER) {
    const tracks = await searchStrategyTracks(name, strategy[name], `music:${fp}`, youtubeBudget, globalSeenStr, globalSeenIds);
    recommendations[name] = tracks.map((t) => ({
      ...t,
      strategy: name,
      rationale: strategy[name]?.rationale || `${name} strategy`,
      query: strategy[name]?.searchQueries || {},
    }));
  }

  const payload = {
    fingerprint: fp,
    competitionMode: Boolean(input.competitionMode),
    strategy,
    recommendations,
  };

  cacheService.set(cacheKey, payload, CACHE_TTL.musicCandidates);
  return { ...payload, cacheHit: false };
}
