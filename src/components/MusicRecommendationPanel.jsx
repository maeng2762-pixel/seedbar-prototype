import React, { useEffect, useMemo, useRef, useState } from 'react';
import useMusicRecommendationStore from '../store/useMusicRecommendationStore';

const STRATEGY_LABEL = {
  trend: { ko: '트렌드 반영', en: '🔥 Trend', color: 'from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-300' },
  balanced: { ko: '균형형', en: '⚖️ Balanced', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300' },
  counterpoint: { ko: '차별화', en: '💎 Counterpoint', color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/30 text-violet-300' },
};

// ─── Client-side filters (safety net after backend) ───
const EXPLICIT_KEYWORDS = ['explicit', 'uncensored', '18+', 'adult', 'nsfw'];

function normalizeStr(s = '') {
  return s.toLowerCase().replace(/[^a-z0-9\uac00-\ud7a3]/g, '');
}

/** Remove duplicates by title+artist AND cross-platform ID comparison */
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

/** Filter explicit content from YouTube tracks by keyword matching */
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
  const strategyStyle = STRATEGY_LABEL[strategy] || {};

  // Spotify embed URL: works by converting /track/xxx to /embed/track/xxx
  const spotifyEmbedUrl = hasSpotifyUrl
    ? track.source_url.replace('open.spotify.com/track/', 'open.spotify.com/embed/track/')
    : '';

  // Can we embed something?
  const canEmbed = hasYouTubeId || hasSpotifyUrl;

  return (
    <div className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300">
      {/* Header: Strategy badge + duration */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isSelected && <span className="text-green-400 text-sm">✅</span>}
          <span className={`rounded-full bg-gradient-to-r ${strategyStyle.color || 'bg-primary/20 text-primary'} border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider`}>
            {strategyStyle.en || strategy}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{track.duration || '3:00'}</span>
      </div>

      {/* Track info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={track.album_art}
            alt="album"
            className="h-14 w-14 rounded-lg object-cover shadow-lg group-hover:shadow-xl transition-shadow"
            onError={(e) => {
              e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(track.track_title)}&backgroundColor=0d0a1c&shapeColor=6366f1`;
            }}
          />
          {/* Source badge */}
          <span className={`absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider ${isSpotify ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {isSpotify ? 'SP' : 'YT'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">{track.track_title}</p>
          <p className="truncate text-xs text-slate-400">{track.artist}</p>
        </div>
      </div>

      {/* Rationale */}
      {track.rationale && (
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400 italic">{track.rationale}</p>
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
            {showPlayer ? '플레이어 닫기' : '여기서 재생'}
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
          {isSelected ? '선택됨' : '선택하기'}
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
            {isSpotify ? '🎵 Spotify에서 열기' : '📺 YouTube에서 열기'}
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

  const hasResult = useMemo(() => {
    return Object.values(recommendations || {}).some((arr) => Array.isArray(arr) && arr.length > 0);
  }, [recommendations]);

  const onRecommend = async () => {
    await fetchRecommendations({ genre, mood, keywords, duration, competitionMode, tempo, emotionCurve });
  };

  const autoKeyRef = useRef('');
  useEffect(() => {
    if (initialRecommendations) {
      setRecommendations(initialRecommendations);
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
    });
    if (autoKeyRef.current === key || loading || hasResult) return;
    autoKeyRef.current = key;
    fetchRecommendations({ genre, mood, keywords, duration, competitionMode, tempo, emotionCurve });
  }, [autoRecommend, genre, mood, keywords, duration, competitionMode, tempo, emotionCurve, loading, fetchRecommendations, initialRecommendations, setRecommendations, hasResult]);

  useEffect(() => {
    if (onRecommendationsFetched && hasResult && recommendations !== initialRecommendations) {
      onRecommendationsFetched(recommendations);
    }
  }, [recommendations, hasResult, onRecommendationsFetched, initialRecommendations]);

  // Flatten all tracks from all strategies, filter only real provider results
  // Apply client-side dedupe + explicit filter as safety net
  const allTracks = useMemo(() => {
    if (!recommendations) return [];
    const strategies = ['trend', 'balanced', 'counterpoint'];
    const tracks = [];
    for (const st of strategies) {
      const list = recommendations[st] || [];
      for (const track of list) {
        if (track?.source === 'spotify' || track?.source === 'youtube') {
          tracks.push({ ...track, _strategy: st });
        }
      }
    }
    // Remove duplicates (title+artist & cross-platform ID) and explicit content
    return clientFilterExplicit(clientDedupe(tracks));
  }, [recommendations]);

  // Group by strategy for display, show up to 2 per strategy for variety
  const grouped = useMemo(() => {
    const strategies = ['trend', 'balanced', 'counterpoint'];
    return strategies
      .map((st) => ({
        strategy: st,
        tracks: allTracks.filter((t) => t._strategy === st).slice(0, 2),
      }))
      .filter((g) => g.tracks.length > 0);
  }, [allTracks]);

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5">
      {/* Header */}
      <div className="mb-4">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-slate-500">
          음악 추천
        </p>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
            <span className="text-lg">🎧</span> Spotify + YouTube Music Engine
          </h3>
          {!hideActionButton ? (
            <button
              type="button"
              onClick={onRecommend}
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-primary to-violet-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              {loading ? '🔄 추천 중...' : '✨ 음악 추천받기'}
            </button>
          ) : null}
        </div>
      </div>

      {/* Status */}
      {error ? <p className="mb-3 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-300">⚠️ {error}</p> : null}
      {fingerprint ? (
        <p className="mb-3 text-[10px] text-slate-500 font-mono">
          🔑 {fingerprint.slice(0, 12)}... {cacheHit ? '(캐시)' : '(새로 생성)'}
        </p>
      ) : null}

      {/* Results */}
      {grouped.length > 0 ? (
        <div className="space-y-4">
          {grouped.map(({ strategy, tracks }) => (
            <div key={strategy}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {tracks.map((track, idx) => (
                  <TrackCard 
                    key={`${strategy}-${idx}`} 
                    track={track} 
                    strategy={strategy} 
                    isSelected={selectedTrackId === (track.spotify_track_id || track.youtube_video_id)}
                    onSelect={onSelectTrack}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="flex items-center gap-3 py-8 justify-center">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-slate-400 animate-pulse">AI가 안무에 맞는 음악을 분석하고 있어요...</p>
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-500">
            {autoRecommend ? '음악 추천을 준비 중이에요...' : '아직 추천된 음악이 없어요. "음악 추천받기"를 눌러보세요!'}
          </p>
        </div>
      )}
    </div>
  );
}
