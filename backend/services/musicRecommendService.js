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
  };
  const raw = JSON.stringify(normalized);
  return crypto.createHash('sha1').update(raw).digest('hex');
}

function dedupeTracks(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${(item.track_title || '').toLowerCase()}::${(item.artist || '').toLowerCase()}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
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
  if (item.source === 'spotify' && item.actual_audio) return true;
  return false;
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
          spotify: 'cinematic heavy bass string tension contemporary dance',
          youtube: 'contemporary dance cinematic bass tension soundtrack',
        },
        excludes: CLICHE_TERMS,
        rationale: notes.trend,
      },
      balanced: {
        searchQueries: {
          spotify: 'minimal ambient pulse modern dance hybrid texture',
          youtube: 'modern dance balanced ambient rhythmic texture',
        },
        excludes: CLICHE_TERMS,
        rationale: notes.balanced,
      },
      counterpoint: {
        searchQueries: {
          spotify: 'deconstructed classical piano sudden silence contemporary',
          youtube: 'experimental dance counterpoint silence noise texture',
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

async function searchStrategyTracks(strategyName, strategy, cacheKeyPrefix, youtubeBudget) {
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

  const spotifyFiltered = filterTracks(dedupeTracks(spotify), excludes);
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

  const merged = filterTracks(dedupeTracks([...spotifyFiltered, ...youtube]), excludes);
  const playableFirst = [
    ...merged.filter(isPlayableTrack),
    ...merged.filter((item) => !isPlayableTrack(item)),
  ];
  const selected = playableFirst.slice(0, 3);

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
  for (const name of STRATEGY_ORDER) {
    const tracks = await searchStrategyTracks(name, strategy[name], `music:${fp}`, youtubeBudget);
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
