import React from 'react';

export default function RewriteButton({ label = 'Rewrite', disabled = false, loading = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-sans border border-white/15 bg-white/5 hover:bg-white/10 hover:border-primary/40 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      {loading ? '...' : label}
    </button>
  );
}
