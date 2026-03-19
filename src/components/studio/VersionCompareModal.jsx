import React, { useMemo } from 'react';
import useStore from '../../store/useStore';
import { motion } from 'framer-motion';

export default function VersionCompareModal({ versions, v1Id, v2Id, onClose }) {
  const language = useStore((s) => s.language);
  const isKr = language === 'KR';

  const v1 = useMemo(() => versions.find(v => v.id === v1Id), [versions, v1Id]);
  const v2 = useMemo(() => versions.find(v => v.id === v2Id), [versions, v2Id]);
  const v1Content = v1?.generatedContent || v1?.content || {};
  const v2Content = v2?.generatedContent || v2?.content || {};

  if (!v1 || !v2) return null;

  const getDiffClass = (val1, val2) => {
    if (JSON.stringify(val1) !== JSON.stringify(val2)) return 'text-teal-400 bg-teal-400/10 px-1 rounded';
    return 'text-slate-300';
  };

  const getEmotionCurveSummary = (content) => {
    const intensities = content?.narrative?.emotionCurve?.intensities || [];
    return intensities.length > 0 ? intensities.join(' -> ') : 'N/A';
  };

  const getStructureSummary = (content) => {
    const stages = content?.timing || {};
    return Object.keys(stages).filter(k => k !== 'totalDuration').join(', ') || 'N/A';
  };

  const getTimelineSummary = (content) => {
    const timeline = content?.timeline || [];
    if (!Array.isArray(timeline)) return 'N/A';
    return timeline.length + (isKr ? '개 구간' : ' sections');
  };

  const getFlowSummary = (content) => {
     const flow = content?.flow?.flow_pattern || [];
     if (!Array.isArray(flow)) return 'N/A';
     return flow.length + (isKr ? '개 동선 패턴' : ' flow patterns');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
           <h2 className="text-sm uppercase tracking-widest font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-500">compare_arrows</span>
              {isKr ? '버전 비교' : 'Version Compare'}
           </h2>
           <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all">
              <span className="material-symbols-outlined text-lg">close</span>
           </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
           <div className="grid grid-cols-2 gap-6">
              {/* V1 Column */}
              <div className="flex flex-col gap-6">
                 <div className="pb-3 border-b border-white/10">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">Version A</span>
                    <h3 className="text-lg font-bold text-white">{v1.label || `v${v1.versionNumber}`}</h3>
                 </div>
                 
                 <CompareSection title={isKr ? "안무 구조 (Structure)" : "Choreography Structure"}>
                    <p className={getDiffClass(getStructureSummary(v1Content), getStructureSummary(v2Content))}>
                        {getStructureSummary(v1Content)}
                    </p>
                 </CompareSection>

                 <CompareSection title={isKr ? "감정 곡선 (Emotion Curve)" : "Emotion Curve"}>
                    <p className={getDiffClass(getEmotionCurveSummary(v1Content), getEmotionCurveSummary(v2Content))}>
                        {getEmotionCurveSummary(v1Content)}
                    </p>
                 </CompareSection>

                 <CompareSection title={isKr ? "타임라인 (Timeline)" : "Timeline"}>
                    <p className={getDiffClass(getTimelineSummary(v1Content), getTimelineSummary(v2Content))}>
                        {getTimelineSummary(v1Content)}
                        <span className="text-[10px] text-slate-500 ml-2">({v1Content?.timing?.totalDuration || '03:00'})</span>
                    </p>
                 </CompareSection>

                 <CompareSection title={isKr ? "무대 동선 (Stage Flow)" : "Stage Flow"}>
                    <p className={getDiffClass(getFlowSummary(v1Content), getFlowSummary(v2Content))}>
                        {getFlowSummary(v1Content)}
                    </p>
                 </CompareSection>
              </div>

              {/* V2 Column */}
              <div className="flex flex-col gap-6">
                 <div className="pb-3 border-b border-white/10">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">Version B</span>
                    <h3 className="text-lg font-bold text-white">{v2.label || `v${v2.versionNumber}`}</h3>
                 </div>

                 <CompareSection title={isKr ? "안무 구조 (Structure)" : "Choreography Structure"}>
                    <p className={getDiffClass(getStructureSummary(v2Content), getStructureSummary(v1Content))}>
                        {getStructureSummary(v2Content)}
                    </p>
                 </CompareSection>

                 <CompareSection title={isKr ? "감정 곡선 (Emotion Curve)" : "Emotion Curve"}>
                    <p className={getDiffClass(getEmotionCurveSummary(v2Content), getEmotionCurveSummary(v1Content))}>
                        {getEmotionCurveSummary(v2Content)}
                    </p>
                 </CompareSection>

                 <CompareSection title={isKr ? "타임라인 (Timeline)" : "Timeline"}>
                    <p className={getDiffClass(getTimelineSummary(v2Content), getTimelineSummary(v1Content))}>
                        {getTimelineSummary(v2Content)}
                        <span className="text-[10px] text-slate-500 ml-2">({v2Content?.timing?.totalDuration || '03:00'})</span>
                    </p>
                 </CompareSection>

                 <CompareSection title={isKr ? "무대 동선 (Stage Flow)" : "Stage Flow"}>
                    <p className={getDiffClass(getFlowSummary(v2Content), getFlowSummary(v1Content))}>
                        {getFlowSummary(v2Content)}
                    </p>
                 </CompareSection>
              </div>
           </div>
        </div>
        <div className="p-4 border-t border-white/10 flex justify-end bg-black">
           <button 
             onClick={onClose}
             className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors text-xs uppercase tracking-widest font-bold flex items-center gap-2"
           >
              {isKr ? '닫기' : 'Close'}
           </button>
        </div>
      </motion.div>
    </div>
  );
}

function CompareSection({ title, children }) {
   return (
      <div className="flex flex-col gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
         <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{title}</span>
         <div className="text-sm">
            {children}
         </div>
      </div>
   );
}
