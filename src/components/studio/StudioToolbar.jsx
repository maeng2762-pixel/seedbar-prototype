import React from 'react';

const ACTIONS = [
  { key: 'rewrite', label: '✏️ Rewrite Section', labelKr: '✏️ 섹션 재작성', color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-200 hover:bg-rose-500/20' },
  { key: 'variation', label: '🔀 Generate Variation', labelKr: '🔀 변형 생성', color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/30 text-violet-200 hover:bg-violet-500/20' },
  { key: 'tune', label: '🎛️ Tune Mood', labelKr: '🎛️ 분위기 조정', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20' },
  { key: 'addVersion', label: '➕ Add Version', labelKr: '➕ 버전 추가', color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-200 hover:bg-amber-500/20' },
];

export default function StudioToolbar({
  onRewrite,
  onVariation,
  onTune,
  onAddVersion,
  disabled = false,
  plan = 'free',
  language = 'EN',
}) {
  const isKr = language === 'KR';
  const isPro = plan === 'pro' || plan === 'studio';

  const handlers = { rewrite: onRewrite, variation: onVariation, tune: onTune, addVersion: onAddVersion };

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-4 mb-6">
      <div className="mb-3">
        <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-semibold">
          AI Choreography Studio
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          {isKr ? '안무 수정 및 실험 공간 — 섹션별 재작성, 변형, 분위기 조정' : 'Edit & experiment — rewrite sections, generate variations, tune mood'}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(({ key, label, labelKr, color }) => {
          const isLocked = !isPro && (key === 'rewrite' || key === 'tune');
          return (
            <button
              key={key}
              type="button"
              onClick={handlers[key]}
              disabled={disabled || isLocked}
              className={`flex items-center gap-1.5 rounded-lg bg-gradient-to-r ${color} border px-3 py-2 text-[11px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isKr ? labelKr : label}
              {isLocked && <span className="text-[8px] opacity-60 ml-1">PRO</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
