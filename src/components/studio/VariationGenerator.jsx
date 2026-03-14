import React from 'react';

export default function VariationGenerator({
  versions = [],
  activeVersionId = null,
  disabled = false,
  onGenerate,
  onSelect,
}) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Variation Generator</div>
          <div className="text-sm text-white mt-1">Version A / B / C exploration</div>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled}
          className="px-4 py-2 text-[11px] uppercase tracking-widest font-sans bg-primary/20 border border-primary/40 hover:bg-primary/30 text-white disabled:opacity-40 transition-all"
        >
          Generate Variation
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {versions.map((version) => (
          <button
            key={version.id}
            type="button"
            onClick={() => onSelect?.(version)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-all ${
              activeVersionId === version.id
                ? 'bg-primary/20 border-primary/50 text-white'
                : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
            }`}
          >
            {version.label || `Version ${version.versionNumber}`}
          </button>
        ))}
      </div>
    </div>
  );
}
