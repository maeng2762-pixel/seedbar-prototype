import React from 'react';

export default function ProjectHeader({ title, activeVersion, lastEdited, onTitleClick }) {
  const versionLabel = activeVersion?.label || 'v1';
  const timeAgo = lastEdited ? formatTimeAgo(lastEdited) : '';

  return (
    <div className="flex flex-col gap-1 mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1
          className="text-xl md:text-2xl font-bold text-white tracking-tight cursor-pointer hover:text-indigo-200 transition-colors"
          onClick={onTitleClick}
          title="프로젝트 제목 수정"
        >
          {title || 'Untitled Project'}
        </h1>
        <span className="rounded-full bg-primary/20 border border-primary/40 px-3 py-0.5 text-[10px] uppercase tracking-widest text-indigo-200 font-semibold">
          {versionLabel}
        </span>
      </div>
      {timeAgo && (
        <p className="text-[10px] text-slate-500 tracking-wide">
          Last edited {timeAgo}
        </p>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
