import React from 'react';

export default function TimelineScrubber({ currentTime, duration, onSeek, interactive = true }) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] text-slate-500 font-mono w-10 text-right">{Math.floor(currentTime)}s</span>
      <div
        className={`flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative border border-white/10 ${interactive ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
        onClick={(e) => {
          if (!interactive) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onSeek?.(p * duration);
        }}
      >
        <div className="absolute top-0 bottom-0 left-0 bg-primary/80" style={{ width: `${progress}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff] -mr-1" />
        </div>
      </div>
      <span className="text-[10px] text-slate-500 font-mono w-10">{Math.floor(duration)}s</span>
    </div>
  );
}
