import React, { useEffect, useMemo, useRef, useState } from 'react';
import useMusicRecommendationStore from '../store/useMusicRecommendationStore';
import useStore from '../store/useStore';

// ─── 6-Strategy Labels & Visual Config ───
const STRATEGY_CONFIG = {
  trend: {
    ko: '트렌드 반영',
    en: '🔥 Trend',
    koDesc: '최신 트렌드에 맞는 에너지',
    enDesc: 'Current trend energy',
    color: 'from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-300',
    icon: '🔥',
    purpose: 'general',
  },
  balanced: {
    ko: '균형형',
    en: '⚖️ Balanced',
    koDesc: '리듬과 공간감의 균형',
    enDesc: 'Rhythm & spatial balance',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
    icon: '⚖️',
    purpose: 'general',
  },
  counterpoint: {
    ko: '차별화',
    en: '💎 Counterpoint',
    koDesc: '의도적 대비와 긴장',
    enDesc: 'Deliberate contrast tension',
    color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/30 text-violet-300',
    icon: '💎',
    purpose: 'general',
  },
  discovery: {
    ko: '새로운 발견',
    en: '🌍 Discovery',
    koDesc: '예상 밖 장르로 가능성 확장',
    enDesc: 'Expand with unexpected genres',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-300',
    icon: '🌍',
    purpose: 'general',
  },
  soundtrack_atmosphere: {
    ko: '분위기 구축용',
    en: '🎬 Atmosphere',
    koDesc: '도입부 공기감을 잡는 사운드트랙',
    enDesc: 'Cinematic atmosphere for scene air-feel',
    color: 'from-sky-500/20 to-cyan-500/20 border-sky-500/30 text-sky-300',
    icon: '🎬',
    purpose: 'soundtrack',
  },
  soundtrack_climax: {
    ko: '절정 구간용',
    en: '🎻 Climax Score',
    koDesc: '절정 직전 긴장 축적에 적합',
    enDesc: 'Tension builder for the pre-climax',
    color: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30 text-fuchsia-300',
    icon: '🎻',
    purpose: 'soundtrack',
  },
};

const STRATEGY_ORDER_GENERAL = ['trend', 'balanced', 'counterpoint', 'discovery'];
const STRATEGY_ORDER_SOUNDTRACK = ['soundtrack_atmosphere', 'soundtrack_climax'];

// ─── Client-side filters (safety net after backend) ───
const EXPLICIT_KEYWORDS = ['explicit', 'uncensored', '18+', 'adult', 'nsfw'];

function normalizeStr(s = '') {
  return s.toLowerCase().replace(/[^a-z0-9\uac00-\ud7a3]/g, '');
}

function clientDedupe(tracks = []) {
  const seenKeys = new Set();
  const seenIds = new Set();
  return tracks.filter((t) => {
    const key = `${normalizeStr(t.track_title)}::${normalizeStr(t.artist)}`;
    if (!key || seenKeys.has(key)) return false;
    const spId = t.spotify_track_id || '';
    const ytId = t.youtube_video_id || '';
    if (spId && seenIds.has(spId)) return false;
    if (ytId && seenIds.has(ytId)) return false;
    seenKeys.add(key);
    if (spId) seenIds.add(spId);
    if (ytId) seenIds.add(ytId);
    return true;
  });
}

function clientFilterExplicit(tracks = []) {
  return tracks.filter((t) => {
    if (t.source === 'spotify' && t.explicit === true) return false;
    if (t.source === 'youtube') {
      const text = `${t.track_title || ''} ${t.artist || ''}`.toLowerCase();
      if (EXPLICIT_KEYWORDS.some((kw) => text.includes(kw))) return false;
    }
    return true;
  });
}

function TrackCard({ track, strategy, isSelected, onSelect }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const isSpotify = track.source === 'spotify';
  const isYouTube = track.source === 'youtube';
  const hasYouTubeId = isYouTube && track.youtube_video_id;
  const hasSpotifyUrl = isSpotify && track.source_url;
  const hasPreview = Boolean(track.actual_audio);
  const config = STRATEGY_CONFIG[strategy] || {};
  const isKr = useStore((s) => s.language) === 'KR';
  const isSoundtrack = config.purpose === 'soundtrack';

  const spotifyEmbedUrl = hasSpotifyUrl
    ? track.source_url.replace('open.spotify.com/track/', 'open.spotify.com/embed/track/')
    : '';

  const canEmbed = hasYouTubeId || hasSpotifyUrl;

  // Dynamic label from backend or config fallback
  const cardLabel = track.label || (isKr ? config.ko : config.en);
  const cardRationale = track.rationale || (isKr ? config.koDesc : config.enDesc);

  return (
    <div className={`group rounded-xl border bg-white/[0.04] p-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300 ${isSoundtrack ? 'border-white/20 ring-1 ring-inset ring-white/5' : 'border-white/10 hover:border-white/20'}`}>
      {/* Header: Strategy badge + label + duration */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isSelected && <span className="text-green-400 text-sm flex-shrink-0">✅</span>}
          <span className={`flex-shrink-0 rounded-full bg-gradient-to-r ${config.color || 'bg-primary/20 text-primary'} border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider`}>
            {cardLabel}
          </span>
          {isSoundtrack && (
            <span className="flex-shrink-0 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              {isKr ? '사운드트랙' : 'SOUNDTRACK'}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{track.duration || '3:00'}</span>
      </div>

      {/* Track info */}
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={track.album_art}
            alt="album"
            className="h-14 w-14 rounded-lg object-cover shadow-lg group-hover:shadow-xl transition-shadow"
            onError={(e) => {
              e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(track.track_title)}&backgroundColor=0d0a1c&shapeColor=6366f1`;
            }}
          />
          <span className={`absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider ${isSpotify ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {isSpotify ? 'SP' : 'YT'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">{track.track_title}</p>
          <p className="truncate text-xs text-slate-400">{track.artist}</p>
        </div>
      </div>

      {/* Rationale — enhanced description */}
      {cardRationale && (
        <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400 italic border-l-2 border-white/10 pl-2">{cardRationale}</p>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {canEmbed ? (
          <button
            type="button"
            onClick={() => setShowPlayer((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all ${
              showPlayer
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'bg-primary/20 text-indigo-200 hover:bg-primary/40'
            }`}
          >
            <span className="text-sm">{showPlayer ? '⏸' : '▶'}</span>
            {showPlayer ? (isKr ? '플레이어 닫기' : 'Close Player') : (isKr ? '여기서 재생' : 'Play Here')}
          </button>
        ) : hasPreview ? (
          <audio controls preload="none" className="h-8 flex-1 min-w-0" src={track.actual_audio} />
        ) : null}

        <button
          type="button"
          onClick={() => onSelect(track)}
          className={`px-3 py-2 text-[11px] font-semibold rounded-lg transition-all border ${
            isSelected ? 'bg-green-500/20 text-green-300 border-green-500/40' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border-white/10'
          }`}
        >
          {isSelected ? (isKr ? '선택됨' : 'Selected') : (isKr ? '선택하기' : 'Select')}
        </button>

        {track.source_url ? (
          <a
            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors border ${
              isSpotify
                ? 'border-green-500/30 text-green-300 hover:bg-green-500/10'
                : 'border-red-500/30 text-red-300 hover:bg-red-500/10'
            }`}
            target="_blank"
            rel="noreferrer"
            href={track.source_url}
          >
            {isSpotify ? (isKr ? '🎵 Spotify에서 열기' : '🎵 Open in Spotify') : (isKr ? '📺 YouTube에서 열기' : '📺 Open in YouTube')}
          </a>
        ) : null}
      </div>

      {/* YouTube Embed Player */}
      {hasYouTubeId && showPlayer ? (
        <div className="mt-3 w-full rounded-lg overflow-hidden bg-black/40 shadow-inner animate-in slide-in-from-top-2">
          <iframe
            width="100%"
            height="180"
            src={`https://www.youtube.com/embed/${track.youtube_video_id}?autoplay=1&rel=0&modestbranding=1`}
            title={track.track_title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}

      {/* Spotify Embed Player */}
      {hasSpotifyUrl && showPlayer ? (
        <div className="mt-3 w-full rounded-lg overflow-hidden bg-black/40 shadow-inner">
          <iframe
            src={spotifyEmbedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      ) : null}
    </div>
  );
}

export default function MusicRecommendationPanel({
  genre,
  mood,
  keywords,
  duration,
  competitionMode,
  tempo,
  emotionCurve,
  autoRecommend = false,
  hideActionButton = false,
  initialRecommendations = null,
  onRecommendationsFetched = null,
  selectedTrackId = null,
  onSelectTrack = null,
}) {
  const {
    loading,
    error,
    cacheHit,
    fingerprint,
    recommendations,
    fetchRecommendations,
    setRecommendations,
  } = useMusicRecommendationStore();

  const language = useStore((s) => s.language);
  const isKr = language === 'KR';

  const hasResult = useMemo(() => {
    return Object.values(recommendations || {}).some((arr) => Array.isArray(arr) && arr.length > 0);
  }, [recommendations]);

  const [synced, setSynced] = useState(false);
  const [changeSummary, setChangeSummary] = useState(null);

  const onRecommend = async () => {
    await fetchRecommendations({ genre, mood, keywords, duration, competitionMode, tempo, emotionCurve, language });
    const summaryStr = isKr 
      ? `✓ 음악 엔진이 재실행되었습니다:\n[장르] ${genre || '-'}\n[무드] ${mood || '-'}\n[키워드] ${(keywords || []).join(', ') || '-'}`
      : `✓ Music Engine applied:\n[Genre] ${genre || '-'}\n[Mood] ${mood || '-'}\n[Keywords] ${(keywords || []).join(', ') || '-'}`;
    setChangeSummary(summaryStr);
  };

  const autoKeyRef = useRef('');
  useEffect(() => {
    if (initialRecommendations && !synced) {
      setRecommendations(initialRecommendations);
      setSynced(true);
      return;
    }

    if (!autoRecommend) return;
    const key = JSON.stringify({
      genre: genre || '',
      mood: mood || '',
      keywords: Array.isArray(keywords) ? keywords : [],
      duration: duration || '',
      competitionMode: Boolean(competitionMode),
      tempo: tempo || '',
      emotionCurve: Array.isArray(emotionCurve) ? emotionCurve : [],
      language: language || 'EN',
    });
    if (autoKeyRef.current === key || loading || hasResult) return;
    autoKeyRef.current = key;
    fetchRecommendations({ genre, mood, keywords, duration, competitionMode, tempo, emotionCurve, language });
  }, [autoRecommend, genre, mood, keywords, duration, competitionMode, tempo, emotionCurve, language, loading, fetchRecommendations, initialRecommendations, setRecommendations, hasResult, synced]);

  useEffect(() => {
    // Only call onRecommendationsFetched if it changed and is valid
    if (onRecommendationsFetched && hasResult) {
      onRecommendationsFetched(recommendations);
    }
  }, [recommendations, hasResult, onRecommendationsFetched, initialRecommendations]);

  // Build track list per strategy, apply client-side safety filters
  const allTracks = useMemo(() => {
    if (!recommendations) return [];
    const allStrategies = [...STRATEGY_ORDER_GENERAL, ...STRATEGY_ORDER_SOUNDTRACK];
    const tracks = [];
    for (const st of allStrategies) {
      const list = recommendations[st] || [];
      for (const track of list) {
        if (track?.source === 'spotify' || track?.source === 'youtube') {
          tracks.push({ ...track, _strategy: st });
        }
      }
    }
    return clientFilterExplicit(clientDedupe(tracks));
  }, [recommendations]);

  // Group: General (4 slots) then Soundtrack (2 slots)
  const generalTracks = useMemo(() => {
    return STRATEGY_ORDER_GENERAL
      .map((st) => ({
        strategy: st,
        tracks: allTracks.filter((t) => t._strategy === st).slice(0, 1),
      }))
      .filter((g) => g.tracks.length > 0);
  }, [allTracks]);

  const soundtrackTracks = useMemo(() => {
    return STRATEGY_ORDER_SOUNDTRACK
      .map((st) => ({
        strategy: st,
        tracks: allTracks.filter((t) => t._strategy === st).slice(0, 1),
      }))
      .filter((g) => g.tracks.length > 0);
  }, [allTracks]);

  const totalCount = generalTracks.reduce((s, g) => s + g.tracks.length, 0) + soundtrackTracks.reduce((s, g) => s + g.tracks.length, 0);

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5">
      {/* Header */}
      <div className="mb-4">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-slate-500">
          {isKr ? '음악 추천' : 'Music Recommendation'}
        </p>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
            <span className="text-lg">🎧</span> Spotify + YouTube Music Engine
            {totalCount > 0 && (
              <span className="ml-2 text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                {totalCount} {isKr ? '곡' : 'tracks'}
              </span>
            )}
          </h3>
          {!hideActionButton ? (
            <button
               type="button"
              onClick={onRecommend}
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-primary to-violet-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              {loading ? (isKr ? '🔄 추천 중...' : '🔄 Recommending...') : (isKr ? '✨ 음악 추천받기' : '✨ Get Recommendations')}
            </button>
          ) : null}
        </div>
      </div>

      {/* Status */}
      {error ? <p className="mb-3 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-300">⚠️ {error}</p> : null}
      {fingerprint ? (
        <p className="mb-3 text-[10px] text-slate-500 font-mono">
          🔑 {fingerprint.slice(0, 12)}... {cacheHit ? (isKr ? '(캐시)' : '(Cache)') : (isKr ? '(새로 생성)' : '(New)')}
        </p>
      ) : null}

      {/* Change Summary */}
      {changeSummary && !loading && (
        <div className="mb-4 rounded flex items-start gap-3 bg-white/5 border border-primary/20 p-3">
          <span className="material-symbols-outlined text-primary text-sm mt-0.5">summarize</span>
          <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">{changeSummary}</pre>
        </div>
      )}

      {/* Results */}
      {(generalTracks.length > 0 || soundtrackTracks.length > 0) ? (
        <div className="space-y-6">
          {/* ─── General Music Section (4 tracks) ─── */}
          {generalTracks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  {isKr ? '🎵 음악 추천' : '🎵 Music Picks'}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                <span className="text-[9px] text-slate-600">
                  {generalTracks.reduce((s, g) => s + g.tracks.length, 0)}/{STRATEGY_ORDER_GENERAL.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {generalTracks.map(({ strategy, tracks }) =>
                  tracks.map((track, idx) => (
                    <TrackCard
                      key={`${strategy}-${idx}`}
                      track={track}
                      strategy={strategy}
                      isSelected={selectedTrackId === (track.spotify_track_id || track.youtube_video_id)}
                      onSelect={onSelectTrack}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── Soundtrack / Score Section (2 tracks) ─── */}
          {soundtrackTracks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  {isKr ? '🎬 사운드트랙 추천' : '🎬 Soundtrack Picks'}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                <span className="text-[9px] text-slate-600">
                  {soundtrackTracks.reduce((s, g) => s + g.tracks.length, 0)}/{STRATEGY_ORDER_SOUNDTRACK.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mb-3 max-w-xl">
                {isKr
                  ? '사운드트랙은 장면 분위기, 공기감, 긴장감, 감정의 결을 만드는 용도로 제안합니다.'
                  : 'Soundtrack picks are curated for scene atmosphere, air-feel, tension build, and emotional texture.'}
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {soundtrackTracks.map(({ strategy, tracks }) =>
                  tracks.map((track, idx) => (
                    <TrackCard
                      key={`${strategy}-${idx}`}
                      track={track}
                      strategy={strategy}
                      isSelected={selectedTrackId === (track.spotify_track_id || track.youtube_video_id)}
                      onSelect={onSelectTrack}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="flex items-center gap-3 py-8 justify-center">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-slate-400 animate-pulse">{isKr ? 'AI가 안무에 맞는 음악을 분석하고 있어요...' : 'AI is analyzing music that fits your choreography...'}</p>
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-500">
            {autoRecommend ? (isKr ? '음악 추천을 준비 중이에요...' : 'Preparing recommendations...') : (isKr ? '아직 추천된 음악이 없어요. "음악 추천받기"를 눌러보세요!' : 'No recommendations yet. Click "Get Recommendations" to begin!')}
          </p>
        </div>
      )}
    </div>
  );
}
