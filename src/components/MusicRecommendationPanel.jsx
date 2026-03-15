import React, { useEffect, useMemo, useRef } from 'react';
import useMusicRecommendationStore from '../store/useMusicRecommendationStore';

const STRATEGY_LABEL = {
  trend: { ko: '트렌드 반영', en: 'Trend' },
  balanced: { ko: '균형형', en: 'Balanced' },
};

function TrackCard({ track, strategy }) {
  const hasPreview = Boolean(track.actual_audio);
  const sourceLabel = track.source === 'spotify' ? 'Open in Spotify' : track.source === 'youtube' ? 'Open in YouTube' : 'Open Source';

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-primary/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          {STRATEGY_LABEL[strategy]?.en || strategy}
        </span>
        <span className="text-[10px] text-slate-400">{track.duration || '3:00'}</span>
      </div>
      <div className="flex items-center gap-3">
        <img src={track.album_art} alt="album" className="h-12 w-12 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{track.track_title}</p>
          <p className="truncate text-xs text-slate-400">{track.artist}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-300">{track.rationale}</p>
      
      {track.source === 'youtube' && track.youtube_video_id ? (
        <div className="mt-3 w-full rounded-md overflow-hidden bg-black/20">
          <iframe 
            width="100%" 
            height="150" 
            src={`https://www.youtube.com/embed/${track.youtube_video_id}`} 
            title={track.track_title} 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      ) : track.source === 'spotify' && track.source_url ? (
        <div className="mt-3 w-full rounded-md overflow-hidden bg-black/20">
          <iframe 
            src={track.source_url.replace('/track/', '/embed/track/')} 
            width="100%" 
            height="80" 
            frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
          ></iframe>
        </div>
      ) : hasPreview ? (
        <div className="mt-2 flex items-center gap-2">
          <audio controls preload="none" className="h-8 w-full" src={track.actual_audio} />
        </div>
      ) : (
        <div className="mt-2 text-[10px] text-slate-500">Preview unavailable. Use source link.</div>
      )}

      {!(track.source === 'spotify' || track.source === 'youtube') && track.source_url ? (
        <a className="mt-1 inline-block text-[11px] text-indigo-300 hover:underline" target="_blank" rel="noreferrer" href={track.source_url}>
          {sourceLabel}
        </a>
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
  autoRecommend = false,
  hideActionButton = false,
}) {
  const {
    loading,
    error,
    cacheHit,
    fingerprint,
    recommendations,
    fetchRecommendations,
  } = useMusicRecommendationStore();

  const hasResult = useMemo(() => {
    return Object.values(recommendations || {}).some((arr) => Array.isArray(arr) && arr.length > 0);
  }, [recommendations]);

  const onRecommend = () => {
    fetchRecommendations({ genre, mood, keywords, duration, competitionMode });
  };

  const autoKeyRef = useRef('');
  useEffect(() => {
    if (!autoRecommend) return;
    const key = JSON.stringify({
      genre: genre || '',
      mood: mood || '',
      keywords: Array.isArray(keywords) ? keywords : [],
      duration: duration || '',
      competitionMode: Boolean(competitionMode),
    });
    if (autoKeyRef.current === key || loading) return;
    autoKeyRef.current = key;
    fetchRecommendations({ genre, mood, keywords, duration, competitionMode });
  }, [autoRecommend, genre, mood, keywords, duration, competitionMode, loading, fetchRecommendations]);

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Spotify + YouTube Music Engine</h3>
        {!hideActionButton ? (
          <button
            type="button"
            onClick={onRecommend}
            disabled={loading}
            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Recommending...' : 'Recommend Music'}
          </button>
        ) : null}
      </div>

      {error ? <p className="mb-2 text-xs text-rose-300">{error}</p> : null}
      {fingerprint ? (
        <p className="mb-2 text-[10px] text-slate-400">
          fingerprint: {fingerprint.slice(0, 12)}... {cacheHit ? '(cache)' : '(fresh)'}
        </p>
      ) : null}

      {hasResult ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {['trend', 'balanced'].map((strategy) => (
             <div key={strategy} className="space-y-2">
              {(recommendations?.[strategy] || []).slice(0, 1).map((track, idx) => (
                <TrackCard key={`${strategy}-${idx}`} track={track} strategy={strategy} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          {autoRecommend ? 'Analyzing choreography input and preparing music...' : 'No recommendations yet. Click "Recommend Music".'}
        </p>
      )}
    </div>
  );
}
