import React from 'react';

export default function DancerRolePanel({ roleData = null }) {
  if (!roleData) {
    return (
      <div className="bg-white/5 border border-white/10 p-4 text-xs text-slate-500">
        Select a dancer on the 2D stage to inspect their role.
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 p-4 space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-primary mb-1">{roleData.dancerId}</div>
        <div className="text-sm text-white capitalize">{roleData.role}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Movement Focus</div>
        <div className="flex flex-wrap gap-2">
          {(roleData.movementFocus || []).map((item) => (
            <span key={item} className="px-2 py-1 text-[10px] bg-black/30 border border-white/10 text-slate-300">
              {item}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Stage Responsibility</div>
        <p className="text-xs text-slate-300">{roleData.stageResponsibility}</p>
      </div>
    </div>
  );
}
