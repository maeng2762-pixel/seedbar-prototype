import React from 'react';

export default function StageControls({ isPlaying, onPlay, onPause, onReset }) {
  return (
    <div className="flex items-center justify-center gap-6">
      <button onClick={onReset} className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90 border border-white/10">
        <span className="material-symbols-outlined text-[18px]">replay</span>
      </button>

      {isPlaying ? (
        <button onClick={onPause} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-3xl">pause</span>
        </button>
      ) : (
        <button onClick={onPlay} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-3xl">play_arrow</span>
        </button>
      )}

      <button onClick={onPause} className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90 border border-white/10">
        <span className="material-symbols-outlined text-[18px]">stop</span>
      </button>
    </div>
  );
}
