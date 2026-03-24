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

// ─── 6-Strategy Architecture ───
// 4 General music + 2 Soundtrack/Score/Cinematic
const STRATEGY_ORDER = [
  'trend',
  'balanced',
  'counterpoint',
  'discovery',
  'soundtrack_atmosphere',
  'soundtrack_climax',
];

const GENERAL_STRATEGIES = ['trend', 'balanced', 'counterpoint', 'discovery'];
const SOUNDTRACK_STRATEGIES = ['soundtrack_atmosphere', 'soundtrack_climax'];

function fingerprint(input) {
  const normalized = {
    genre: input.genre || 'Contemporary',
    mood: input.mood || '',
    keywords: Array.isArray(input.keywords) ? input.keywords.map((x) => String(x).toLowerCase()).sort() : [],
    competitionMode: Boolean(input.competitionMode),
    duration: input.duration || '03:00',
    tempo: input.tempo || '',
    emotionCurve: Array.isArray(input.emotionCurve) ? input.emotionCurve : [],
    language: input.language || 'EN',
  };
  const raw = JSON.stringify(normalized);
  return crypto.createHash('sha1').update(raw).digest('hex');
}

// ─── Explicit content keywords for YouTube filtering ───
const EXPLICIT_KEYWORDS = ['explicit', 'uncensored', '18+', 'adult', 'nsfw'];

function normalizeKey(title = '', artist = '') {
  return `${title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '')}::${artist.toLowerCase().replace(/[^a-z0-9가-힣]/g, '')}`;
}

function dedupeTracks(items = [], globalSeenStr = new Set(), globalSeenIds = new Set()) {
  return items.filter((item) => {
    const key = normalizeKey(item.track_title, item.artist);
    const spotifyId = item.spotify_track_id || '';
    const youtubeId = item.youtube_video_id || '';
    if (!key || globalSeenStr.has(key)) return false;
    if (spotifyId && globalSeenIds.has(spotifyId)) return false;
    if (youtubeId && globalSeenIds.has(youtubeId)) return false;
    globalSeenStr.add(key);
    if (spotifyId) globalSeenIds.add(spotifyId);
    if (youtubeId) globalSeenIds.add(youtubeId);
    return true;
  });
}

function filterExplicitContent(items = []) {
  return items.filter((item) => {
    if (item.source === 'spotify' && item.explicit === true) return false;
    if (item.source === 'youtube') {
      const text = `${item.track_title || ''} ${item.artist || ''}`.toLowerCase();
      if (EXPLICIT_KEYWORDS.some((kw) => text.includes(kw))) return false;
    }
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

// ─── Anti-Repetition Engine ───
// Tracks genre / tempo / mood / artist buckets across all 6 slots
function buildAntiRepetitionContext() {
  return {
    usedGenres: new Map(),       // genre -> count
    usedTempos: new Map(),       // tempoBucket -> count
    usedMoods: new Map(),        // moodCategory -> count
    usedArtists: new Set(),      // exact artist names
    maxPerGenre: 2,
    maxPerTempo: 2,
    maxPerMood: 2,
  };
}

function getArtistNormalized(artist = '') {
  return artist.toLowerCase().replace(/[^a-z0-9가-힣]/g, '').trim();
}

function guessTempoBucket(track) {
  const title = (track.track_title || '').toLowerCase();
  const dur = track.duration || '';
  // Simple heuristic: short = fast, long = slow
  const mins = parseFloat(dur) || 3;
  if (mins < 2.5) return 'fast';
  if (mins > 5) return 'slow';
  if (title.includes('ambient') || title.includes('drone') || title.includes('meditation')) return 'slow';
  if (title.includes('beat') || title.includes('bass') || title.includes('rhythm')) return 'fast';
  return 'medium';
}

function passesAntiRepetition(track, ctx) {
  const artist = getArtistNormalized(track.artist);
  if (artist && ctx.usedArtists.has(artist)) return false;

  const tempoBucket = guessTempoBucket(track);
  if ((ctx.usedTempos.get(tempoBucket) || 0) >= ctx.maxPerTempo) return false;

  return true;
}

function recordTrackInContext(track, ctx) {
  const artist = getArtistNormalized(track.artist);
  if (artist) ctx.usedArtists.add(artist);

  const tempoBucket = guessTempoBucket(track);
  ctx.usedTempos.set(tempoBucket, (ctx.usedTempos.get(tempoBucket) || 0) + 1);
}

// ─── Fallback Tracks (expanded for 6 strategies) ───
const FALLBACK_TRACKS = {
  trend: [
    {
      track_title: 'Intro',
      artist: 'The xx',
      duration: '2:07',
      album_art: '/images/seedbar_music_cover.svg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'xMV6l2y67rk',
      source_url: 'https://www.youtube.com/watch?v=xMV6l2y67rk',
    },
  ],
  balanced: [
    {
      track_title: 'Gymnopédie No.1',
      artist: 'Erik Satie',
      duration: '3:09',
      album_art: '/images/seedbar_music_cover.svg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'S-Xm7s9eGxU',
      source_url: 'https://www.youtube.com/watch?v=S-Xm7s9eGxU',
    },
  ],
  counterpoint: [
    {
      track_title: 'An Ending (Ascent)',
      artist: 'Brian Eno',
      duration: '4:18',
      album_art: '/images/seedbar_music_cover.svg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'It4WxQ6dnn0',
      source_url: 'https://www.youtube.com/watch?v=It4WxQ6dnn0',
    },
  ],
  discovery: [
    {
      track_title: 'Glósóli',
      artist: 'Sigur Rós',
      duration: '6:16',
      album_art: '/images/seedbar_music_cover.svg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'Bz8iEJeh26E',
      source_url: 'https://www.youtube.com/watch?v=Bz8iEJeh26E',
    },
  ],
  soundtrack_atmosphere: [
    {
      track_title: 'On the Nature of Daylight',
      artist: 'Max Richter',
      duration: '5:57',
      album_art: '/images/seedbar_music_cover.svg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'rVN1B-tUpGs',
      source_url: 'https://www.youtube.com/watch?v=rVN1B-tUpGs',
    },
  ],
  soundtrack_climax: [
    {
      track_title: 'Time',
      artist: 'Hans Zimmer (Inception OST)',
      duration: '4:35',
      album_art: '/images/seedbar_music_cover.svg',
      actual_audio: '',
      source: 'youtube',
      youtube_video_id: 'RxabLA7UQ9k',
      source_url: 'https://www.youtube.com/watch?v=RxabLA7UQ9k',
    },
  ],
};

function buildQueryFallbackTrack(strategyName) {
  return FALLBACK_TRACKS[strategyName] || FALLBACK_TRACKS['trend'];
}

function fallbackPayload(input) {
  const comp = Boolean(input.competitionMode);
  const isKr = input.language === 'KR';

  const notes = comp
    ? {
      trend: isKr ? '안무 대회 심사의 기준이 될 만한 현대적인 긴장감과 전개를 지닙니다.' : 'Competition-safe kinetic tension arc tailored for judges.',
      balanced: isKr ? '동작의 가독성과 서정적인 멜로디 라인을 적절히 배분한 선택입니다.' : 'Body readability with restrained melodic load.',
      counterpoint: isKr ? '의도적인 대비감과 무음 구간을 활용하여 안무의 임팩트를 극대화합니다.' : 'Deliberate contrast and silence-ready structure for memorability.',
      discovery: isKr ? '심사위원도 처음 듣는 예상 밖의 트랙으로 강렬한 인상을 남깁니다.' : 'Unexpected unknown track for maximum jury impact.',
      soundtrack_atmosphere: isKr ? '도입부 공기감을 장악하는 시네마틱 사운드트랙입니다.' : 'Cinematic soundtrack to command the intro atmosphere.',
      soundtrack_climax: isKr ? '절정 직전 긴장 축적에 적합한 스코어 기반 음악입니다.' : 'Score-based tension builder for the pre-climax.',
    }
    : {
      trend: isKr ? '명확한 감정선 상승과 트렌디한 질감을 동시에 갖춘 음악입니다.' : 'Current contemporary trend texture with clear emotional progression.',
      balanced: isKr ? '안무 구성에 유연하게 활용할 수 있는 리듬과 공간감을 지닙니다.' : 'Blend of texture and rhythm for broad usability.',
      counterpoint: isKr ? '예상치 못한 질감 뉘앙스가 안무에 신선한 포인트가 되어줍니다.' : 'Unexpected but fitting contrast for choreographic impact.',
      discovery: isKr ? '기존 추천에서 벗어난 장르/텍스처로 안무의 가능성을 확장합니다.' : 'Widens your sonic palette beyond conventional recommendations.',
      soundtrack_atmosphere: isKr ? '장면의 공기감을 잡는 시네마틱 사운드트랙입니다.' : 'Cinematic soundtrack that captures scene atmosphere.',
      soundtrack_climax: isKr ? '절정 직전 긴장 축적에 적합한 스코어입니다.' : 'Score-based tension builder for the pre-climax section.',
    };

  const strategy = {};
  for (const name of STRATEGY_ORDER) {
    const isSoundtrack = SOUNDTRACK_STRATEGIES.includes(name);
    const baseQuery = isSoundtrack
      ? (name === 'soundtrack_atmosphere'
        ? { spotify: 'ambient cinematic score atmospheric film soundtrack drone', youtube: 'ambient film score atmospheric soundtrack official' }
        : { spotify: 'epic cinematic orchestral tension climax film score', youtube: 'epic orchestral climax tension film score official audio' })
      : (name === 'trend'
        ? { spotify: 'cinematic heavy bass string tension emotional soundtrack', youtube: 'cinematic tension strings bass official audio soundtrack' }
        : name === 'balanced'
          ? { spotify: 'minimal ambient pulse hybrid texture atmospheric', youtube: 'ambient minimal rhythmic texture official audio instrumental' }
          : name === 'counterpoint'
            ? { spotify: 'deconstructed classical piano sudden silence experimental', youtube: 'experimental ambient noise texture silence official audio' }
            : { spotify: 'electronic glitch post-rock experimental world music', youtube: 'experimental post-rock world music official audio' });

    strategy[name] = {
      searchQueries: baseQuery,
      excludes: CLICHE_TERMS,
      rationale: notes[name] || '',
    };
  }

  return {
    fingerprint: fingerprint(input),
    competitionMode: comp,
    strategy,
    recommendations: Object.fromEntries(STRATEGY_ORDER.map((s) => [s, []])),
  };
}

function buildSystemPrompt(input) {
  const isKr = input?.language === 'KR';
  const languageInstruction = isKr
    ? 'CRITICAL: You MUST write all "rationale" and "label" fields STRICTLY in fluent Korean (한국어). Do not use English for the rationale or label.'
    : 'CRITICAL: You MUST write all "rationale" and "label" fields in English.';

  return [
    'You are Seedbar Music Strategy Engine v3.0 — specialized in creative, diverse music curation for choreographers.',
    'Return compact JSON only.',
    '',
    'Generate SIX recommendation strategies with these EXACT keys:',
    '  1. "trend" — Current trending music matching the choreography energy.',
    '  2. "balanced" — Well-rounded track balancing rhythm, melody, and texture.',
    '  3. "counterpoint" — Intentionally contrasting sonic palette for artistic tension.',
    '  4. "discovery" — Unexpected genre/style that the choreographer would never think of but perfectly fits.',
    '  5. "soundtrack_atmosphere" — Film score / ambient / drone for intro atmosphere and scene air-feel.',
    '  6. "soundtrack_climax" — Cinematic score / orchestral / tension-builder for climax build-up.',
    '',
    'Each strategy must include:',
    '  - "searchQueries": { "spotify": "...", "youtube": "..." }',
    '  - "excludes": [...] (list of cliché terms to avoid)',
    '  - "rationale": one-sentence explanation of WHY this track fits',
    '  - "label": a short evocative label for the card (e.g., "도입부 공기감용", "절정 구간용", "플로어워크 리듬")',
    '  - "purpose": one of ["general", "soundtrack"]',
    '',
    'ANTI-REPETITION RULES (CRITICAL):',
    '  - Each strategy MUST target a DIFFERENT genre or subgenre.',
    '  - Each strategy MUST target a DIFFERENT tempo range (slow/medium/fast).',
    '  - Each strategy MUST target a DIFFERENT emotional register.',
    '  - NEVER let two strategies share the same artist or similar track style.',
    '  - Maximize DISCOVERY: surprise the user with variety.',
    '',
    languageInstruction,
    '',
    'CRITICAL: The queries are for finding MUSIC TRACKS, not dance videos.',
    'NEVER include words like "dance", "choreography", "performance", "routine" in any query.',
    'YouTube queries MUST target actual songs/music — use terms like "official audio", "soundtrack", "ambient music", "instrumental".',
    'Spotify queries should use genre, mood, and texture keywords.',
    '',
    'Consider these input dimensions for variety:',
    '  - Genre / Movement texture / Emotion curve / Energy arc / Spatial feel / Performance duration / Artistic intent',
    '',
    'If competitionMode=true, strengthen jury-focused tension, readability, and differentiating counterpoint.',
  ].join('\n');
}

async function createMusicStrategy(input) {
  const fallback = () => fallbackPayload(input).strategy;
  const payload = await llmProvider.lowCostJson({
    system: buildSystemPrompt(input),
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
      label: entry?.label || fallbackEntry?.label || '',
      purpose: entry?.purpose || (SOUNDTRACK_STRATEGIES.includes(entry?._key) ? 'soundtrack' : 'general'),
    };
  };

  const fallbackStrategy = fallback();
  const strategy = {};
  for (const name of STRATEGY_ORDER) {
    const rawEntry = payload?.[name] || {};
    rawEntry._key = name;
    strategy[name] = normalizeStrategyEntry(rawEntry, fallbackStrategy[name]);
    // Force purpose tag for soundtrack strategies
    if (SOUNDTRACK_STRATEGIES.includes(name)) {
      strategy[name].purpose = 'soundtrack';
    }
  }

  return strategy;
}

async function searchStrategyTracks(strategyName, strategy, cacheKeyPrefix, youtubeBudget, globalSeenStr, globalSeenIds, antiRepCtx) {
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

  const spotifyFiltered = filterExplicitContent(filterTracks(dedupeTracks(spotify, globalSeenStr, globalSeenIds), excludes));
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

  const merged = filterExplicitContent(filterTracks(dedupeTracks([...spotifyFiltered, ...youtube], globalSeenStr, globalSeenIds), excludes));

  // Apply anti-repetition filtering
  const antiRepFiltered = merged.filter((t) => passesAntiRepetition(t, antiRepCtx));

  const playableFirst = [
    ...antiRepFiltered.filter(isPlayableTrack),
    ...antiRepFiltered.filter((item) => !isPlayableTrack(item)),
  ];

  // Each strategy gets 1 track (6 strategies × 1 = 6 total)
  let selected = playableFirst.slice(0, 1);

  // If anti-rep was too strict, fall back to merged without anti-rep
  if (selected.length === 0 && merged.length > 0) {
    selected = [merged.filter(isPlayableTrack)[0] || merged[0]].filter(Boolean);
  }

  // If API search yields zero, insert rich fallbacks
  if (selected.length === 0) {
    selected = buildQueryFallbackTrack(strategyName);
  }

  // Record selected tracks in anti-repetition context
  for (const t of selected) {
    recordTrackInContext(t, antiRepCtx);
  }

  cacheService.set(queryCacheKey, selected, CACHE_TTL.externalMusicSearch);
  return selected;
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
  // Expanded YouTube budget for 6 strategies
  const youtubeBudget = { remaining: 4, minTracksBeforeSkip: 1 };

  const recommendations = {};
  const globalSeenStr = new Set();
  const globalSeenIds = new Set();
  const antiRepCtx = buildAntiRepetitionContext();

  for (const name of STRATEGY_ORDER) {
    const tracks = await searchStrategyTracks(name, strategy[name], `music:${fp}`, youtubeBudget, globalSeenStr, globalSeenIds, antiRepCtx);
    recommendations[name] = tracks.map((t) => ({
      ...t,
      strategy: name,
      rationale: strategy[name]?.rationale || `${name} strategy`,
      label: strategy[name]?.label || '',
      purpose: strategy[name]?.purpose || 'general',
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
