import React, { useState, useRef } from 'react';
import useStore from '../store/useStore';
import FlowPatternSimulator from './FlowPatternSimulator';
import MusicRecommendationPanel from './MusicRecommendationPanel';
import RewriteButton from './studio/RewriteButton';
import VariationGenerator from './studio/VariationGenerator';
import TimelineNavigator from './studio/TimelineNavigator';
import DancerRolePanel from './studio/DancerRolePanel';
import AutosaveIndicator from './studio/AutosaveIndicator';
import { generateFlowFromTimeline } from '../services/aiPipeline';
import { getPlanHeaders } from '../lib/subscriptionContext';
import { apiUrl } from '../lib/apiClient';
import useChoreographyStudioStore from '../store/useChoreographyStudioStore';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Mapped from the 7-Step Pipeline Output
// Note: The UI now follows "Contemporary Art Exhibition Catalog" standards.
// Minimal typography, large white space, and high contrast.

function formatRelativeTime(value) {
    if (!value) return '-';
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
}

function deriveBeatMarkers(timeline = []) {
    const labels = ['Intro', 'Build', 'Drop', 'Outro'];
    return (timeline || []).slice(0, 4).map((item, index) => ({
        id: `beat_${index + 1}`,
        time: item?.time || '0:00',
        label: labels[index] || `Beat ${index + 1}`,
    }));
}

function deriveDancerRoles(teamSize = 1) {
    const roleLabels = ['Leader', 'Counterpoint', 'Support', 'Accent', 'Anchor', 'Orbit'];
    return Array.from({ length: Math.max(1, Number(teamSize || 1)) }, (_, index) => ({
        dancerId: `D${index + 1}`,
        role: roleLabels[index] || 'Ensemble',
        movementFocus: index % 2 === 0 ? ['explosive jumps', 'sharp direction change'] : ['slow suspension', 'grounded transitions'],
        stageResponsibility: index === 0 ? 'front stage emphasis' : 'mid stage visual balance',
    }));
}

function parseTimelineTimeToSeconds(value) {
    const parts = String(value || '0:00').split(':').map(Number);
    if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
    if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    return 0;
}

export default function ChoreographyDraft({ data, projectId = null, currentPlan = 'free', policy = null, dancersCount = 5, onDataUpdate, onOpenUpgrade }) {
    const language = useStore((s) => s.language);
    const isKr = language === 'KR';

    const chartRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState("");
    const [selectedTimelineTime, setSelectedTimelineTime] = useState(null);
    const [selectedDancerRole, setSelectedDancerRole] = useState(null);

    const [timelineItems, setTimelineItems] = useState(data?.timing?.timeline || []);
    const [expandedCues, setExpandedCues] = useState({});
    const [flowPatternData, setFlowPatternData] = useState(data?.flow?.flow_pattern || []);
    const {
        setProjectId,
        versions,
        activeVersionId,
        setActiveVersionId,
        sliders,
        setSlider,
        createVersion,
        generateVariations,
        refreshVersions,
        rewriteSection,
        tuneBySliders,
        fetchFullPackage,
        sectionLoading,
        packageData,
        autosaveState,
        autosaveUpdatedAt,
    } = useChoreographyStudioStore();
    
    React.useEffect(() => {
        if (data?.timing?.timeline) {
            setTimelineItems(data.timing.timeline);
        }
    }, [data?.timing?.timeline]);

    React.useEffect(() => {
        if (data?.flow?.flow_pattern) {
            setFlowPatternData(data.flow.flow_pattern);
        }
    }, [data?.flow?.flow_pattern]);

    // Helper for bilingual content
    const t = (val) => {
        if (typeof val === 'object' && val !== null) {
            return val[isKr ? 'kr' : 'en'] || val.kr || val.en || "";
        }
        return val || "";
    };

    const handleRefreshFlow = () => {
        const mood = data?.mood || "";
        const result = generateFlowFromTimeline(timelineItems, dancersCount, mood);
        setFlowPatternData(result.flow_pattern);
    };

    // Fallback to avoid crashes if data is not yet available
    const draftData = data || {
        titles: { scientific: { en: '-', kr: '-' }, radical: { en: '-', kr: '-' }, surreal: { en: '-', kr: '-' }, minimalist: { en: '-', kr: '-' } },
        concept: { artisticPhilosophy: { en: "-", kr: "-" }, artisticStatement: { en: "-", kr: "-" } },
        narrative: { intro: "-", development: "-", climax: "-", resolution: "-", emotionCurve: { labels: [], intensities: [] }, lma: { space: "-", weight: "-", time: "-", flow: "-" } },
        music: { style: "-", tempoBpm: "-", soundTexture: "-", referenceArtists: "-" },
        flow: { flow_pattern: [] },
        timing: { totalDuration: "3:00", emotionStructure: {}, timeline: [] },
        stage: { lighting: "-", costume: "-", props: "-" },
        pamphlet: { coverTitle: "-", performanceDesc: "-", artisticStatement: { en: "-", kr: "-" }, choreographerNote: "-", musicCredits: "-", cast: "-" }
    };
    const isCompetitionMode = Boolean(draftData?.isCompetition || draftData?.pamphlet?.isCompetition);
    const beatMarkers = draftData?.beatMarkers || deriveBeatMarkers(timelineItems);
    const dancerRoles = draftData?.dancerRoles || deriveDancerRoles(Number(dancersCount) || Number(draftData?.seedbarInput?.teamSize) || 1);
    const projectStatus = draftData?.projectStatus || 'draft';
    const lastEdited = draftData?.lastEdited || autosaveUpdatedAt || null;
    const musicInput = {
        genre: draftData?.seedbarInput?.genre || draftData?.genre || 'Contemporary Dance',
        mood: draftData?.seedbarInput?.mood || t(draftData?.concept?.artisticPhilosophy) || '',
        keywords: draftData?.seedbarInput?.keywords || [],
        duration: draftData?.seedbarInput?.duration || draftData?.timing?.totalDuration || '03:00',
        competitionMode: Boolean(draftData?.seedbarInput?.competitionMode || isCompetitionMode),
    };

    React.useEffect(() => {
        if (!projectId) return;
        setProjectId(projectId);
        refreshVersions().catch(() => {});
    }, [projectId, setProjectId, refreshVersions]);

    const applySectionPatch = (section, content) => {
        const next = JSON.parse(JSON.stringify(draftData || {}));
        if (section === 'story') {
            if (content?.storyConcept) next.concept = content.storyConcept;
            if (content?.narrativeArc) next.narrative = { ...(next.narrative || {}), ...(content.narrativeArc || {}) };
        }
        if (section === 'movement' || section === 'formation') {
            if (content?.choreographyStructure) next.timing = { ...(next.timing || {}), ...(content.choreographyStructure || {}) };
            if (content?.movementVocabulary) next.flow = { ...(next.flow || {}), ...(content.movementVocabulary || {}) };
            if (Array.isArray(content?.formationDesign)) {
                next.flow = { ...(next.flow || {}), flow_pattern: content.formationDesign };
            }
        }
        if (section === 'music') next.music = { ...(next.music || {}), ...(content || {}) };
        if (section === 'stage') next.stage = { ...(next.stage || {}), ...(content || {}) };
        if (section === 'artist_note') next.pamphlet = { ...(next.pamphlet || {}), choreographerNote: content?.choreographerNote || content };
        next.projectStatus = 'in_progress';
        next.lastEdited = new Date().toISOString();
        onDataUpdate?.(next);
    };

    const handleRewriteSection = async (section) => {
        try {
            const res = await rewriteSection(section);
            applySectionPatch(section, res.content);
        } catch (error) {
            onOpenUpgrade?.(error.message);
        }
    };

    const handleCreateVersion = async () => {
        try {
            await createVersion(draftData, draftData?.pamphlet?.coverTitle || draftData?.titles?.scientific?.en || null);
        } catch (error) {
            onOpenUpgrade?.(error.message);
        }
    };

    const handleGenerateVariation = async () => {
        try {
            const res = await generateVariations();
            const first = res?.variations?.[0];
            if (first?.generatedContent) {
                setActiveVersionId(first.id);
                onDataUpdate?.({ ...first.generatedContent, projectId, lastEdited: first.createdAt, projectStatus: first.generatedContent?.projectStatus || 'in_progress' });
            }
        } catch (error) {
            onOpenUpgrade?.(error.message);
        }
    };

    const handleTuneWithSliders = async () => {
        try {
            const res = await tuneBySliders();
            onDataUpdate?.(res.project || draftData);
        } catch (error) {
            onOpenUpgrade?.(error.message);
        }
    };

    const handleExport = async () => {
        const canExportPdf = Boolean(policy?.canExportPDF);
        const canExportPpt = Boolean(policy?.canExportPPT);
        if (!canExportPdf && !canExportPpt) {
            onOpenUpgrade?.(isKr ? 'Export는 Pro/Studio 플랜에서 사용할 수 있습니다.' : 'Export is available on Pro/Studio plans.');
            return;
        }

        setIsExporting(true);
        setExportMessage(isKr ? "Export 작업을 큐에 등록하는 중..." : "Queueing export job...");

        try {
            const exportData = { ...draftData };
            if (exportData.timing) {
                exportData.timing.timeline = timelineItems;
            }

            const createJobResponse = await fetch(apiUrl('/api/export/jobs'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getPlanHeaders() },
                body: JSON.stringify({ 
                    draftData: exportData, 
                    language: isKr ? 'KR' : 'EN',
                    format: canExportPpt ? 'ppt_pdf_bundle' : 'pdf',
                })
            });

            if (!createJobResponse.ok) {
                throw new Error("Export failed on server.");
            }

            const createJobData = await createJobResponse.json();
            const jobId = createJobData?.jobId;
            if (!jobId) throw new Error('Missing export job id.');

            let done = false;
            let retries = 0;
            while (!done && retries < 60) {
                retries += 1;
                const statusResponse = await fetch(apiUrl(`/api/export/jobs/${jobId}`), {
                    headers: { ...getPlanHeaders() },
                });
                const statusData = await statusResponse.json();

                if (statusData.status === 'queued') {
                    setExportMessage(isKr ? "대기열에서 순서를 기다리는 중 (queued)..." : "Waiting in queue (queued)...");
                } else if (statusData.status === 'processing') {
                    setExportMessage(isKr ? "문서를 생성하는 중 (processing)..." : "Generating documents (processing)...");
                } else if (statusData.status === 'done') {
                    const downloadUrl = statusData?.result?.downloadUrl;
                    if (!downloadUrl) throw new Error('No download URL after completion.');
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = downloadUrl;
                    a.download = downloadUrl.split('/').pop();
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => document.body.removeChild(a), 1000);
                    done = true;
                    break;
                } else if (statusData.status === 'failed') {
                    throw new Error(statusData?.error || 'Export job failed');
                }

                await new Promise((resolve) => setTimeout(resolve, 1500));
            }

            if (!done) throw new Error('Export timed out. Please try again.');

            await new Promise(resolve => setTimeout(resolve, 300));
            alert(isKr ? "다운로드가 완료되었습니다. 멋진 작품을 응원합니다! 🎉" : "Download complete. We support your amazing artwork! 🎉");
            
        } catch (error) {
            console.error("Export Error:", error);
            alert(isKr ? "문서 생성 중 오류가 발생했습니다." : "Failed to generate documents.");
        } finally {
            setIsExporting(false);
            setExportMessage("");
        }
    };

    const handleRegenClick = () => {
        if (!policy?.canRegenerateSections) {
            onOpenUpgrade?.(isKr ? '부분 재생성은 Pro/Studio 플랜에서 가능합니다.' : 'Section regeneration is available on Pro/Studio plans.');
        } else {
            alert(isKr ? "재생성 진행합니다 (시뮬레이션)" : "Regenerating...");
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#000',
                bodyColor: '#333',
                padding: 12,
                borderColor: 'rgba(0,0,0,0.1)',
                borderWidth: 1,
            }
        },
        scales: {
            y: { display: false, min: 0, max: 110 },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10, family: 'serif' } }
            }
        },
        elements: {
            line: { tension: 0.4 },
            point: { radius: 3, hitRadius: 10, hoverRadius: 6 }
        }
    };

    const chartData = {
        labels: draftData?.narrative?.emotionCurve?.labels || [],
        datasets: [
            {
                label: isKr ? '감정 인텐시티' : 'Emotion Intensity',
                data: draftData?.narrative?.emotionCurve?.intensities || [],
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                fill: true,
            }
        ]
    };

    const renderSectionAction = (section) => (
        <RewriteButton
            label={isKr ? 'Rewrite' : 'Rewrite'}
            disabled={!policy?.canRegenerateSections}
            loading={Boolean(sectionLoading?.[section])}
            onClick={() => handleRewriteSection(section)}
        />
    );

    return (
        <div className="w-full flex flex-col gap-10 pb-8 relative font-serif text-slate-200">
            
            {/* Export Loading Overlay */}
            {isExporting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
                    <div className="flex flex-col items-center justify-center p-12 bg-[#0D0A1C] border border-white/20 shadow-2xl relative overflow-hidden w-[400px] h-[300px] max-w-[90vw]">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#5B13EC]/20 to-transparent"></div>
                        <div className="relative w-16 h-16 mb-8 flex items-center justify-center z-10">
                            <div className="absolute inset-0 border-t-2 border-white/50 rounded-full animate-spin"></div>
                            <div className="absolute inset-2 border-b-2 border-[#5B13EC]/80 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                            <span className="material-symbols-outlined text-[20px] text-white">memory</span>
                        </div>
                        <h2 className="text-[11px] uppercase tracking-[0.3em] font-sans text-slate-400 mb-4 text-center z-10">Export Engine Running</h2>
                        <p className="text-white font-light text-center text-sm z-10">{exportMessage}</p>
                        
                        {/* Progress Bar Skeleton */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                            <div className="h-full bg-[#5B13EC] w-1/2 animate-pulse shadow-[0_0_10px_#5B13EC]"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Minimalist Header */}
            <div className="text-center pt-8 pb-4 border-b border-white/10 space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] font-sans text-slate-400 mb-2">Seedbar Creative Engine</p>
                <h1 className="text-3xl font-light italic text-white/90">Curated Exhibition Catalog</h1>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-primary/30 bg-primary/10 text-primary">
                        {projectStatus}
                    </span>
                    <AutosaveIndicator state={autosaveState} updatedAt={autosaveUpdatedAt} />
                    <span className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-white/10 bg-white/5 text-slate-400">
                        Last edited: {formatRelativeTime(lastEdited)}
                    </span>
                </div>
                {currentPlan === 'free' ? (
                    <div className="text-[11px] text-amber-300/90 font-sans">
                        Upgrade to Pro to unlock rewrite and unlimited creation.
                    </div>
                ) : null}
            </div>

            {/* STEP 1: Title Generator — Hammer-Hit v3.0 */}
            <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-none p-10">
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-500 mb-2 flex items-center gap-3">
                    <span className="w-6 h-[1px] bg-slate-500"></span>
                    {isKr ? "추천 작품 제목" : "Recommended Titles"}
                </h2>
                {draftData.titles._domain && (
                    <p className="text-[9px] uppercase tracking-widest text-[#5B13EC]/60 font-mono mb-8 ml-9">
                        Domain: {draftData.titles._domain}
                    </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.entries(draftData.titles)
                        .filter(([key]) => !key.startsWith('_'))
                        .map(([style, titleObj]) => {
                            const scaleLabels = {
                                scientific: { icon: '⚗️', label: isKr ? '과학적 / 수학적' : 'Scientific' },
                                radical: { icon: '🔪', label: isKr ? '파격적 직설' : 'Radical Directness' },
                                surreal: { icon: '🌀', label: isKr ? '초현실적 / 추상' : 'Abstract / Surreal' },
                                minimalist: { icon: '▫️', label: isKr ? '미니멀 / 타이포그래피' : 'Minimalist' },
                            };
                            const info = scaleLabels[style] || { icon: '', label: style };
                            const en = (typeof titleObj === 'object' && titleObj !== null) ? (titleObj.en || titleObj.kr || '') : (titleObj || '');
                            const kr = (typeof titleObj === 'object' && titleObj !== null) ? (titleObj.kr || '') : '';
                            return (
                                <div key={style} className="flex flex-col gap-2">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-sans">
                                        {info.icon} {info.label}
                                    </span>
                                    <p className="text-2xl font-light italic text-white leading-tight">{en}</p>
                                    {kr && kr !== en && (
                                        <p className="text-sm font-light text-white/40">{kr}</p>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* 🎲 CHANCE OPERATION DNA (우연성 엔진 결과) */}
            {draftData.chanceOperation && (
                <div className="bg-gradient-to-r from-[#5B13EC]/10 to-transparent border border-[#5B13EC]/20 p-6 relative">
                    <div className="absolute top-3 right-4 text-[9px] uppercase tracking-widest text-[#5B13EC]/50 font-mono">
                        🎲 {draftData.chanceOperation.rollId}
                    </div>
                    <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-[#5B13EC] mb-4 flex items-center gap-3">
                        <span className="w-4 h-[1px] bg-[#5B13EC]"></span>
                        {isKr ? "AI 설계 핵심 DNA (AI Design DNA)" : "AI Design DNA"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* A. Choreographic Device */}
                        <div className="bg-black/30 border border-white/5 p-4">
                            <span className="text-[8px] uppercase tracking-widest text-slate-500 block mb-2">
                                {isKr ? "A. 동작 변형 기법" : "A. Choreographic Device"}
                            </span>
                            <p className="text-sm font-light text-white">
                                {t(draftData.chanceOperation.choreographicDevice)}
                            </p>
                        </div>
                        {/* B. Spatial Design */}
                        <div className="bg-black/30 border border-white/5 p-4">
                            <span className="text-[8px] uppercase tracking-widest text-slate-500 block mb-2">
                                {isKr ? "B. 공간 디자인 강제" : "B. Spatial Design Rule"}
                            </span>
                            <p className="text-sm font-light text-white">
                                {t(draftData.chanceOperation.spatialDesign)}
                            </p>
                        </div>
                        {/* C. Emotional Paradox */}
                        <div className="bg-black/30 border border-white/5 p-4">
                            <span className="text-[8px] uppercase tracking-widest text-slate-500 block mb-2">
                                {isKr ? "C. 감정-동작 역설" : "C. Emotional Paradox"}
                            </span>
                            <p className="text-sm font-light text-[#5B13EC]">
                                {t(draftData.chanceOperation.emotionalParadox)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: Concept Generator */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-none p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-white/20"></div>
                <div className="mb-6 flex items-center justify-between gap-3">
                    <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-500 flex items-center gap-3">
                        <span className="w-6 h-[1px] bg-slate-500"></span>
                        {isKr ? '기획 의도' : 'Step 2: Core Concept'}
                    </h2>
                    {renderSectionAction('story')}
                </div>
                
                <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="flex-1">
                        <h3 className="text-sm font-sans text-slate-400 mb-3 uppercase tracking-wider">{isKr ? '예술 철학' : 'Artistic Philosophy'}</h3>
                        <p className="text-xl font-light leading-relaxed mb-8 break-keep">{t(draftData.concept.artisticPhilosophy)}</p>
                    </div>
                    
                    {/* LMA Tag Chips Area */}
                    <div className="w-full md:w-64 flex flex-col gap-3">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-1">Movement Texture Analysis</span>
                        <div className="flex flex-wrap gap-2">
                             {Object.entries(draftData.narrative?.lma || {}).map(([key, val]) => (
                                <div key={key} className="group relative flex flex-col bg-white/5 border border-white/10 px-3 py-2 transition-all hover:bg-white/10 hover:border-white/30 cursor-default">
                                    <span className="text-[8px] uppercase tracking-widest text-primary font-bold mb-1 opacity-70 group-hover:opacity-100">{key}</span>
                                    <span className="text-[10px] text-white/90 font-sans tracking-wide">{t(val)}</span>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>
                
                <h3 className="text-sm font-sans text-slate-400 mb-3 uppercase tracking-wider mt-4">{isKr ? '작품 의도' : 'Artistic Statement'}</h3>
                <p className="text-base font-light text-slate-300 leading-relaxed break-keep border-l border-white/20 pl-4">{t(draftData.concept.artisticStatement)}</p>
            </div>

            {/* STEP 3: Narrative & AI Choreography Timing Engine */}
            <div className="flex flex-col gap-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-black/20 backdrop-blur-md border border-white/5 p-10">
                        <div className="mb-6 flex items-center justify-between gap-3">
                            <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-500 flex items-center gap-3">
                                <span className="w-6 h-[1px] bg-slate-500"></span>
                                {isKr ? "단계 3: 안무 내러티브" : "Step 3: Narrative"}
                            </h2>
                            {renderSectionAction('story')}
                        </div>
                        <div className="space-y-6">
                            {['intro', 'development', 'climax', 'resolution'].map((phase, idx) => (
                                <div key={phase} className="flex flex-col border-b border-white/5 pb-4 last:border-0">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-sans mb-1">
                                        {String(idx+1).padStart(2,'0')} {isKr ? ({'intro':'도입','development':'전개','climax':'절정','resolution':'종결'}[phase]) : phase.toUpperCase()}
                                    </span>
                                    <p className="text-sm text-slate-300 font-light leading-relaxed">{t(draftData.narrative[phase])}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black/20 backdrop-blur-md border border-white/5 p-10 flex flex-col justify-between">
                        <div>
                            <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-500 mb-2 flex items-center gap-3">
                                <span className="w-6 h-[1px] bg-slate-500"></span>
                                {isKr ? "감정 흐름 분석" : "Emotion Flow"}
                            </h2>
                            <p className="text-xs text-slate-400 font-sans mb-8">
                                {isKr ? "작품의 흐름에 따른 감정 강도 곡선입니다." : "Intensity curve mapped across the narrative timeframe."}
                            </p>
                        </div>
                        <div className="h-48 w-full mt-auto">
                            <Line ref={chartRef} data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* AI Choreography Timing Engine */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#5B13EC]"></div>
                    <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-300 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="w-4 h-[1px] bg-[#5B13EC]"></span>
                            {isKr ? "AI 안무 타이밍 엔진 (Choreography Timing)" : "AI Choreography Timing Engine"}
                        </div>
                        {renderSectionAction('movement')}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <p className="text-xs font-light text-slate-400 font-sans bg-black/30 p-4 border border-white/5 rounded flex-1">
                            {isKr ? (
                                <>총 소요 시간: <strong className="text-white">{draftData.timing?.totalDuration}</strong>. AI가 감정 곡선에 맞춰 안무 큐를 자동 생성했습니다. 동작 설명을 자유롭게 수정해보세요.</>
                            ) : (
                                <>Total Duration: <strong className="text-white">{draftData.timing?.totalDuration}</strong>. AI has auto-generated movement cues mapped to the emotional tension curve. You can edit the movement descriptions to fit your vision.</>
                            )}
                        </p>
                        <button
                            onClick={() => {
                                const allExpanded = timelineItems.length > 0 && timelineItems.every(item => expandedCues[item.id]);
                                const newExpandedCues = {};
                                timelineItems.forEach(item => {
                                    newExpandedCues[item.id] = !allExpanded;
                                });
                                setExpandedCues(newExpandedCues);
                            }}
                            className="text-[10px] uppercase tracking-widest font-sans px-4 py-2 bg-[#5B13EC]/20 hover:bg-[#5B13EC]/40 text-white rounded transition-colors whitespace-nowrap border border-[#5B13EC]/30 h-fit"
                        >
                            {timelineItems.length > 0 && timelineItems.every(item => expandedCues[item.id]) 
                                ? (isKr ? "전체 접기 ▲" : "Collapse All ▲") 
                                : (isKr ? "전체 펼쳐보기 ▼" : "Expand All ▼")}
                        </button>
                    </div>

                    <div className="mb-6">
                        <TimelineNavigator
                            items={timelineItems}
                            selectedTime={selectedTimelineTime}
                            beatMarkers={beatMarkers}
                            onJump={(item) => {
                                setSelectedTimelineTime(item?.time || null);
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-4 border-l border-white/10 pl-6 ml-2 relative">
                        {timelineItems.map((item, idx) => (
                            <div key={item.id} className="relative group/timeline">
                                <div className="absolute -left-[29px] top-1.5 w-2 h-2 rounded-full bg-white/20 border border-[#5B13EC] transition-all group-hover/timeline:scale-150 group-hover/timeline:bg-[#5B13EC]"></div>
                                
                                <div className="bg-black/40 border border-white/5 p-4 transition-all hover:bg-black/60 group-hover/timeline:border-white/20">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                                            setExpandedCues(prev => ({...prev, [item.id]: !prev[item.id]}));
                                            setSelectedTimelineTime(item?.time || null);
                                        }}>
                                            <span className="font-sans text-[#5B13EC] font-bold text-lg">{item.time}</span>
                                            <span className="text-[9px] uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-sm text-slate-300">{t(item.stage)}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedCues(prev => ({...prev, [item.id]: !prev[item.id]}));
                                                }}
                                                className="text-[10px] text-slate-500 hover:text-white transition-colors"
                                            >
                                                {expandedCues[item.id] ? (isKr ? '접기 ▲' : 'Collapse ▲') : (isKr ? '펼쳐보기 ▼' : 'Expand ▼')}
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newTimeline = [...timelineItems];
                                                    newTimeline.splice(idx, 1);
                                                    setTimelineItems(newTimeline);
                                                }}
                                                className="text-slate-500 hover:text-red-400 opacity-0 group-hover/timeline:opacity-100 transition-opacity"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </div>
                                    </div>
                                    {expandedCues[item.id] && (
                                        <div className="flex flex-col gap-1 mt-3 transition-all animate-in fade-in slide-in-from-top-2">
                                            <input 
                                                className="bg-transparent border-none text-white text-sm font-sans uppercase tracking-widest outline-none focus:text-[#5B13EC] placeholder:text-slate-600 w-full"
                                                value={t(item.action)}
                                                onChange={(e) => {
                                                    const newTimeline = [...timelineItems];
                                                    if (typeof newTimeline[idx].action === 'object' && newTimeline[idx].action !== null) {
                                                        newTimeline[idx].action[isKr ? 'kr' : 'en'] = e.target.value;
                                                    } else {
                                                        newTimeline[idx].action = e.target.value;
                                                    }
                                                    setTimelineItems(newTimeline);
                                                }}
                                                placeholder={isKr ? "동작 액션" : "Movement Action"}
                                            />
                                            <textarea 
                                                className="bg-transparent border-none text-slate-400 text-xs font-serif italic outline-none focus:text-slate-200 placeholder:text-slate-700 w-full resize-none h-10 mt-1"
                                                value={t(item.description)}
                                                onChange={(e) => {
                                                    const newTimeline = [...timelineItems];
                                                    if (typeof newTimeline[idx].description === 'object' && newTimeline[idx].description !== null) {
                                                        newTimeline[idx].description[isKr ? 'kr' : 'en'] = e.target.value;
                                                    } else {
                                                        newTimeline[idx].description = e.target.value;
                                                    }
                                                    setTimelineItems(newTimeline);
                                                }}
                                                placeholder={isKr ? "동작 설명" : "Movement Description"}
                                            />
                                            {item.movementQuality && (
                                                <div className="mt-2 px-2 py-2 bg-[#5B13EC]/10 border border-[#5B13EC]/20 rounded-sm">
                                                    <span className="text-[8px] uppercase tracking-widest text-[#5B13EC]/70 block mb-1">
                                                        {isKr ? '✦ 동작 질감 추천' : '✦ Movement Quality Hint'}
                                                    </span>
                                                    <p className="text-[11px] text-slate-300 font-serif italic leading-relaxed">
                                                        {t(item.movementQuality)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => {
                            const newId = (timelineItems[timelineItems.length-1]?.id || 0) + 1;
                            setTimelineItems([...timelineItems, { id: newId, time: "0:00", stage: { en: "New Stage", kr: "새 스테이지" }, action: { en: "New Action", kr: "새 동작" }, description: { en: "Description", kr: "설명" } }]);
                        }}
                        className="mt-6 border border-white/10 text-white/50 bg-white/5 hover:bg-white/10 hover:text-white transition-all py-2 text-xs uppercase tracking-widest font-sans rounded"
                    >
                        + {isKr ? "새로운 큐 추가" : "Add New Cue"}
                    </button>
                </div>
            </div>

            {/* AI STAGE MAP ENGINE (2D Flow Visualization) */}
            <div className="w-full flex flex-col gap-4 my-8">
                 <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-400 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <span className="w-4 h-[1px] bg-slate-400"></span>
                         {isKr ? "AI 스테이지 맵 엔진 (Stage Map Engine)" : "AI Stage Map Engine"}
                     </div>
                     <div className="flex items-center gap-2">
                         {renderSectionAction('formation')}
                         <button
                             onClick={() => {
                                 const newFlowRes = generateFlowFromTimeline(timelineItems, dancersCount);
                                 setFlowPatternData(newFlowRes.flow_pattern);
                             }}
                             className="text-[10px] uppercase tracking-widest font-sans px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors flex items-center gap-1"
                         >
                             <span className="material-symbols-outlined text-[12px]">refresh</span>
                             {isKr ? "동선 새로고침" : "Refresh Flow"}
                         </button>
                     </div>
                 </h2>
                <div className="w-full relative overflow-hidden group-img border border-white/5">
                    <FlowPatternSimulator
                        dancersCount={Number(dancersCount) || Number(draftData?.seedbarInput?.teamSize) || 1}
                        flowDataFromDraft={{
                            ...draftData.flow,
                            flow_pattern: flowPatternData,
                            stageFlow: draftData?.stageFlow || draftData?.flow?.stageFlow || null,
                        }}
                        timeline={timelineItems}
                        durationLabel={draftData?.timing?.totalDuration || '03:00'}
                        currentPlan={currentPlan}
                        policy={policy}
                        dancerRoles={dancerRoles}
                        selectedTime={selectedTimelineTime ? parseTimelineTimeToSeconds(selectedTimelineTime) : null}
                        onTimeChange={(time) => {
                            const activeItem = [...timelineItems]
                                .reverse()
                                .find((entry) => parseTimelineTimeToSeconds(entry?.time) <= time);
                            if (activeItem?.time) setSelectedTimelineTime(activeItem.time);
                        }}
                        onSelectDancerRole={(role) => setSelectedDancerRole(role)}
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10 z-10 mix-blend-overlay">
                        <div className="transform -rotate-12 opacity-40">
                            <span className="text-white font-black text-6xl tracking-[0.5em] uppercase drop-shadow-2xl">
                                SEEDBAR
                            </span>
                        </div>
                    </div>
                </div>
                <DancerRolePanel roleData={selectedDancerRole} />
            </div>

            {/* AI MUSIC ENGINE: Spotify + YouTube Only */}
            <div className="bg-black/20 backdrop-blur-md border border-white/5 p-8 flex flex-col my-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#5B13EC] to-transparent" />
                <MusicRecommendationPanel
                    genre={musicInput.genre}
                    mood={musicInput.mood}
                    keywords={musicInput.keywords}
                    duration={musicInput.duration}
                    competitionMode={musicInput.competitionMode}
                    autoRecommend={true}
                    hideActionButton={true}
                />
            </div>

            {/* AI Choreography Studio Controls */}
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 backdrop-blur-sm space-y-6">
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-400 flex items-center gap-3">
                    <span className="w-4 h-[1px] bg-slate-400"></span>
                    {isKr ? 'AI Choreography Studio' : 'AI Choreography Studio'}
                </h2>

                <VariationGenerator
                    versions={versions || []}
                    activeVersionId={activeVersionId}
                    disabled={!policy?.canRegenerateSections}
                    onGenerate={handleGenerateVariation}
                    onSelect={(version) => {
                        setActiveVersionId(version.id);
                        onDataUpdate?.({
                            ...version.generatedContent,
                            projectId,
                            lastEdited: version.createdAt,
                            projectStatus: version.generatedContent?.projectStatus || 'draft',
                        });
                    }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { key: 'story', label: isKr ? 'Story Rewrite' : 'Story Rewrite' },
                        { key: 'movement', label: isKr ? 'Movement Rewrite' : 'Movement Rewrite' },
                        { key: 'formation', label: isKr ? 'Formation Rewrite' : 'Formation Rewrite' },
                        { key: 'music', label: isKr ? 'Music Rewrite' : 'Music Rewrite' },
                        { key: 'stage', label: isKr ? 'Stage Rewrite' : 'Stage Rewrite' },
                        { key: 'artist_note', label: isKr ? 'Artist Note Rewrite' : 'Artist Note Rewrite' },
                    ].map((item) => (
                        <button
                            key={item.key}
                            onClick={() => handleRewriteSection(item.key)}
                            disabled={!policy?.canRegenerateSections || sectionLoading?.[item.key]}
                            className="text-left px-4 py-3 bg-black/30 border border-white/10 hover:border-primary/40 disabled:opacity-40 transition-all"
                        >
                            <div className="text-xs font-semibold text-white">{item.label}</div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                {sectionLoading?.[item.key]
                                    ? (isKr ? '재생성 중...' : 'Regenerating...')
                                    : (policy?.canRegenerateSections ? (isKr ? '해당 섹션만 재생성' : 'Only this section is regenerated') : (isKr ? 'Pro/Studio 전용' : 'Pro/Studio only'))}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="border-t border-white/10 pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <h3 className="text-sm font-semibold text-white">{isKr ? 'Project Versioning' : 'Project Versioning'}</h3>
                        <button
                            onClick={handleCreateVersion}
                            className="px-3 py-2 text-xs font-semibold bg-primary/20 border border-primary/40 hover:bg-primary/30 text-white"
                        >
                            {isKr ? 'Create New Version' : 'Create New Version'}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(versions || []).map((v) => (
                            <span key={v.id} className="px-3 py-1 text-[10px] bg-white/10 border border-white/15 text-slate-200">
                                {v.label || `v${v.versionNumber}`} · {new Date(v.createdAt).toLocaleDateString()}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/10 pt-5">
                    <h3 className="text-sm font-semibold text-white mb-3">{isKr ? 'Mood Sliders' : 'Mood Sliders'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { key: 'intensity', label: 'Intensity' },
                            { key: 'emotion', label: 'Emotion' },
                            { key: 'darkness', label: 'Darkness' },
                            { key: 'speed', label: 'Speed' },
                        ].map((s) => (
                            <label key={s.key} className="block">
                                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                                    <span>{s.label}</span>
                                    <span>{sliders?.[s.key] ?? 50}</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={sliders?.[s.key] ?? 50}
                                    onChange={(e) => setSlider(s.key, Number(e.target.value))}
                                    disabled={!policy?.canUseMoodSliders}
                                    className="w-full accent-primary disabled:opacity-40"
                                />
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={handleTuneWithSliders}
                        disabled={!policy?.canUseMoodSliders}
                        className="mt-4 px-4 py-2 text-xs font-semibold bg-white/10 border border-white/20 hover:bg-white/20 disabled:opacity-40"
                    >
                        {isKr ? '슬라이더 반영 적용' : 'Apply Slider Tuning'}
                    </button>
                </div>

                <div className="border-t border-white/10 pt-5">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-white">{isKr ? 'Full Choreography Package' : 'Full Choreography Package'}</h3>
                        <button
                            onClick={async () => {
                                try {
                                    await fetchFullPackage();
                                } catch (error) {
                                    onOpenUpgrade?.(error.message);
                                }
                            }}
                            className="px-3 py-2 text-xs font-semibold bg-white/10 border border-white/20 hover:bg-white/20"
                        >
                            {isKr ? '패키지 생성' : 'Build Package'}
                        </button>
                    </div>
                    {packageData ? (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div className="bg-black/30 border border-white/10 p-3"><span className="text-slate-400">Title</span><p className="text-white mt-1">{packageData.title}</p></div>
                            <div className="bg-black/30 border border-white/10 p-3"><span className="text-slate-400">Lighting</span><p className="text-white mt-1">{t(packageData.lightingSuggestions)}</p></div>
                            <div className="bg-black/30 border border-white/10 p-3"><span className="text-slate-400">Costume</span><p className="text-white mt-1">{t(packageData.costumeSuggestions)}</p></div>
                            {packageData.competitionStrategy ? (
                                <div className="bg-black/30 border border-white/10 p-3"><span className="text-slate-400">Competition Strategy</span><p className="text-white mt-1">{t(packageData.competitionStrategy)}</p></div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* VISUALS: Stage & Costume */}
            <div className="grid grid-cols-1 gap-8 mb-8">
                <div className="bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-400 flex items-center gap-3">
                            <span className="w-4 h-[1px] bg-slate-400"></span>
                            {isKr ? "무대 및 비주얼 컨셉" : "Stage & Visual Concept"}
                        </h2>
                        {renderSectionAction('stage')}
                    </div>
                    <ul className="space-y-4 font-sans text-xs text-slate-300 uppercase tracking-wide">
                        <li className="flex flex-col border-b border-white/5 pb-2"><span className="text-slate-500 mb-1">Lighting</span> <span className="normal-case tracking-normal">{draftData.stage.lighting}</span></li>
                        <li className="flex flex-col border-b border-white/5 pb-2"><span className="text-slate-500 mb-1">Costume</span> <span className="normal-case tracking-normal">{draftData.stage.costume}</span></li>
                        <li className="flex flex-col"><span className="text-slate-500 mb-1">Props & Space</span> <span className="normal-case tracking-normal">{draftData.stage.props}</span></li>
                    </ul>
                </div>
            </div>

            {/* STEP 7: Pamphlet Designer (Exhibition Print Format) */}
            <div className="bg-slate-200 text-slate-900 p-12 mt-4 relative">
                <div className="absolute top-4 right-6 text-[10px] uppercase tracking-[0.3em] font-sans text-slate-400">Step 7: Print Ready Pamphlet</div>
                <div className="absolute top-4 left-6">
                    {renderSectionAction('artist_note')}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-light italic mb-8 mt-4 text-center">{draftData.pamphlet.coverTitle}</h1>
                <p className="text-center text-sm tracking-widest uppercase font-sans mb-12 border-b border-slate-300 pb-8 mx-auto max-w-lg">{draftData.pamphlet.performanceDesc}</p>
                
                <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 font-sans">
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-300 pb-2">Artistic Statement</h4>
                        <p className="text-sm font-serif leading-relaxed text-justify">{t(draftData.pamphlet.artisticStatement)}</p>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-300 pb-2">Choreographer Note</h4>
                        <p className="text-sm font-serif leading-relaxed text-justify">{t(draftData.pamphlet.choreographerNote)}</p>
                    </div>
                    <div className="md:col-span-2 flex flex-col items-center mt-8 border-t border-slate-300 pt-8 gap-2">
                        <span className="text-xs uppercase tracking-widest text-slate-500">Credits</span>
                        <p className="text-sm text-center">{draftData.pamphlet.musicCredits}</p>
                        <p className="text-sm text-center">{draftData.pamphlet.cast}</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons & Paywall Export */}
            <div className="flex flex-col items-center gap-4 mt-12 pb-12">
                <p className="text-xs font-sans text-slate-500 uppercase tracking-widest">Pricing & Export</p>
                <div className="flex flex-wrap justify-center gap-6">
                    <div className="relative group">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                            {isKr ? 'Pro/Studio에서 섹션 재생성이 가능합니다.' : 'Section regeneration is available on Pro/Studio.'}
                        </div>
                        <button onClick={handleRegenClick} className="px-6 py-3 bg-white/5 border border-white/20 text-white rounded-none hover:bg-white/10 transition-all text-sm uppercase tracking-widest font-sans font-light">
                            {isKr ? '재생성' : 'Regenerate'}
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                            {isKr ? 'PDF: Pro+, PPT: Studio' : 'PDF: Pro+, PPT: Studio'}
                        </div>
                        <button 
                            onClick={handleExport}
                            className="px-8 py-3 bg-white text-black font-semibold rounded-none hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm uppercase tracking-widest font-sans flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            {isKr ? 'PPT / PDF 번들 다운로드' : 'Download PPT/PDF Bundle'}
                            <span className="font-bold border-l border-black/20 pl-2 ml-1">{String(currentPlan || 'free').toUpperCase()}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
