import React, { useState } from 'react';
import VersionCompareModal from './VersionCompareModal';

export default function VersionManager({
  versions = [],
  activeVersionId = null,
  onSelect,
  onDuplicate,
  onDelete,
  onGenerate,
  disabled = false,
  busyAction = null,
  busyVersionId = null,
  errorMessage = '',
  onDismissError,
  plan = 'free',
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const isPro = plan === 'studio' || plan === 'team';
  const isFree = !isPro;
  const canAdd = isPro || versions.length < 2;
  const isBusy = Boolean(disabled || busyAction);

  const handleToggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    setSelectedForCompare([]);
  };

  const handleSelectVersion = (version) => {
    if (isCompareMode) {
      setSelectedForCompare(prev => {
        if (prev.includes(version.id)) return prev.filter(id => id !== version.id);
        if (prev.length < 2) return [...prev, version.id];
        return prev;
      });
    } else {
      onSelect?.(version);
    }
  };

  const handleOpenCompare = () => {
    if (selectedForCompare.length === 2) {
      setShowCompareModal(true);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-6 relative">
      {showCompareModal && (
        <VersionCompareModal
           versions={versions}
           v1Id={selectedForCompare[0]}
           v2Id={selectedForCompare[1]}
           onClose={() => setShowCompareModal(false)}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-semibold">Version Manager</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {versions.length}개 버전 · {isFree ? '최대 2개 (Free)' : '무제한 (Pro)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isCompareMode && selectedForCompare.length === 2 && (
            <button
               type="button"
             onClick={handleOpenCompare}
             disabled={isBusy}
               className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold bg-teal-500/20 border border-teal-500/40 hover:bg-teal-500/30 text-white rounded-lg transition-all"
            >
               ⚖️ Compare Versions
            </button>
          )}
          <button
             type="button"
             onClick={handleToggleCompareMode}
             disabled={isBusy}
             className={`px-3 py-2 text-[10px] uppercase tracking-widest font-semibold rounded-lg transition-all border disabled:opacity-40 disabled:cursor-not-allowed ${isCompareMode ? 'bg-primary/20 border-primary/40 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
          >
             {isCompareMode ? 'Cancel Compare' : 'Compare Mode'}
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isBusy || !canAdd || isCompareMode}
            className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold bg-primary/20 border border-primary/40 hover:bg-primary/30 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {busyAction === 'generate' ? 'Generating...' : '✨ Generate Variation'}
            {!canAdd && <span className="text-[8px] ml-1 opacity-60">PRO</span>}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2">
          <p className="text-[11px] leading-relaxed text-rose-200">{errorMessage}</p>
          <button
            type="button"
            onClick={onDismissError}
            className="shrink-0 text-[10px] uppercase tracking-[0.22em] text-rose-100/80 transition-colors hover:text-rose-100"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {versions.map((version) => {
          const isActive = activeVersionId === version.id && !isCompareMode;
          const isConfirming = confirmDeleteId === version.id;
          const isSelectedForCompare = selectedForCompare.includes(version.id);
          const isRowBusy = busyVersionId === version.id;

          return (
            <div
              key={version.id}
              className={`rounded-lg border p-3 transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-primary/15 border-primary/50 shadow-md shadow-primary/10'
                  : isSelectedForCompare
                  ? 'bg-teal-500/15 border-teal-500/50 shadow-md shadow-teal-500/10' 
                  : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05]'
              }`}
              onClick={() => {
                if (isBusy) return;
                handleSelectVersion(version);
              }}
            >
              {isRowBusy ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background-dark/60 backdrop-blur-[2px]">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-white" />
                </div>
              ) : null}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">
                  {version.label || `v${version.versionNumber}`}
                </span>
                {isActive && (
                  <span className="text-[8px] uppercase tracking-widest bg-primary/30 text-primary px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mb-3">
                {formatTimeAgo(version.createdAt)}
              </p>
              <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onSelect?.(version)}
                  disabled={isBusy}
                  className="flex-1 py-1.5 text-[9px] uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded transition-all"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate?.(version.id)}
                  disabled={isBusy || !canAdd}
                  className="flex-1 py-1.5 text-[9px] uppercase tracking-wider bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 rounded transition-all disabled:opacity-40"
                >
                  {isRowBusy && busyAction === 'duplicate' ? '...' : 'Duplicate'}
                </button>
                {!isConfirming ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(version.id)}
                    disabled={isBusy || versions.length <= 1}
                    className="flex-1 py-1.5 text-[9px] uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 rounded transition-all disabled:opacity-40"
                  >
                    Delete
                  </button>
                ) : (
                  <div className="flex-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onDelete?.(version.id);
                        setConfirmDeleteId(null);
                      }}
                      disabled={isBusy}
                      className="flex-1 py-1.5 text-[9px] uppercase tracking-wider bg-rose-500/30 border border-rose-500/50 text-white rounded transition-all font-bold"
                    >
                      확인
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={isBusy}
                      className="flex-1 py-1.5 text-[9px] uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400 rounded transition-all"
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  return `${days}일 전`;
}
