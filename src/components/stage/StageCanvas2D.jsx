import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const COLORS = [
  'bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-fuchsia-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-lime-500',
];
const STROKE_COLORS = [
  '#f43f5e', '#3b82f6', '#10b981', '#f59e0b',
  '#d946ef', '#06b6d4', '#6366f1', '#84cc16',
];

// Helper to create smoothed paths
function getSmoothPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const xc = (p1.x + p2.x) / 2;
    const yc = (p1.y + p2.y) / 2;
    
    if (i === 0) {
      d += ` L ${xc},${yc}`;
    } else {
       d += ` Q ${p1.x},${p1.y} ${xc},${yc}`;
    }
  }
  d += ` L ${points[points.length - 1].x},${points[points.length - 1].y}`;
  return d;
}

// Simplify path (removes minor jitters based on distance tolerance)
function simplifyPath(points, tolerance = 5) {
  if (!points || points.length <= 2) return points;
  const simplified = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const curr = points[i];
    const dist = Math.sqrt((curr.x - prev.x)**2 + (curr.y - prev.y)**2);
    if (dist > tolerance) {
      simplified.push(curr);
    }
  }
  simplified.push(points[points.length - 1]);
  return simplified;
}

export default function StageCanvas2D({ 
  dancers = [], 
  sectionLabel = '', 
  showTrail = false, 
  onSelectDancer,
  stageFlow = [], 
  isEditMode = false,
  currentTime = 0,
  duration = 180,
  isPlaying = false,
  displayMode = 'current',
  isolatedDancerId = null,
  onUpdateWaypoint,
  onDeleteWaypoint
}) {
  const containerRef = useRef(null);

  const handlePointerDown = (e, segIdx, dId) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();

    // Check if right-click or meta key or ctrl key is pressed for deletion
    if (e.button === 2 || e.metaKey || e.ctrlKey || e.altKey) {
       onDeleteWaypoint?.(segIdx);
       return;
    }

    const container = containerRef.current;
    if (!container) return;
    
    const onPointerMove = (moveEvent) => {
      const rect = container.getBoundingClientRect();
      let x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      let y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      onUpdateWaypoint?.(segIdx, dId, x, y);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-[16/9] bg-black/40 border ${isEditMode ? 'border-teal-500 border-2 shadow-[0_0_20px_rgba(20,184,166,0.3)]' : 'border-white/5'} overflow-hidden flex items-center justify-center rounded-sm transition-all`}
      onContextMenu={(e) => isEditMode && e.preventDefault()}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:25px_25px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/5 opacity-50" />
      <div className="absolute inset-6 border border-white/5 border-dashed opacity-30 pointer-events-none" />

      {/* SVG Path Visualization for Edit Mode or Path Animation */}
      {(showTrail || isEditMode) && stageFlow?.length > 0 && (
         <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0">
           {stageFlow[0].dancers.map((pBase, dIdx) => {
             // Dancer isolated mode
             if (isolatedDancerId !== null && pBase.id !== isolatedDancerId) return null;
             
             const allPoints = stageFlow.map(seg => seg.dancers[dIdx] || { x: 50, y: 50 });
             const activeSegIdx = Math.max(0, stageFlow.findIndex(s => currentTime >= s.timeStart && currentTime <= s.timeEnd));
             
             let pathPoints = allPoints;
             
             if (displayMode === 'current' && !isEditMode) {
                // Show immediate context around current section
                const startIdx = Math.max(0, activeSegIdx - 1);
                const endIdx = Math.min(allPoints.length, activeSegIdx + 2);
                pathPoints = allPoints.slice(startIdx, endIdx);
             } else if (displayMode === 'core') {
                pathPoints = simplifyPath(allPoints, 10); // Very simplified curves
             }
             
             // Base path rendering logic
             if (displayMode === 'snapshot') {
                // Snapshot Mode: Just key dots, no continuous line
                const curPoint = allPoints[activeSegIdx];
                const startPoint = allPoints[Math.max(0, activeSegIdx - 1)];
                const endPoint = allPoints[Math.min(allPoints.length - 1, activeSegIdx + 1)];
                
                return (
                   <g key={`d-path-${dIdx}`} className="mix-blend-screen">
                      <line x1={startPoint.x} y1={startPoint.y} x2={curPoint.x} y2={curPoint.y} stroke={STROKE_COLORS[dIdx % STROKE_COLORS.length]} strokeWidth="0.2" strokeDasharray="1,2" className="opacity-30" />
                      <line x1={curPoint.x} y1={curPoint.y} x2={endPoint.x} y2={endPoint.y} stroke={STROKE_COLORS[dIdx % STROKE_COLORS.length]} strokeWidth="0.2" strokeDasharray="1,2" className="opacity-10" />
                      <circle cx={startPoint.x} cy={startPoint.y} r="0.8" fill={STROKE_COLORS[dIdx % STROKE_COLORS.length]} className="opacity-50" />
                      <circle cx={endPoint.x} cy={endPoint.y} r="0.8" fill={STROKE_COLORS[dIdx % STROKE_COLORS.length]} className="opacity-30" />
                   </g>
                );
             }

             // Smooth Curve Path
             const dPath = getSmoothPath(pathPoints);

             return (
               <g key={`d-path-${dIdx}`}>
                 {/* Trajectory Base Line */}
                 <path 
                   d={dPath} 
                   fill="none" 
                   stroke={STROKE_COLORS[dIdx % STROKE_COLORS.length]} 
                   strokeWidth={isEditMode || displayMode === 'current' ? 0.4 : 0.2} 
                   strokeDasharray={isEditMode ? "1, 1" : "none"}
                   className={`${isEditMode || displayMode === 'current' ? 'opacity-60' : 'opacity-20'} mix-blend-screen transition-opacity`}
                   vectorEffect="non-scaling-stroke"
                 />
                 {/* Animated Path Overlay : Only when Playing and Not in Edit Mode */}
                 {!isEditMode && isPlaying && (
                   <motion.path 
                     d={dPath}
                     fill="none"
                     stroke={STROKE_COLORS[dIdx % STROKE_COLORS.length]}
                     strokeWidth="0.6"
                     className="opacity-80 drop-shadow-[0_0_5px_currentColor]"
                     vectorEffect="non-scaling-stroke"
                     initial={{ pathLength: 0, opacity: 0 }}
                     animate={{ pathLength: 1, opacity: 1 }}
                     transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                   />
                 )}
               </g>
             );
           })}
         </svg>
      )}

      {/* Edit Mode Waypoint Handles */}
      {isEditMode && stageFlow.map((seg, segIdx) => (
         <React.Fragment key={`wp-${segIdx}`}>
           {seg.dancers.map((d, dIdx) => {
              if (isolatedDancerId !== null && d.id !== isolatedDancerId) return null;
              return (
              <div 
                 key={`handle-${segIdx}-${d.id}`}
                 className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border border-white cursor-pointer z-20 flex items-center justify-center hover:scale-150 transition-transform bg-teal-500/50 shadow-lg group"
                 style={{ left: `${d.x}%`, top: `${d.y}%` }}
                 onPointerDown={(e) => handlePointerDown(e, segIdx, d.id)}
              >
                  {/* Tooltip to show action */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none tracking-widest uppercase whitespace-nowrap">
                    Drag D{dIdx + 1}
                  </div>
              </div>
              );
           })}
         </React.Fragment>
      ))}

      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-tighter text-slate-600 font-bold bg-black/40 px-3 py-0.5 rounded backdrop-blur border border-white/5 z-0">Backstage (UP)</div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-tighter text-slate-600 font-bold bg-black/40 px-3 py-0.5 rounded backdrop-blur border border-white/5 z-0">Audience (DOWN)</div>

      {sectionLabel ? (
        <div className="absolute top-8 left-3 text-[10px] uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded z-0">
          {sectionLabel}
        </div>
      ) : null}

      {/* Current Interpolated Dancers */}
      {dancers.map((p, i) => {
        if (isolatedDancerId !== null && p.id !== isolatedDancerId) return null;
        return (
        <motion.div
          key={p.id}
          onClick={() => !isEditMode && onSelectDancer?.(p)}
          className={`absolute w-3.5 h-3.5 md:w-5 md:h-5 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/20 transition-opacity ${isEditMode ? 'opacity-30 blur-[1px]' : 'opacity-100 z-10 cursor-pointer pointer-events-auto'}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            x: '-50%',
            y: '-50%',
          }}
          animate={!isEditMode && isPlaying ? { scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] } : {}}
          transition={!isEditMode && isPlaying ? { repeat: Infinity, duration: 1.5 } : {}}
        >
          <span className="text-[8px] md:text-[10px] text-white font-black drop-shadow-md">{p.id}</span>
          {showTrail && !isEditMode && isPlaying ? (
            <div className={`absolute inset-0 rounded-full ${COLORS[i % COLORS.length]} opacity-30 blur-md -z-10`} />
          ) : null}
        </motion.div>
        );
      })}
    </div>
  );
}
