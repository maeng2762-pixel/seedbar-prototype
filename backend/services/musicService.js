import { cacheService, CACHE_TTL } from '../cache/cacheService.js';
import { llmProvider } from '../providers/llmProvider.js';
import { musicProviders } from '../providers/musicProviders.js';

const CLICHE_RULES = ['sad piano', 'interstellar', 'nuvole bianche', 'viral tiktok', 'max richter'];

function dedupe(items) {
  const seen = new Set();
  return items.filter((x) => {
    const k = `${(x.track_title || '').toLowerCase()}::${(x.artist || '').toLowerCase()}`;
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function removeCliche(items) {
  return items.filter((x) => {
    const s = `${x.track_title || ''} ${x.artist || ''}`.toLowerCase();
    return !CLICHE_RULES.some((rule) => s.includes(rule));
  });
}

function fallbackMusic(mode = 'trend') {
  return [{
    track_title: mode === 'trend' ? 'Textural Kinetic Study' : 'Counterpoint Silence Frame',
    artist: 'Seedbar Curated',
    duration: '3:00',
    album_art: `https://api.dicebear.com/7.x/shapes/svg?seed=${mode}`,
    actual_audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    source: 'fallback',
    source_url: '',
  }];
}

export async function buildInternalMusicDirection(input, isCompetition) {
  const key = cacheService.buildKey('music:internal', { input, isCompetition });
  const cached = cacheService.get(key);
  if (cached) return cached;

  const system = `You generate low-token JSON for dance music direction. Return concise keys only.\n${isCompetition ? 'Competition mode enabled.' : ''}`;
  const fallback = () => ({
    trend: {
      searchKeywords: ['cinematic heavy bass string tension', 'rhythmic industrial percussion'],
      exclude: CLICHE_RULES,
    },
    differentiated: {
      searchKeywords: ['deconstructed classical piano sudden silence', 'minimal drone no beat breath'],
      exclude: CLICHE_RULES,
    },
  });
  const plan = await llmProvider.lowCostJson({ system, user: input, fallback });
  cacheService.set(key, plan, CACHE_TTL.musicCandidates);
  return plan;
}

export async function resolveExternalTracks(direction, allowExternal = true) {
  const key = cacheService.buildKey('music:external', { direction, allowExternal });
  const cached = cacheService.get(key);
  if (cached) return cached;

  if (!allowExternal) {
    const fallback = {
      trend: fallbackMusic('trend'),
      differentiated: fallbackMusic('differentiated'),
    };
    cacheService.set(key, fallback, CACHE_TTL.externalMusicSearch);
    return fallback;
  }

  const trendKeywords = direction?.trend?.searchKeywords || [];
  const diffKeywords = direction?.differentiated?.searchKeywords || [];

  const [trendResults, diffResults] = await Promise.all([
    Promise.all(trendKeywords.slice(0, 2).flatMap((q) => [musicProviders.search('spotify', q), musicProviders.search('youtube', q)])).catch(() => []),
    Promise.all(diffKeywords.slice(0, 2).flatMap((q) => [musicProviders.search('spotify', q), musicProviders.search('youtube', q)])).catch(() => []),
  ]);

  const trend = removeCliche(dedupe(trendResults.flat())).slice(0, 6);
  const differentiated = removeCliche(dedupe(diffResults.flat())).slice(0, 6);

  const merged = {
    trend: trend.length ? trend : fallbackMusic('trend'),
    differentiated: differentiated.length ? differentiated : fallbackMusic('differentiated'),
  };
  cacheService.set(key, merged, CACHE_TTL.externalMusicSearch);
  return merged;
}
