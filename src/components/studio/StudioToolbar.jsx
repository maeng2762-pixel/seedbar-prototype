import React from 'react';

const ACTIONS = [
  { key: 'rewrite', label: '✏️ Rewrite Section', labelKr: '✏️ 섹션 재작성', descKr: '특정 구간의 안무 설명을 다시 생성합니다.', descEn: 'Regenerate specific choreography sections.', color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-200 hover:bg-rose-500/30' },
  { key: 'variation', label: '🔀 Generate Variation', labelKr: '🔀 변형 생성', descKr: '기존 구조를 유지한 채 다른 버전을 만듭니다.', descEn: 'Create alternative versions keeping the core structure.', color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/30 text-violet-200 hover:bg-violet-500/30' },
  { key: 'tune', label: '🎛️ Mood Tuning', labelKr: '🎛️ 분위기 조정', descKr: '슬라이더를 통해 작품의 감정 톤과 에너지감을 조절합니다.', descEn: 'Adjust the emotional tone and energy intensity via sliders.', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/30' },
  { key: 'addVersion', label: '➕ Add Version', labelKr: '➕ 버전 저장', descKr: '현재 결과물을 새로운 버전으로 저장합니다.', descEn: 'Save the current result as a new version.', color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-200 hover:bg-amber-500/30' },
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
    <div className="rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-5 mb-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white mb-1">
          {isKr ? '작업 도구 모음' : 'Studio Tools'}
        </h3>
        <p className="text-xs text-slate-400">
          {isKr 
            ? '하나의 스튜디오 화면 안에서 재작성, 변형, 분위기 조정, 버전 저장까지 이어서 작업할 수 있습니다.' 
            : 'Work inside one studio space to rewrite, vary, tune, and save versions without switching modes.'}
        </p>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {ACTIONS.map(({ key, label, labelKr, descKr, descEn, color }) => {
          const isLocked = !isPro && (key === 'rewrite' || key === 'tune' || key === 'variation');
          return (
            <button
              key={key}
              type="button"
              onClick={handlers[key]}
              disabled={disabled || isLocked}
              className={`flex flex-col items-start gap-1.5 rounded-xl bg-gradient-to-br ${color} border p-4 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isKr ? descKr : descEn}
            >
              <div className="flex items-center gap-2 w-full font-semibold text-sm">
                <span>{isKr ? labelKr : label}</span>
                {isLocked && <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-black/50 text-white/70">PRO</span>}
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed mt-1">
                {isKr ? descKr : descEn}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
