import React, { useEffect, useMemo, useRef, useState } from 'react';
import useStore from '../../store/useStore';
import { ensureStageFlow, interpolateAtTime, parseDurationToSec } from '../../services/stageFlowEngine';
import StageCanvas2D from './StageCanvas2D';
import StageControls from './StageControls';
import TimelineScrubber from './TimelineScrubber';

export default function StageFlowPlayer({
  teamSize = 5,
  flowDataFromDraft = null,
  timeline = [],
  durationLabel = '03:00',
  currentPlan = 'free',
  policy = null,
  dancerRoles = [],
  selectedTime = null,
  onTimeChange = null,
  onSelectDancerRole = null,
}) {
  const language = useStore((s) => s.language);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(parseDurationToSec(durationLabel || '03:00'));
  const [stageFlow, setStageFlow] = useState([]);
  const [dancers, setDancers] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  
  // New Visualization States
  const [displayMode, setDisplayMode] = useState('current'); // 'all', 'current', 'core', 'snapshot'
  const [isolatedDancerId, setIsolatedDancerId] = useState(null);

  const rafRef = useRef(null);
  const prevRef = useRef(null);

  const flowInput = useMemo(() => {
    const flowPattern = Array.isArray(flowDataFromDraft?.flow_pattern)
      ? flowDataFromDraft.flow_pattern
      : [];
    const stageFlowFromData = Array.isArray(flowDataFromDraft?.stageFlow)
      ? flowDataFromDraft.stageFlow
      : [];

    const resolved = ensureStageFlow({
      stageFlow: stageFlowFromData,
      flowPattern,
      timeline,
      teamSize: Math.max(1, Number(teamSize || 1)),
      durationLabel,
    });
    return resolved;
  }, [flowDataFromDraft, timeline, teamSize, durationLabel]);

  useEffect(() => {
    setStageFlow(flowInput);
    const resolvedDuration = parseDurationToSec(durationLabel || '03:00');
    setDuration(resolvedDuration);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [flowInput, durationLabel, setCurrentTime, setDuration, setIsPlaying, setStageFlow]);

  useEffect(() => {
    if (typeof selectedTime === 'number' && Number.isFinite(selectedTime)) {
      setCurrentTime(selectedTime);
    }
  }, [selectedTime]);

  useEffect(() => {
    const f = interpolateAtTime(stageFlow, currentTime);
    setDancers(f.dancers);
    setSelectedSection(f.label || f.section || '');
    onTimeChange?.(currentTime, f);
  }, [stageFlow, currentTime]); // removed setDancers, setSelectedSection array refs

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      prevRef.current = null;
      return;
    }

    const tick = (ts) => {
      if (prevRef.current == null) prevRef.current = ts;
      const delta = (ts - prevRef.current) / 1000;
      prevRef.current = ts;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, duration, setCurrentTime, setIsPlaying]);

  const isFreeSimple = currentPlan === 'free';
  const interactiveScrubber = !isFreeSimple;
  const showSectionJump = !isFreeSimple;
  const showTrail = currentPlan === 'studio' || currentPlan === 'team';

  const isKr = language === 'KR';

  const handleUpdateWaypoint = (segIdx, dId, x, y) => {
    setStageFlow(prev => {
      const next = [...prev];
      const dancers = [...next[segIdx].dancers];
      const dIdx = dancers.findIndex(d => d.id === dId);
      if (dIdx >= 0) {
         dancers[dIdx] = { ...dancers[dIdx], x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
         next[segIdx] = { ...next[segIdx], dancers };
      }
      return next;
    });
  };

  const handleDeleteWaypoint = (segIdx) => {
    if (stageFlow.length <= 2) return; // Prevent deleting everything
    setStageFlow(prev => {
       const copy = prev.filter((_, i) => i !== segIdx);
       // Re-adjust time bounds
       for(let i=0; i<copy.length; i++) {
         const seg = copy[i];
         if (i === 0) seg.timeStart = 0;
         else copy[i-1].timeEnd = seg.timeStart;
         
         if (i === copy.length - 1) seg.timeEnd = duration;
       }
       return copy;
    });
  };

  const handleAddWaypoint = () => {
    const { dancers: interpDancers, label, section } = interpolateAtTime(stageFlow, currentTime);
    
    setStageFlow(prev => {
       const copy = [...prev];
       let insertIdx = copy.findIndex(s => s.timeStart > currentTime);
       if (insertIdx === -1) insertIdx = copy.length;

       const newSegment = {
          timeStart: Math.max(0, currentTime - 0.01),
          timeEnd: Math.min(duration, currentTime + 0.01),
          label: `${label} (Edit)`,
          section: section,
          dancers: [...interpDancers]
       };

       copy.splice(insertIdx, 0, newSegment);
       
       for(let i=0; i<copy.length; i++) {
           const seg = copy[i];
           if (i === 0) seg.timeStart = 0;
           else if (i < copy.length - 1) {
              seg.timeEnd = copy[i+1].timeStart;
           } else {
              seg.timeEnd = duration;
           }
       }
       return copy;
    });
  };

  return (
    <div className="w-full bg-[#161618]/90 backdrop-blur-xl border border-white/5 p-8 relative overflow-hidden flex flex-col gap-6 font-sans shadow-2xl">
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-400 flex items-center gap-3">
          <span className="w-6 h-[1px] bg-primary/50" />
          2D Stage (Flow Pattern)
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-mono tracking-widest">{Math.floor(currentTime)}s</span>
          <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-widest font-bold">
            {selectedSection || (isKr ? '구간 대기' : 'Section')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <StageCanvas2D
            dancers={dancers}
            sectionLabel={selectedSection}
            showTrail={showTrail}
            onSelectDancer={(dancer) => {
              const role = (dancerRoles || []).find((item) => item.dancerId === dancer.id) || null;
              onSelectDancerRole?.(role || { dancerId: dancer.id, role: 'ensemble', movementFocus: [], stageResponsibility: '-' });
            }}
            stageFlow={stageFlow}
            isEditMode={isEditMode}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            displayMode={displayMode}
            isolatedDancerId={isolatedDancerId}
            onUpdateWaypoint={handleUpdateWaypoint}
            onDeleteWaypoint={handleDeleteWaypoint}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white/5 border border-white/5 p-5 flex flex-col gap-3">
            <span className="text-[9px] uppercase tracking-widest text-primary font-bold">Current Section</span>
            <div className="text-lg font-light italic text-white leading-tight">{selectedSection || '-'}</div>
            <div className="w-full h-[1px] bg-white/10 my-1" />
            <span className="text-[9px] uppercase tracking-widest text-slate-500">Team Size</span>
            <p className="text-xs text-slate-300">{teamSize} {isKr ? '명' : 'dancers'}</p>
            <span className="text-[9px] uppercase tracking-widest text-slate-500">Plan</span>
            <p className="text-xs text-slate-300">{String(currentPlan || 'free').toUpperCase()}</p>
            {!policy?.canUseCompetitionMode ? (
              <p className="text-[10px] text-slate-500">{isKr ? 'Free는 단순 재생, Pro부터 스크러버 지원' : 'Free uses simple playback; scrubber on Pro+'}</p>
            ) : null}
          </div>

          {showSectionJump ? (
            <div className="bg-white/5 border border-white/5 p-3">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-2">Section Jump</div>
              <div className="flex flex-wrap gap-2">
                {(stageFlow || []).slice(0, 6).map((seg, idx) => (
                  <button
                    key={`${seg.label}-${idx}`}
                    className="px-2 py-1 text-[10px] bg-black/40 border border-white/10 hover:border-primary/40"
                    onClick={() => setCurrentTime(seg.timeStart)}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Edit Paths Tools */}
          <div className="bg-white/5 border border-white/5 p-3">
             <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-2">{isKr ? '이동 경로 수정' : 'Path Edit'}</div>
             <div className="flex flex-col gap-2">
                <button
                   onClick={() => setIsEditMode(!isEditMode)}
                   className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest border transition-all ${isEditMode ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.2)]' : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/30'}`}
                >
                   {isEditMode ? (isKr ? '편집 완료' : 'Done Editing') : (isKr ? '동선 편집' : 'Edit Paths')}
                </button>
                {isEditMode && (
                   <button
                     onClick={handleAddWaypoint}
                     className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-1"
                   >
                     <span className="material-symbols-outlined text-[12px]">add</span> {isKr ? '현재 시간에 추가' : 'Add at Current Time'}
                   </button>
                )}
             </div>
          </div>

          {/* New Display Mode Controls */}
          <div className="bg-white/5 border border-white/5 p-3">
             <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-2">{isKr ? '동선 표시 모드' : 'Display Mode'}</div>
             <div className="flex flex-col gap-2">
               <select 
                 className="bg-black/50 border border-white/10 text-[10px] text-white p-1.5 rounded outline-none"
                 value={displayMode}
                 onChange={(e) => setDisplayMode(e.target.value)}
               >
                 <option value="current">{isKr ? '현재 섹션만 보기' : 'Current Section'}</option>
                 <option value="all">{isKr ? '전체 보기' : 'Show All'}</option>
                 <option value="core">{isKr ? '핵심 경로만 보기' : 'Core Path Only'}</option>
                 <option value="snapshot">{isKr ? '구간 스냅샷' : 'Snapshot Mode'}</option>
               </select>

               {/* Dancer Isolation Controls */}
               <div className="flex flex-wrap gap-1 mt-1">
                 <button 
                    onClick={() => setIsolatedDancerId(null)}
                    className={`px-2 py-1 text-[9px] rounded border transition-colors ${isolatedDancerId === null ? 'bg-white/20 border-white/50 text-white' : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/10'}`}
                 >
                   {isKr ? '전체' : 'All'}
                 </button>
                 {dancers.map((d, i) => (
                    <button 
                      key={`iso-${d.id}`}
                      onClick={() => setIsolatedDancerId(d.id)}
                      className={`px-2 py-1 text-[9px] rounded border transition-colors ${isolatedDancerId === d.id ? 'bg-white/20 border-white/50 text-white' : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/10'}`}
                    >
                      D{i + 1}
                    </button>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-2">
        <TimelineScrubber
          currentTime={currentTime}
          duration={duration}
          interactive={interactiveScrubber}
          onSeek={(t) => setCurrentTime(Math.max(0, Math.min(duration, t)))}
        />

        <StageControls
          isPlaying={isPlaying}
          onPlay={() => {
            if (currentTime >= duration) setCurrentTime(0);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onReset={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      </div>
    </div>
  );
}
