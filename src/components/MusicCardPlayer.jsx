import React, { useState, useRef } from 'react';
import useStore from '../store/useStore';

export default function MusicCardPlayer({ track }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const { language } = useStore();
    const isKr = language === 'KR';
    const audioRef = useRef(null);

    const t = (val) => {
        if (typeof val === 'object' && val !== null) {
            return val[isKr ? 'kr' : 'en'] || val.kr || val.en || "";
        }
        return val || "";
    };

    const hasPreview = Boolean(track?.actual_audio);

    const togglePlay = () => {
        if (!hasPreview) {
            if (track?.source_url) window.open(track.source_url, '_blank', 'noopener,noreferrer');
            return;
        }
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        const curr = audioRef.current.currentTime;
        const dur = audioRef.current.duration || 1; // avoid Infinity/NaN
        setCurrentTime(curr);
        setProgress((curr / dur) * 100);
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Calculate marker position as percentage
    const getMarkerPercentage = (timeStr, trackDurationStr) => {
        const [mins, secs] = timeStr.split(':').map(Number);
        const targetSecs = mins * 60 + secs;
        
        const [durMins, durSecs] = trackDurationStr.split(':').map(Number);
        const totalDurSecs = durMins * 60 + durSecs;

        return Math.min(100, (targetSecs / totalDurSecs) * 100);
    };

    return (
        <div className="bg-white/5 border border-white/10 p-5 backdrop-blur-md rounded-xl flex flex-col gap-6 font-sans relative overflow-hidden group">
             {/* Player Top Section */}
             <div className="flex items-center gap-4 relative z-10">
                 <div className="w-14 h-14 md:w-16 md:h-16 rounded-md overflow-hidden shadow-lg shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors">
                     <img 
                         src={track.album_art} 
                         alt="album art" 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                         onError={(e) => {
                             e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${track.track_title}&backgroundColor=334155`;
                         }}
                     />
                 </div>
                 <div className="flex-1 flex flex-col justify-center min-w-0">
                     <span className="text-white font-bold text-sm truncate">{track.track_title}</span>
                     <span className="text-slate-400 text-xs truncate">{track.artist}</span>
                 </div>
                     <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary hover:bg-primary hover:text-white active:scale-95 transition-all shadow-md shrink-0 focus:outline-none">
                         <span className="material-symbols-outlined text-xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                     </button>
             </div>

             {/* BPM Timeline & Sync Visualization */}
             <div className="mt-2 relative z-10 font-mono">
                 <div className="flex justify-between text-[9px] text-slate-500 mb-2">
                     <span>{formatTime(currentTime)}</span>
                     <span>{track.duration}</span>
                 </div>
                 {/* Progress Bar Container */}
                 <div className="relative w-full h-4 flex items-center">
                     {/* Seekable Input */}
                     <input 
                         type="range"
                         min="0"
                         max="100"
                         value={progress}
                         onChange={(e) => {
                             const targetPos = parseFloat(e.target.value);
                             const dur = audioRef.current.duration;
                             if (dur) {
                                 audioRef.current.currentTime = (targetPos / 100) * dur;
                                 setProgress(targetPos);
                             }
                         }}
                         className="absolute inset-0 w-full h-1 bg-transparent appearance-none cursor-pointer z-20 accent-primary"
                         style={{
                             background: `linear-gradient(to right, #6366f1 ${progress}%, rgba(0,0,0,0.5) ${progress}%)`,
                             borderRadius: '999px'
                         }}
                     />
                     
                     {/* Markers */}
                     {(track.bpm_timeline || []).map((point, idx) => {
                         const pos = getMarkerPercentage(point.time, track.duration);
                         
                         // Determine if active (within a 10-second window of playback)
                         const [mins, secs] = point.time.split(':').map(Number);
                         const markerSecs = mins * 60 + secs;
                         const timeRatio = currentTime / (audioRef.current?.duration || 1);
                         
                         const [trackMins, trackSecs] = track.duration.split(':').map(Number);
                         const durationReal = trackMins*60 + trackSecs;

                         const simulatedPlaySecs = timeRatio * durationReal;
                         const isActive = simulatedPlaySecs >= markerSecs && simulatedPlaySecs < (markerSecs + 10);

                         return (
                             <div 
                                key={idx} 
                                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group/marker z-10"
                                style={{ left: `${pos}%` }}
                             >
                                 {/* Dot */}
                                 <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-white shadow-[0_0_8px_#fff] scale-150' : 'bg-primary/50'}`}></div>
                                 
                                 {/* Label */}
                                 <div className={`absolute top-4 flex flex-col items-center text-center transition-all duration-300 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/5 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover/marker:opacity-100 group-hover/marker:translate-y-0 z-20'}`}>
                                     <span className={`text-[8px] font-bold whitespace-nowrap ${isActive ? 'text-white' : 'text-slate-300'}`}>{point.time} / {t(point.stage)}</span>
                                     <span className={`text-[7px] text-primary whitespace-nowrap`}>{t(point.action)}</span>
                                 </div>
                             </div>
                         );
                     })}
                 </div>
             </div>

             {/* Background glow of album art */}
             <div 
                className="absolute inset-0 bg-cover bg-center opacity-[0.03] blur-2xl pointer-events-none transition-opacity duration-500 group-hover:opacity-10" 
                style={{ backgroundImage: `url(${track.album_art})` }}
             ></div>

             {/* HTML5 Audio - we use loop so tests run better */}
             {hasPreview ? (
                <audio 
                    ref={audioRef} 
                    src={track.actual_audio} 
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    preload="metadata"
                />
             ) : null}
        </div>
    );
}
