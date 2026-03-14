import React from 'react';
import { motion } from 'framer-motion';

const COLORS = [
  'bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-fuchsia-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-lime-500',
];

export default function StageCanvas2D({ dancers = [], sectionLabel = '', showTrail = false, onSelectDancer }) {
  return (
    <div className="relative w-full aspect-[16/9] bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center rounded-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:25px_25px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/5 opacity-50" />
      <div className="absolute inset-6 border border-white/5 border-dashed opacity-30 pointer-events-none" />

      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-tighter text-slate-600 font-bold bg-black/40 px-3 py-0.5 rounded backdrop-blur border border-white/5">Backstage (UP)</div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-tighter text-slate-600 font-bold bg-black/40 px-3 py-0.5 rounded backdrop-blur border border-white/5">Audience (DOWN)</div>

      {sectionLabel ? (
        <div className="absolute top-8 left-3 text-[10px] uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded">
          {sectionLabel}
        </div>
      ) : null}

      {dancers.map((p, i) => (
        <motion.div
          key={p.id}
          onClick={() => onSelectDancer?.(p)}
          className={`absolute w-3.5 h-3.5 md:w-5 md:h-5 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] z-10 border border-white/20 cursor-pointer`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            x: '-50%',
            y: '-50%',
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <span className="text-[8px] md:text-[10px] text-white font-black drop-shadow-md">{p.id}</span>
          {showTrail ? (
            <div className={`absolute inset-0 rounded-full ${COLORS[i % COLORS.length]} opacity-30 blur-md -z-10`} />
          ) : null}
        </motion.div>
      ))}
    </div>
  );
}
