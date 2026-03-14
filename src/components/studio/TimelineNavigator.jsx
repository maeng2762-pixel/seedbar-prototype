import React from 'react';

export default function TimelineNavigator({
  items = [],
  selectedTime = null,
  beatMarkers = [],
  onJump,
}) {
  return (
    <div className="bg-black/20 border border-white/10 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Timeline Navigator</div>
        <div className="flex flex-wrap gap-2">
          {beatMarkers.map((marker) => (
            <span
              key={marker.id}
              className="px-2 py-1 text-[9px] uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary"
            >
              {marker.time} {marker.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => {
          const time = item?.time || `${idx}`;
          const label = typeof item?.stage === 'object' ? (item.stage.en || item.stage.kr || `Section ${idx + 1}`) : (item?.stage || `Section ${idx + 1}`);
          const active = selectedTime === time;
          return (
            <button
              key={`${time}-${idx}`}
              type="button"
              onClick={() => onJump?.(item, idx)}
              className={`px-3 py-2 text-left border transition-all ${
                active
                  ? 'bg-primary/20 border-primary/50 text-white'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/25'
              }`}
            >
              <div className="text-[10px] font-mono">{time}</div>
              <div className="text-[10px] uppercase tracking-widest mt-1">{label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
