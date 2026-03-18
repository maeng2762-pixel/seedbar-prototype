import React from 'react';

export default function AutosaveIndicator({ state = 'idle', updatedAt = null }) {
  const label = state === 'saving'
    ? 'Saving...'
    : state === 'saved'
      ? 'Saved'
      : state === 'failed'
        ? 'Autosave failed'
        : 'Autosave idle';

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest border border-white/10 bg-white/5 text-slate-300">
      <span className={`w-2 h-2 rounded-full ${
        state === 'saving'
          ? 'bg-amber-400 animate-pulse'
          : state === 'saved'
            ? 'bg-emerald-400'
            : state === 'failed'
              ? 'bg-rose-400'
              : 'bg-slate-500'
      }`} />
      <span>{state === 'saving' ? '저장 중...' : state === 'saved' ? '안전하게 저장됨' : state === 'failed' ? '저장 실패' : 'Autosave idle'}</span>
      {updatedAt ? <span className="text-slate-500 normal-case">{new Date(updatedAt).toLocaleTimeString()}</span> : null}
    </div>
  );
}
