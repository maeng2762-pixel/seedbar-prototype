import React, { useRef, useState } from 'react';
import useStore from '../store/useStore';

export default function CompetitionMusicCard({ track }) {
    const { language } = useStore();
    const isKr = language === 'KR';
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const tierLabel = track?.tierTag?.[isKr ? 'kr' : 'en'] || (isKr ? '🏆 콩쿠르 추천' : '🏆 Competition Pick');
    const strategicCommentary = track?.strategicCommentary || {};
    const line1 = strategicCommentary.line1 || (isKr ? '심사위원 주목도를 높이는 구조적 선곡입니다.' : 'Designed to increase jury attention.');
    const line2 = strategicCommentary.line2 || (isKr ? '기술 가시성과 해석의 선명도를 동시에 강화합니다.' : 'Boosts technical readability and interpretive clarity.');

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    };

    return (
        <div className="rounded-2xl border border-amber-300/20 bg-gradient-to-br from-[#15101f] to-[#0f0b18] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <div className="mb-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-amber-200">
                    {tierLabel}
                </span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{track?.duration || '3:00'}</span>
            </div>

            <div className="mb-4 flex items-center gap-4">
                <img
                    src={track?.album_art}
                    alt={track?.track_title || 'track art'}
                    className="h-16 w-16 rounded-lg border border-white/10 object-cover"
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{track?.track_title || 'Untitled Track'}</p>
                    <p className="truncate text-xs text-slate-400">{track?.artist || 'Unknown Artist'}</p>
                    {track?.source_url ? (
                        <a href={track.source_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[10px] text-indigo-300 underline-offset-2 hover:underline">
                            {isKr ? '원본 링크' : 'Source Link'}
                        </a>
                    ) : null}
                </div>
                <button
                    type="button"
                    onClick={togglePlay}
                    className="inline-flex h-10 items-center rounded-full border border-indigo-300/40 bg-indigo-500/20 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-100 transition hover:bg-indigo-500/35"
                >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                    {isKr ? 'Strategic Rationale' : 'Strategic Rationale'}
                </p>
                <p className="line-clamp-1 text-xs leading-relaxed text-slate-200">{line1}</p>
                <p className="line-clamp-1 text-xs leading-relaxed text-slate-300">{line2}</p>
            </div>

            <audio
                ref={audioRef}
                src={track?.actual_audio}
                preload="metadata"
                onEnded={() => setIsPlaying(false)}
            />
        </div>
    );
}
