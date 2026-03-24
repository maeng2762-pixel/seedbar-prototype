import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import useAuthStore from '../store/useAuthStore';
import usePortfolioStore from '../store/usePortfolioStore';
import FlowPatternSimulator from './FlowPatternSimulator';
import MusicRecommendationPanel from './MusicRecommendationPanel';
import MovementReferenceLibrary from './MovementReferenceLibrary';
import RewriteButton from './studio/RewriteButton';
import VariationGenerator from './studio/VariationGenerator';
import TimelineNavigator from './studio/TimelineNavigator';
import DancerRolePanel from './studio/DancerRolePanel';
import AutosaveIndicator from './studio/AutosaveIndicator';
import ProjectHeader from './studio/ProjectHeader';
import StudioToolbar from './studio/StudioToolbar';
import VersionManager from './studio/VersionManager';
import ExportPackageModal from './ExportPackageModal';
import PamphletFlipbook from './PamphletFlipbook';
import ArtworkImageGenerator from './ArtworkImageGenerator';
import ErrorBoundary from './ErrorBoundary';
import StableArtworkPreview from './StableArtworkPreview';
import { generateFlowFromTimeline } from '../services/aiPipeline';
import { getSavedStageVisualization } from '../services/stageVisual3d';
import { getPlanHeaders } from '../lib/subscriptionContext';
import { apiUrl } from '../lib/apiClient';
import { resolveArtworkUrl } from '../lib/artworkMedia.js';
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

const DEFAULT_DRAFT_DATA = {
    titles: { _tone: 'neutral', scientific: { en: '-', kr: '-' }, radical: { en: '-', kr: '-' }, surreal: { en: '-', kr: '-' }, minimalist: { en: '-', kr: '-' } },
    concept: { _moodTone: 'balanced', artisticPhilosophy: { en: "-", kr: "-" }, artisticStatement: { en: "-", kr: "-" } },
    narrative: { intro: "-", development: "-", climax: "-", resolution: "-", emotionCurve: { labels: [], intensities: [], energyIntensities: [] }, lma: { space: "-", weight: "-", time: "-", flow: "-", body: "-" } },
    music: { _musicTone: 'default', style: "-", tempoBpm: "-", soundTexture: "-", referenceArtists: "-" },
    flow: { flow_pattern: [] },
    timing: { totalDuration: "3:00", emotionStructure: {}, timeline: [] },
    stage: { _visualTone: 'minimal', lighting: "-", costume: "-", props: "-" },
    pamphlet: { coverTitle: "-", performanceDesc: "-", artisticStatement: { en: "-", kr: "-" }, choreographerNote: "-", musicCredits: "-", cast: "-" },
};

function normalizeDraftData(input) {
    if (!input) return null;
    const safeData = JSON.parse(JSON.stringify(input));

    if (!safeData.titles) safeData.titles = {};
    if (!safeData.titles._tone) safeData.titles._tone = 'neutral';

    if (!safeData.concept) safeData.concept = {};
    if (!safeData.concept._moodTone) safeData.concept._moodTone = 'balanced';

    if (!safeData.stage) safeData.stage = {};
    if (!safeData.stage._visualTone) safeData.stage._visualTone = 'minimal';

    if (!safeData.music) safeData.music = {};
    if (!safeData.music._musicTone) safeData.music._musicTone = 'default';

    return safeData;
}

function areSimpleArraysEqual(left = [], right = []) {
    if (left === right) return true;
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
        if (JSON.stringify(left[index]) !== JSON.stringify(right[index])) {
            return false;
        }
    }
    return true;
}

function safeJson(value) {
    try {
        return JSON.stringify(value ?? null);
    } catch {
        return '';
    }
}

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
    let parsedSize = parseInt(String(teamSize).replace(/[^0-9]/g, ''), 10);
    if (isNaN(parsedSize) || parsedSize < 1) parsedSize = 1;
    let safeSize = Math.max(1, Math.min(100, parsedSize)); // Cap at 100 to prevent crash

    return Array.from({ length: safeSize }, (_, index) => ({
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

function normalizeWorkTitleCandidate(candidate) {
    if (!candidate) return { en: 'Untitled', kr: 'Untitled' };
    if (typeof candidate === 'string') return { en: candidate, kr: candidate };
    const fallback = candidate.en || candidate.kr || 'Untitled';
    return {
        en: candidate.en || fallback,
        kr: candidate.kr || fallback,
    };
}

const WorkTitleSection = React.memo(function WorkTitleSection({
    draftData,
    expanded,
    onToggle,
    isKr,
    onSelectWorkTitle,
    onDataUpdate,
}) {
    const [selectedTitlePreview, setSelectedTitlePreview] = useState(() => {
        const selected = draftData?.selectedWorkTitle;
        if (selected) return normalizeWorkTitleCandidate(selected);
        return normalizeWorkTitleCandidate(draftData?.titles?.mainTitle || draftData?.titles?.scientific || { en: 'Untitled', kr: '무제' });
    });
    const [titleSaveState, setTitleSaveState] = useState('idle');
    const titleStateTimerRef = useRef(null);

    React.useEffect(() => {
        const selected = draftData?.selectedWorkTitle;
        if (selected) {
            setSelectedTitlePreview(normalizeWorkTitleCandidate(selected));
            return;
        }
        setSelectedTitlePreview(normalizeWorkTitleCandidate(draftData?.titles?.mainTitle || draftData?.titles?.scientific || { en: 'Untitled', kr: '무제' }));
    }, [
        draftData?.selectedWorkTitle,
        draftData?.titles?.mainTitle?.en,
        draftData?.titles?.mainTitle?.kr,
        draftData?.titles?.scientific?.en,
        draftData?.titles?.scientific?.kr,
    ]);

    React.useEffect(() => {
        return () => {
            if (titleStateTimerRef.current) {
                window.clearTimeout(titleStateTimerRef.current);
            }
        };
    }, []);

    const titlesObj = draftData?.titles || {};
    let candidates = Array.isArray(titlesObj.candidates) ? titlesObj.candidates : [];
    if (candidates.length === 0) {
        candidates = Object.entries(titlesObj)
            .filter(([key]) => !key.startsWith('_') && key !== 'mainTitle' && key !== 'candidates')
            .map(([, value]) => value)
            .filter(Boolean);
    }

    const mainObj = selectedTitlePreview || normalizeWorkTitleCandidate(titlesObj.mainTitle || titlesObj.scientific || { en: 'Untitled', kr: '무제' });

    const handleSelectClick = React.useCallback((candidate) => {
        const normalizedCandidate = normalizeWorkTitleCandidate(candidate);
        const nextCoverTitle = normalizedCandidate.en;

        setSelectedTitlePreview(normalizedCandidate);
        setTitleSaveState('saving');
        if (titleStateTimerRef.current) {
            window.clearTimeout(titleStateTimerRef.current);
        }

        if (typeof onSelectWorkTitle === 'function') {
            window.requestAnimationFrame(() => {
                Promise.resolve(onSelectWorkTitle(normalizedCandidate))
                    .then((result) => {
                        if (result?.stale) return;
                        setTitleSaveState('saved');
                        titleStateTimerRef.current = window.setTimeout(() => setTitleSaveState('idle'), 1500);
                    })
                    .catch(() => {
                        setTitleSaveState('failed');
                    });
            });
            return;
        }

        onDataUpdate?.({
            ...draftData,
            selectedWorkTitle: nextCoverTitle,
            titles: { ...titlesObj, mainTitle: normalizedCandidate },
            pamphlet: { ...(draftData?.pamphlet || {}), coverTitle: nextCoverTitle },
            lastEdited: new Date().toISOString(),
        });
        setTitleSaveState('saved');
        titleStateTimerRef.current = window.setTimeout(() => setTitleSaveState('idle'), 1500);
    }, [draftData, onDataUpdate, onSelectWorkTitle, titlesObj]);

    const titleSaveLabel = titleSaveState === 'saving'
        ? (isKr ? '제목 저장 중...' : 'Saving title...')
        : titleSaveState === 'saved'
            ? (isKr ? '제목 저장 완료' : 'Title saved')
            : titleSaveState === 'failed'
                ? (isKr ? '저장 재시도 필요' : 'Retry save')
                : '';

    const titleSaveClassName = titleSaveState === 'failed'
        ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
        : titleSaveState === 'saved'
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
            : 'border-primary/30 bg-primary/10 text-primary-light';

    return (
        <div className={`bg-black/20 backdrop-blur-md border border-white/5 rounded-none p-10 transition-all ${expanded ? '' : 'h-[60px] overflow-hidden'}`}>
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-500 mb-2 flex items-center justify-between cursor-pointer" onClick={onToggle}>
                <div className="flex items-center gap-3">
                    <span className="w-6 h-[1px] bg-slate-500"></span>
                    {isKr ? "작품 제목 (Work Title)" : "Work Title"}
                    <span className="material-symbols-outlined text-[16px] leading-none text-white">{expanded ? 'expand_less' : 'expand_more'}</span>
                </div>
                <div className="flex items-center gap-2">
                    {titleSaveLabel ? (
                        <span className={`text-[9px] px-3 py-1 rounded tracking-widest uppercase border ${titleSaveClassName}`}>
                            {titleSaveLabel}
                        </span>
                    ) : null}
                    {draftData?.titles?._tone ? (
                        <span className="text-[9px] bg-white/5 border border-white/10 text-white/40 px-3 py-1 rounded tracking-widest uppercase">
                            🎨 Tone: {draftData.titles._tone}
                        </span>
                    ) : null}
                </div>
            </h2>

            <div className="flex flex-col gap-8 mt-5 md:ml-9">
                <div className="flex flex-col gap-2 relative">
                    <span className="text-[9px] uppercase tracking-widest text-[#5B13EC] font-bold font-sans flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-outlined text-[14px]">stars</span>
                        {isKr ? '최종 선택된 제목' : 'Final Selected Title'}
                    </span>
                    <h3 className="text-3xl md:text-5xl font-light italic text-white leading-tight drop-shadow-lg break-keep">
                        {mainObj.en}
                    </h3>
                    {mainObj.kr && mainObj.kr !== mainObj.en ? (
                        <p className="text-base md:text-lg font-light text-white/50">{mainObj.kr}</p>
                    ) : null}
                </div>

                {candidates.length > 0 ? (
                    <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-sans">
                            {isKr ? '다른 제목 후보 선택' : 'Select Alternative Candidate'}
                        </span>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {candidates.map((candidate, idx) => {
                                const normalizedCandidate = normalizeWorkTitleCandidate(candidate);
                                const isSelected = normalizedCandidate.en === mainObj.en;
                                return (
                                    <button
                                        key={`${normalizedCandidate.en}-${idx}`}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleSelectClick(candidate);
                                        }}
                                        className={`px-4 py-2.5 border rounded-full text-left transition-all active:scale-95 flex flex-col items-start min-w-[120px] ${isSelected ? 'bg-primary/20 border-primary/50 shadow-[0_0_10px_rgba(91,19,236,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <span className={`text-sm md:text-base font-semibold ${isSelected ? 'text-primary-light' : 'text-slate-200'} italic leading-snug`}>
                                            {normalizedCandidate.en}
                                        </span>
                                        {normalizedCandidate.kr && normalizedCandidate.kr !== normalizedCandidate.en ? (
                                            <span className={`text-[10px] md:text-xs ${isSelected ? 'text-primary/70' : 'text-slate-500'} mt-0.5`}>
                                                {normalizedCandidate.kr}
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
});

export default function ChoreographyDraft({ data, projectId = null, currentPlan = 'free', policy = null, dancersCount = 5, onDataUpdate, onOpenUpgrade, onSelectWorkTitle, onSaveArtworkImage }) {
    const navigate = useNavigate();
    const language = useStore((s) => s.language);
    const token = useAuthStore((s) => s.token);
    const isKr = language === 'KR';
    const { portfolioItems, addToPortfolio, removeFromPortfolio, updatePortfolioItem } = usePortfolioStore();

    const [isMounting, setIsMounting] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounting(false), 50);
        return () => clearTimeout(timer);
    }, []);

    const chartRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState("");
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedTimelineTime, setSelectedTimelineTime] = useState(null);
    const [selectedDancerRole, setSelectedDancerRole] = useState(null);

    const [timelineItems, setTimelineItems] = useState(data?.timing?.timeline || []);
    const [expandedCues, setExpandedCues] = useState({});
    const [flowPatternData, setFlowPatternData] = useState(data?.flow?.flow_pattern || []);
    const [showRefSelectModal, setShowRefSelectModal] = useState(null);
    const [isTuning, setIsTuning] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [studioNotice, setStudioNotice] = useState('');
    const [isAccordionMode, setIsAccordionMode] = useState(() => {
        try { return JSON.parse(localStorage.getItem('studioAccordionMode')) || false; } catch { return false; }
    });

    const [expandedSections, setExpandedSections] = useState(() => {
        try {
            const saved = localStorage.getItem('studioExpandedSections');
            return saved ? JSON.parse(saved) : {
                titles: true, dna: true, concept: true, narrative: true, emotion: true,
                timing: true, formation: true, music: true, studio: true, stage: true, artist_note: true
            };
        } catch {
            return {
                titles: true, dna: true, concept: true, narrative: true, emotion: true,
                timing: true, formation: true, music: true, studio: true, stage: true, artist_note: true
            };
        }
    });

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => {
            const next = { ...prev };
            // Mobile Accordion mode check (apply if width < 768px and accordion mode is ON)
            const isMobile = window.innerWidth < 768;
            if (isAccordionMode && isMobile && !prev[sectionKey]) {
                Object.keys(next).forEach(k => next[k] = false);
            }
            next[sectionKey] = !prev[sectionKey];
            localStorage.setItem('studioExpandedSections', JSON.stringify(next));
            return next;
        });
    };

    const toggleAccordionMode = () => {
        setIsAccordionMode(prev => {
            const next = !prev;
            localStorage.setItem('studioAccordionMode', JSON.stringify(next));
            return next;
        });
    };

    const expandAllSections = () => {
        const next = {
            titles: true, dna: true, concept: true, narrative: true, emotion: true,
            timing: true, formation: true, music: true, studio: true, stage: true, artist_note: true
        };
        setExpandedSections(next);
        localStorage.setItem('studioExpandedSections', JSON.stringify(next));
    };

    const collapseAllSections = () => {
        const next = {
            titles: false, dna: false, concept: false, narrative: false, emotion: false,
            timing: false, formation: false, music: false, studio: false, stage: false, artist_note: false
        };
        setExpandedSections(next);
        localStorage.setItem('studioExpandedSections', JSON.stringify(next));
    };
    
    React.useEffect(() => {
        const hasSeenHelp = localStorage.getItem('hasSeenStudioHelp');
        if (!hasSeenHelp) {
            setShowHelpModal(true);
            localStorage.setItem('hasSeenStudioHelp', 'true');
        }
    }, []);

    const {
        projectId: storeProjectId,
        setProjectId,
        versions,
        activeVersionId,
        setActiveVersionId,
        sliders,
        setSlider,
        createVersion,
        deleteVersion,
        duplicateVersion,
        generateVariations,
        refreshVersions,
        rewriteSection,
        tuneBySliders,
        fetchFullPackage,
        sectionLoading,
        packageData,
        autosaveState,
        autosaveUpdatedAt,
        versionAction,
        error: studioError,
        clearError,
        setTemporaryDraft,
    } = useChoreographyStudioStore();
    
    React.useEffect(() => {
        const nextTimeline = Array.isArray(data?.timing?.timeline) ? data.timing.timeline : [];
        setTimelineItems((prev) => (areSimpleArraysEqual(prev, nextTimeline) ? prev : nextTimeline));
    }, [data?.timing?.timeline]);

    React.useEffect(() => {
        const nextFlowPattern = Array.isArray(data?.flow?.flow_pattern) ? data.flow.flow_pattern : [];
        setFlowPatternData((prev) => (areSimpleArraysEqual(prev, nextFlowPattern) ? prev : nextFlowPattern));
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

    const draftData = React.useMemo(() => normalizeDraftData(data) || DEFAULT_DRAFT_DATA, [data]);
    const isCompetitionMode = Boolean(draftData?.isCompetition || draftData?.pamphlet?.isCompetition);
    const beatMarkers = draftData?.beatMarkers || deriveBeatMarkers(timelineItems);
    const dancerRoles = draftData?.dancerRoles || deriveDancerRoles(Number(dancersCount) || Number(draftData?.seedbarInput?.teamSize) || 1);
    const projectStatus = draftData?.projectStatus || 'draft';
    const lastEdited = draftData?.lastEdited || autosaveUpdatedAt || null;
    const rawRepresentativeArtworkUrl = resolveArtworkUrl(draftData, { prefer: 'thumbnail', allowFallback: false });
    const representativeArtworkUrl = rawRepresentativeArtworkUrl || resolveArtworkUrl(draftData, { prefer: 'thumbnail' });
    const originalArtworkUrl = resolveArtworkUrl(draftData, { prefer: 'original', allowFallback: false }) || representativeArtworkUrl;
    const musicInput = React.useMemo(() => ({
        genre: draftData?.seedbarInput?.genre || draftData?.genre || 'Contemporary Dance',
        mood: draftData?.seedbarInput?.mood || t(draftData?.concept?.artisticPhilosophy) || '',
        keywords: draftData?.seedbarInput?.keywords || [],
        duration: draftData?.seedbarInput?.duration || draftData?.timing?.totalDuration || '03:00',
        competitionMode: Boolean(draftData?.seedbarInput?.competitionMode || isCompetitionMode),
    }), [draftData, isCompetitionMode]);
    const stageVisualizations = draftData?.visualizations3d || {};
    const studioContext = React.useMemo(() => ({
        genre: musicInput.genre,
        mood: musicInput.mood,
        keywords: musicInput.keywords,
        emotionTone: draftData?.concept?._tone || draftData?.seedbarInput?.emotionTone || '',
        intention: t(draftData?.concept?.artisticPhilosophy) || draftData?.seedbarInput?.intention || '',
        titleTone: draftData?.titles?._titleTone || '',
        dancerCount: dancersCount || draftData?.seedbarInput?.teamSize || 1,
        duration: musicInput.duration,
        energyCurve: draftData?.flow?.energyCurve || draftData?.seedbarInput?.energyCurve || '',
        designDNA: draftData?.designDNA || draftData?.seedbarInput?.designDNA || '',
    }), [draftData, dancersCount, musicInput, isKr]);
    const stageFlowDraft = React.useMemo(() => ({
        ...(draftData?.flow || {}),
        flow_pattern: flowPatternData,
        stageFlow: draftData?.stageFlow || draftData?.flow?.stageFlow || null,
    }), [draftData?.flow, draftData?.stageFlow, flowPatternData]);
    const PLAN_GUARD_RE = /(monthly limit|upgrade|paid plan|available on|regeneration is available|mood sliders are available|export is available|competition mode)/i;

    React.useEffect(() => {
        if (!projectId) return;
        if (storeProjectId !== projectId) {
            setProjectId(projectId);
        }
        refreshVersions().catch(() => {});
    }, [projectId, refreshVersions, setProjectId, storeProjectId]);

    const handleStudioError = (error, fallbackMessage = null) => {
        const message = error?.message || fallbackMessage || (isKr ? '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.' : 'We could not complete that request. Please try again.');
        if (PLAN_GUARD_RE.test(message)) {
            onOpenUpgrade?.(message);
            return;
        }
        setStudioNotice(message);
    };

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
            await refreshVersions();
            // 자동 스크롤
            setTimeout(() => {
                const el = document.getElementById(`section-${section}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // 하이라이트 효과 (옵션)
                    el.classList.add('ring-2', 'ring-primary', 'transition-all');
                    setTimeout(() => el.classList.remove('ring-2', 'ring-primary'), 2000);
                }
            }, 100);
        } catch (error) {
            handleStudioError(error);
        }
    };

    const handleCreateVersion = async () => {
        try {
            await createVersion(draftData, draftData?.pamphlet?.coverTitle || draftData?.titles?.scientific?.en || null);
        } catch (error) {
            handleStudioError(error);
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
            handleStudioError(error);
        }
    };

    const handleSelectVersion = (version) => {
        if (versionAction?.pending || !version) return;
        clearError?.();
        setActiveVersionId(version.id);
        onDataUpdate?.({
            ...version.generatedContent,
            projectId,
            lastEdited: version.createdAt,
            projectStatus: version.generatedContent?.projectStatus || 'draft',
        });
    };

    const handleDuplicateVersion = async (versionId) => {
        try {
            await duplicateVersion(versionId);
        } catch (error) {
            handleStudioError(error);
        }
    };

    const handleDeleteVersion = async (versionId) => {
        try {
            const remainingVersions = await deleteVersion(versionId);
            const fallbackVersion = remainingVersions.find((version) => version.id === activeVersionId) || remainingVersions[0];
            if (fallbackVersion?.generatedContent) {
                setActiveVersionId(fallbackVersion.id);
                onDataUpdate?.({
                    ...fallbackVersion.generatedContent,
                    projectId,
                    lastEdited: fallbackVersion.createdAt,
                    projectStatus: fallbackVersion.generatedContent?.projectStatus || 'draft',
                });
            }
        } catch (error) {
            handleStudioError(error);
        }
    };

    const handleTuneWithSliders = async () => {
        setIsTuning(true);
        try {
            const res = await tuneBySliders();
            onDataUpdate?.(res.project || draftData);
            setTimeout(() => {
                const el = document.getElementById('slider-summary-box');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } catch (error) {
            handleStudioError(error);
        } finally {
            setIsTuning(false);
        }
    };

    const handleExport = async () => {
        const canExportPdf = Boolean(policy?.canExportPDF);
        const canExportPpt = Boolean(policy?.canExportPPT);
        if (!canExportPdf && !canExportPpt) {
            onOpenUpgrade?.(isKr ? '내보내기는 유료 플랜에서 사용할 수 있습니다.' : 'Export is available on paid plans.');
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
                
                if (!statusResponse.ok) {
                    if (retries > 3) {
                        throw new Error(isKr ? "서버와 연결할 수 없습니다. 다시 시도해주세요." : "Server connection lost. Please try again.");
                    }
                } else {
                    const statusData = await statusResponse.json();

                    if (statusData.status === 'queued') {
                        setExportMessage(isKr ? "대기열에서 순서를 기다리는 중 (queued)..." : "Waiting in queue (queued)...");
                    } else if (statusData.status === 'processing') {
                        setExportMessage(isKr ? "문서를 생성하는 중 (processing)..." : "Generating documents (processing)...");
                    } else if (statusData.status === 'done') {
                        const filename = statusData?.result?.filename;
                        if (!filename) throw new Error('No filename after completion.');
                        const downloadUrl = apiUrl(`/api/download/${filename}`);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = downloadUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(() => document.body.removeChild(a), 1000);
                        done = true;
                        break;
                    } else if (statusData.status === 'failed') {
                        throw new Error(statusData?.error || 'Export job failed');
                    } else if (!statusData.status) {
                        if (retries > 5) throw new Error('Job status is missing. It might have been lost on the server.');
                    }
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
            onOpenUpgrade?.(isKr ? '부분 재생성은 유료 플랜에서 가능합니다.' : 'Section regeneration is available on paid plans.');
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
        labels: draftData?.narrative?.emotionCurve?.labels?.length ? draftData.narrative.emotionCurve.labels : ['Intro', 'Develop', 'Climax', 'Resolution'],
        datasets: [
            {
                label: isKr ? '감정 인텐시티' : 'Emotion Intensity',
                data: draftData?.narrative?.emotionCurve?.intensities?.length ? draftData.narrative.emotionCurve.intensities : [20, 50, 95, 30],
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                fill: true,
            }
        ]
    };

    const energyChartData = {
        labels: draftData?.narrative?.emotionCurve?.labels?.length ? draftData.narrative.emotionCurve.labels : ['Intro', 'Develop', 'Climax', 'Resolution'],
        datasets: [
            {
                label: isKr ? '에너지 인텐시티' : 'Energy Intensity',
                data: draftData?.narrative?.emotionCurve?.energyIntensities?.length ? draftData.narrative.emotionCurve.energyIntensities : [30, 60, 100, 20],
                borderColor: '#FF5733',
                backgroundColor: 'rgba(255, 87, 51, 0.05)',
                borderWidth: 1,
                fill: true,
            }
        ]
    };

    const handleSaveToDataset = () => {
        const datasetEntry = {
            movementPattern: flowPatternData,
            emotionCurve: chartData.datasets[0].data,
            energyCurve: energyChartData.datasets[0].data,
            genre: musicInput.genre,
            tempo: draftData?.music?.tempoBpm || '120 BPM',
            dancerCount: dancersCount
        };
        console.log("Movement Dataset Saved:", datasetEntry);
        alert(isKr ? "데이터셋 저장이 완료되었습니다. AI 학습을 위한 데이터로 반영됩니다." : "Movement Dataset saved successfully for AI training.");
    };

    const isProjectSaved = projectId && portfolioItems.some(i => i.id === projectId);
    const handleTogglePortfolio = () => {
        if (!projectId) {
            alert(isKr ? "프로젝트를 먼저 저장해야 포트폴리오에 추가할 수 있습니다." : "Please save the project first before adding to portfolio.");
            return;
        }

        if (isProjectSaved) {
            removeFromPortfolio(projectId);
        } else {
            const mainTitleObj = draftData?.titles?.mainTitle || draftData?.titles?.scientific;
            const titleValue = typeof mainTitleObj === 'string' ? mainTitleObj : (mainTitleObj?.en || 'Untitled Project');
            addToPortfolio({
                id: projectId,
                title: titleValue,
                docType: 'PROJECT',
                thumbnailUrl: rawRepresentativeArtworkUrl || null,
                coverImage: originalArtworkUrl || rawRepresentativeArtworkUrl || null,
                date: new Date().toISOString(),
                createdAt: new Date().toISOString()
            });
            alert(isKr ? "내 포트폴리오에 저장되었습니다." : "Saved to your portfolio.");
        }
    };

    const renderSectionAction = (section) => (
        <RewriteButton
            label={isKr ? 'Rewrite' : 'Rewrite'}
            disabled={!policy?.canRegenerateSections}
            loading={Boolean(sectionLoading?.[section])}
            onClick={() => handleRewriteSection(section)}
        />
    );

    const openStageVisualizationEditor = (assetType) => {
        const targetProjectId = projectId || draftData?.projectId || null;
        const query = new URLSearchParams();
        if (targetProjectId) query.set('projectId', targetProjectId);
        query.set('asset', assetType);
        
        setTemporaryDraft(draftData);

        navigate(`/editor?${query.toString()}`, {
            state: {
                mode: 'stage-visual',
                assetType,
                projectId: targetProjectId,
                hasTemporaryContext: true,
                savedVisualization: getSavedStageVisualization(draftData, assetType),
            },
        });
    };

    const renderStageVisualizationButton = (assetType) => {
        const savedVisualization = stageVisualizations?.[assetType];
        return (
            <button
                type="button"
                onClick={() => openStageVisualizationEditor(assetType)}
                className="px-3 py-1.5 border border-white/15 bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-[0.18em] text-white transition-colors"
            >
                {savedVisualization
                    ? (isKr ? '수정하기' : 'Edit Visual')
                    : (isKr ? '비주얼로 보기' : 'View Visual')}
            </button>
        );
    };

    if (isMounting) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">{isKr ? '작업 공간을 불러오는 중...' : 'Restoring workspace...'}</p>
                </div>
            </div>
        );
    }

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

            {/* Global Collapse/Expand */}
            <div className="flex flex-wrap justify-center gap-3 pt-6 px-4">
                 <button onClick={expandAllSections} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white rounded transition-colors uppercase tracking-widest flex items-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">expand_content</span>
                     <span className="hidden md:inline">{isKr ? '전체 펼치기' : 'Expand All'}</span>
                 </button>
                 <button onClick={collapseAllSections} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white rounded transition-colors uppercase tracking-widest flex items-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">collapse_content</span>
                     <span className="hidden md:inline">{isKr ? '전체 접기' : 'Collapse All'}</span>
                 </button>
                 <button onClick={toggleAccordionMode} className={`px-4 py-2 border text-xs rounded transition-colors uppercase tracking-widest flex items-center gap-2 md:hidden ${isAccordionMode ? 'bg-[#5B13EC]/20 border-[#5B13EC] text-[#5B13EC]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                     <span className="material-symbols-outlined text-[16px]">{isAccordionMode ? 'view_agenda' : 'view_stream'}</span>
                     <span>{isKr ? '섹션 하나만 보기' : 'View One by One'} {isAccordionMode ? 'ON' : 'OFF'}</span>
                 </button>
            </div>

            {/* Minimalist Header */}
            {rawRepresentativeArtworkUrl && (
                <div className="w-full aspect-[21/9] md:aspect-[3/1] max-w-5xl mx-auto overflow-hidden relative shadow-2xl mb-2 mt-4">
                    <StableArtworkPreview src={representativeArtworkUrl} alt="Project Representative Artwork" className="opacity-90 object-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                </div>
            )}
            <div className="text-center pb-4 border-b border-white/10 space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] font-sans text-slate-400 mb-2 mt-8">Seedbar Creative Engine</p>
                <h1 className="text-3xl font-light italic text-white/90">Curated Exhibition Catalog</h1>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-primary/30 bg-primary/10 text-primary">
                        {projectStatus}
                    </span>
                    <AutosaveIndicator state={autosaveState} updatedAt={autosaveUpdatedAt} />
                    <span className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-white/10 bg-white/5 text-slate-400">
                        Last edited: {formatRelativeTime(lastEdited)}
                    </span>
                    <button onClick={handleSaveToDataset} className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-teal-500/30 bg-teal-500/10 text-teal-400 font-bold hover:bg-teal-500/20 active:scale-95 transition-all">
                        {isKr ? '데이터셋 저장' : 'Save Dataset'}
                    </button>
                    <button 
                        onClick={handleTogglePortfolio}
                        className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border font-bold transition-all flex items-center gap-1 active:scale-95 ${
                            isProjectSaved 
                                ? 'bg-primary/20 border-primary text-primary-light hover:bg-primary/30' 
                                : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[14px]">
                            {isProjectSaved ? 'bookmark_added' : 'bookmark_add'}
                        </span>
                        {isKr 
                            ? (isProjectSaved ? '포트폴리오에 저장됨' : '포트폴리오에 저장') 
                            : (isProjectSaved ? 'Saved to Portfolio' : 'Save to Portfolio')
                        }
                    </button>
                </div>
                {currentPlan === 'free' ? (
                    <div className="text-[11px] text-amber-300/90 font-sans">
                        Upgrade to a paid plan to unlock rewrite and advanced studio tools.
                    </div>
                ) : null}
            </div>

            {/* STEP 1: Title Generator — Hammer-Hit v4.0 (Diversity Engine) */}
            <WorkTitleSection
                draftData={draftData}
                expanded={expandedSections.titles}
                onToggle={() => toggleSection('titles')}
                isKr={isKr}
                onSelectWorkTitle={onSelectWorkTitle}
                onDataUpdate={onDataUpdate}
            />

            {/* 🎲 CHANCE OPERATION DNA (우연성 엔진 결과) */}
            {draftData.chanceOperation && (
                <div className={`bg-gradient-to-r from-[#5B13EC]/10 to-transparent border border-[#5B13EC]/20 p-6 relative transition-all ${expandedSections.dna ? '' : 'h-[60px] overflow-hidden'}`}>
                    <div className="absolute top-3 right-4 text-[9px] uppercase tracking-widest text-[#5B13EC]/50 font-mono">
                        🎲 {draftData.chanceOperation.rollId}
                    </div>
                    <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-[#5B13EC] mb-4 flex items-center gap-3 cursor-pointer" onClick={() => toggleSection('dna')}>
                        <span className="w-4 h-[1px] bg-[#5B13EC]"></span>
                        {isKr ? "AI 설계 핵심 DNA (AI Design DNA)" : "AI Design DNA"}
                        <span className="material-symbols-outlined text-[16px] leading-none text-white">{expandedSections.dna ? 'expand_less' : 'expand_more'}</span>
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

            {/* ARTWORK IMAGE GENERATOR */}
            <ErrorBoundary>
                <ArtworkImageGenerator 
                    draftData={draftData} 
                    isKr={isKr} 
                    onSaveImage={async (url) => {
                        if (typeof onSaveArtworkImage === 'function') {
                            const result = await onSaveArtworkImage(url);
                            if (result?.ok === false) {
                                throw result.error || new Error('Failed to save artwork image');
                            }
                            if (updatePortfolioItem && projectId) {
                                updatePortfolioItem(projectId, {
                                    thumbnailUrl: result?.artwork?.thumbnailUrl || url,
                                    coverImage: result?.artwork?.originalUrl || result?.artwork?.thumbnailUrl || url,
                                });
                            }
                        } else {
                            const next = {
                                ...(draftData || {}),
                                thumbnailUrl: url,
                                pamphlet: {
                                    ...(draftData?.pamphlet || {}),
                                    coverImageUrl: url,
                                },
                                projectStatus: 'in_progress',
                                lastEdited: new Date().toISOString(),
                            };
                            onDataUpdate?.(next);
                        }

                        if (updatePortfolioItem && projectId) {
                            updatePortfolioItem(projectId, { thumbnailUrl: url, coverImage: url });
                        }
                    }} 
                />
            </ErrorBoundary>

            {/* STEP 2: Concept Generator */}
            <div id="section-story" className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-none p-10 relative overflow-hidden transition-all duration-700 ${expandedSections.concept ? '' : 'h-[75px] leading-none'}`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-white/20"></div>
                <div className="mb-6 flex items-center justify-between gap-3">
                    <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-500 flex items-center gap-3 cursor-pointer" onClick={() => toggleSection('concept')}>
                        <span className="w-6 h-[1px] bg-slate-500"></span>
                        {isKr ? '기획 의도 (Concept & Philosophy)' : 'Step 2: Core Concept'}
                        <span className="material-symbols-outlined text-[16px] leading-none text-white">{expandedSections.concept ? 'expand_less' : 'expand_more'}</span>
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
                             {Object.entries({
                                 ...draftData.narrative?.lma,
                                 body: draftData.narrative?.lma?.body || { en: "Spine initiated motion\nFragmented upper body articulation\nAsymmetrical leg grounding", kr: "척추 주도 움직임\n분절된 상체 관절 활용\n비대칭적 하체 접지" }
                             }).map(([key, val]) => (
                                <div key={key} className="group relative flex flex-col bg-white/5 border border-white/10 px-3 py-2 transition-all hover:bg-white/10 hover:border-white/30 cursor-default">
                                    <span className="text-[8px] uppercase tracking-widest text-primary font-bold mb-1 opacity-70 group-hover:opacity-100">{key}</span>
                                    <span className="text-[10px] text-white/90 font-sans tracking-wide whitespace-pre-line leading-relaxed">{t(val)}</span>
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
                    <div className={`bg-black/20 backdrop-blur-md border border-white/5 p-10 transition-all ${expandedSections.narrative ? '' : 'h-[75px] overflow-hidden'}`}>
                        <div className="mb-6 flex items-center justify-between gap-3">
                            <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-500 flex items-center gap-3 cursor-pointer" onClick={() => toggleSection('narrative')}>
                                <span className="w-6 h-[1px] bg-slate-500"></span>
                                {isKr ? "단계 3: 안무 내러티브" : "Step 3: Narrative"}
                                <span className="material-symbols-outlined text-[16px] leading-none text-white">{expandedSections.narrative ? 'expand_less' : 'expand_more'}</span>
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

                    <div className={`bg-black/20 backdrop-blur-md border border-white/5 p-10 flex flex-col justify-between transition-all ${expandedSections.emotion ? '' : 'h-[75px] overflow-hidden'}`}>
                        <div>
                            <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-500 mb-2 flex items-center gap-3 cursor-pointer" onClick={() => toggleSection('emotion')}>
                                <span className="w-6 h-[1px] bg-slate-500"></span>
                                {isKr ? "감정 및 에너지 흐름 분석" : "Emotion & Energy Flow"}
                                <span className="material-symbols-outlined text-[16px] leading-none text-white">{expandedSections.emotion ? 'expand_less' : 'expand_more'}</span>
                            </h2>
                            <p className="text-xs text-slate-400 font-sans mb-8">
                                {isKr ? "작품의 흐름에 따른 감정 강도 곡선입니다." : "Intensity curve mapped across the narrative timeframe."}
                            </p>
                        </div>
                        <div className="h-64 w-full mt-auto flex flex-col justify-between gap-4">
                            <div className="h-28 w-full relative">
                                <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest text-white/50 font-bold z-10">{isKr ? 'Emotion Curve' : 'Emotion Curve'}</span>
                                <Line ref={chartRef} data={chartData} options={chartOptions} />
                            </div>
                            <div className="h-28 w-full relative">
                                <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest text-[#FF5733]/80 font-bold z-10">{isKr ? 'Energy Curve' : 'Energy Curve'}</span>
                                <Line data={energyChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Choreography Timing Engine */}
                <div id="section-movement" className={`bg-white/5 backdrop-blur-md border border-white/10 p-8 flex flex-col relative overflow-hidden transition-all duration-700 ${expandedSections.timing ? '' : 'h-[80px]'}`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#5B13EC]"></div>
                    <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-300 mb-6 flex items-center justify-between cursor-pointer" onClick={() => toggleSection('timing')}>
                        <div className="flex items-center gap-3">
                            <span className="w-4 h-[1px] bg-[#5B13EC]"></span>
                            {isKr ? "AI 안무 타이밍 엔진 (Choreography Timing)" : "AI Choreography Timing Engine"}
                            <span className="material-symbols-outlined text-[16px] leading-none text-white">{expandedSections.timing ? 'expand_less' : 'expand_more'}</span>
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
                            onChange={(newItems) => {
                                setTimelineItems(newItems);
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
                                            
                                            {/* Movement Prompt AI Field */}
                                            <div className="mt-3 p-3 bg-black/50 border border-white/5 flex flex-col gap-2 rounded-sm">
                                                <span className="text-[9px] uppercase tracking-widest text-teal-400 block font-bold">Movement Prompt</span>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] uppercase tracking-widest text-slate-500 mb-0.5">Keywords</span>
                                                        <span className="text-[10px] text-slate-300 font-serif leading-tight">{t(item.prompt?.keywords) || (isKr ? '나선형 척추 기동' : 'Spiral torso initiation')}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] uppercase tracking-widest text-slate-500 mb-0.5">Connection</span>
                                                        <span className="text-[10px] text-slate-300 font-serif leading-tight">{t(item.prompt?.connection) || (isKr ? '지연된 팔의 뻗음' : 'Delayed arm extension')}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] uppercase tracking-widest text-slate-500 mb-0.5">Direction</span>
                                                        <span className="text-[10px] text-slate-300 font-serif leading-tight">{t(item.prompt?.direction) || (isKr ? '바닥으로의 급격한 낙하' : 'Sudden drop to floor')}</span>
                                                    </div>
                                                </div>
                                            </div>
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
                                            {/* Attached References */}
                                            {item.references && item.references.length > 0 && (
                                                <div className="mt-3 p-3 bg-teal-500/10 border border-teal-500/20 flex flex-col gap-2 rounded-sm">
                                                    <span className="text-[9px] uppercase tracking-widest text-teal-400 block font-bold">Attached References</span>
                                                    <div className="flex flex-col gap-2">
                                                        {item.references.map((ref, rIdx) => (
                                                            <div key={rIdx} className="flex justify-between items-center bg-black/40 px-3 py-2 border border-white/5 hover:border-white/10 transition-colors rounded">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-teal-400 material-symbols-outlined text-[18px]">play_circle</span>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-teal-300 font-bold uppercase tracking-widest">{ref.keyword}</span>
                                                                        <span className="text-xs text-slate-300">{t(ref.name)}</span>
                                                                    </div>
                                                                </div>
                                                                <button 
                                                                    onClick={() => {
                                                                        const newTimeline = [...timelineItems];
                                                                        newTimeline[idx].references.splice(rIdx, 1);
                                                                        setTimelineItems(newTimeline);
                                                                    }}
                                                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
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

                {/* Movement Reference Library */}
                <ErrorBoundary>
                    <MovementReferenceLibrary
                        isKr={isKr}
                        projectSeed={`${projectId || 'draft'}:${draftData?.pamphlet?.coverTitle || draftData?.titles?.scientific?.en || 'seedbar'}`}
                        projectContext={studioContext}
                        onAddReference={(ref) => setShowRefSelectModal(ref)}
                    />
                </ErrorBoundary>
            </div>

            {/* AI STAGE MAP ENGINE (2D Flow Visualization) */}
            <div id="section-formation" className={`w-full flex flex-col gap-4 my-8 transition-all duration-700 ${expandedSections.formation ? '' : 'h-[40px] overflow-hidden'}`}>
                 <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-400 flex items-center justify-between cursor-pointer" onClick={() => toggleSection('formation')}>
                     <div className="flex items-center gap-3">
                         <span className="w-4 h-[1px] bg-slate-400"></span>
                         {isKr ? "AI 스테이지 맵 엔진 (Stage Map Engine)" : "AI Stage Map Engine"}
                         <span className="material-symbols-outlined text-[16px] leading-none text-white">{expandedSections.formation ? 'expand_less' : 'expand_more'}</span>
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
                    <ErrorBoundary>
                        <FlowPatternSimulator
                            dancersCount={Number(dancersCount) || Number(draftData?.seedbarInput?.teamSize) || 1}
                            flowDataFromDraft={stageFlowDraft}
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
                                if (activeItem?.time && activeItem.time !== selectedTimelineTime) {
                                    setSelectedTimelineTime(activeItem.time);
                                }
                            }}
                            onSelectDancerRole={(role) => setSelectedDancerRole(role)}
                        />
                    </ErrorBoundary>
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
            <div id="section-music" className={`bg-black/20 backdrop-blur-md border border-white/5 p-8 flex flex-col my-8 relative overflow-hidden transition-all duration-700 ${expandedSections.music ? '' : 'h-[75px]'}`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#5B13EC] to-transparent" />
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-400 mb-4 flex items-center gap-3 cursor-pointer z-10" onClick={() => toggleSection('music')}>
                    <span className="w-4 h-[1px] bg-slate-400"></span>
                    {isKr ? "음악 추천 엔진 (AI Music Engine)" : "AI Music Engine"}
                    <span className="material-symbols-outlined text-[16px] leading-none text-white">{expandedSections.music ? 'expand_less' : 'expand_more'}</span>
                </h2>
                <div className={expandedSections.music ? '' : 'hidden'}>
                <ErrorBoundary>
                    <MusicRecommendationPanel
                        genre={musicInput.genre}
                        mood={musicInput.mood}
                        keywords={musicInput.keywords}
                        duration={musicInput.duration}
                        competitionMode={musicInput.competitionMode}
                        tempo={data?.music?.tempo}
                        emotionCurve={data?.narrative?.emotionCurve || []}
                        autoRecommend={false}
                        hideActionButton={false}
                        initialRecommendations={data?.musicRecommendations}
                        onRecommendationsFetched={(recs) => {
                            if (safeJson(data?.musicRecommendations) === safeJson(recs)) {
                                return;
                            }
                            const next = { ...draftData, musicRecommendations: recs, lastEdited: new Date().toISOString() };
                            onDataUpdate?.(next);
                        }}
                        selectedTrackId={data?.selectedMusicTrack?.id}
                        onSelectTrack={(track) => {
                            const next = { 
                                ...draftData, 
                                selectedMusicTrack: {
                                    id: track.spotify_track_id || track.youtube_video_id,
                                    ...track
                                }, 
                                lastEdited: new Date().toISOString() 
                            };
                            onDataUpdate?.(next);
                        }}
                    />
                </ErrorBoundary>
                </div>
            </div>

            {/* ─── AI Choreography Studio ─── */}
            <div className={`bg-white/5 border border-white/10 p-6 md:p-8 backdrop-blur-sm space-y-6 relative overflow-hidden transition-all duration-700 ${expandedSections.studio ? '' : 'h-[80px]'}`} id="studio-section">
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-[#5B13EC] mb-2 flex items-center justify-between cursor-pointer" onClick={() => toggleSection('studio')}>
                    <div className="flex items-center gap-3">
                        <span className="w-4 h-[1px] bg-[#5B13EC]"></span>
                        {isKr ? "AI 안무 스튜디오 (AI Choreography Studio)" : "AI Choreography Studio"}
                        <span className="material-symbols-outlined text-[16px] leading-none text-[#5B13EC]">{expandedSections.studio ? 'expand_less' : 'expand_more'}</span>
                    </div>
                </h2>
                <div className="flex flex-wrap items-center justify-between mb-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                            {isKr ? '통합 스튜디오' : 'Unified Studio'}
                        </span>
                        <p className="max-w-xl text-xs leading-relaxed text-slate-400">
                            {isKr
                                ? '간단/고급 모드를 나누지 않고, 하나의 작업 화면 안에서 필요한 기능을 바로 사용할 수 있도록 통합했습니다.'
                                : 'Simple and advanced modes are merged so the right tools stay available in one studio workspace.'}
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setShowHelpModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs text-slate-300 font-semibold active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        {isKr ? '사용법 보기' : 'Help & Tutorial'}
                    </button>
                </div>

                {showHelpModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-[#1A1A24] border border-white/10 w-full max-w-lg shadow-2xl overflow-hidden rounded-xl animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-[#5B13EC]/20 to-transparent">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#5B13EC]">lightbulb</span>
                                    {isKr ? 'AI Choreography Studio 사용 안내' : 'How to use AI Choreography Studio'}
                                </h3>
                                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                    {isKr 
                                        ? '이곳에서는 AI를 활용해 안무를 다듬고 다양한 버전을 실험할 수 있습니다. 저장된 모든 결과는 잃어버리지 않고 안전하게 보관됩니다.' 
                                        : 'Here you can refine choreography and experiment with different versions using AI.'}
                                </p>
                            </div>
                            <div className="p-6 space-y-5 bg-black/20">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">✏️</span>
                                    <div>
                                        <h4 className="font-semibold text-white/90 text-sm">{isKr ? '섹션 재작성' : 'Rewrite Section'}</h4>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{isKr ? '특정 구간(Story, Movement 등)의 안무 설명을 마음에 들 때까지 부분적으로 다시 생성합니다.' : 'Regenerate specific choreography sections until you like them.'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">🔀</span>
                                    <div>
                                        <h4 className="font-semibold text-white/90 text-sm">{isKr ? '변형 생성 (Variation)' : 'Generate Variation'}</h4>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{isKr ? '기존 작품의 핵심 구조를 유지한 채, 약간 다른 흐름의 전체 버전을 새롭게 파생시킵니다.' : 'Create a new version with a slightly different flow while keeping the core structure.'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">🎛️</span>
                                    <div>
                                        <h4 className="font-semibold text-white/90 text-sm">{isKr ? '분위기 조정 (Mood Tuning)' : 'Mood Tuning'}</h4>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{isKr ? '슬라이더를 통해 작품의 강도(Intensity), 감정 깊이(Emotion) 등을 세밀하게 튜닝합니다.' : 'Finely control the intensity, emotion, etc. of the piece using sliders.'}</p>
                                    </div>
                                </div>
                                <div className="bg-[#5B13EC]/10 border border-[#5B13EC]/30 rounded-lg p-3 mt-4">
                                    <p className="text-xs text-teal-400 font-semibold flex items-start gap-2">
                                        <span className="material-symbols-outlined text-[14px] mt-0.5">save</span>
                                        <span className="leading-relaxed">
                                            {isKr ? '저장된 결과는 원래 설계도에 즉각 반영되며, 이전 버전을 언제든 다시 불러올 수 있습니다.' : 'Saved results reflect instantly on your draft. You can restore previous versions anytime.'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 border-t border-white/10 bg-[#1A1A24] flex justify-end">
                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    className="px-6 py-2.5 bg-[#5B13EC] hover:bg-[#4a0ebb] text-white text-sm font-bold rounded-lg transition-colors active:scale-95"
                                >
                                    {isKr ? '확인 및 시작하기' : 'Got it'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ProjectHeader
                    title={t(data?.pamphlet?.coverTitle || data?.titles?.scientific) || '작품 제목'}
                    activeVersion={(versions || []).find((v) => v.id === activeVersionId)}
                    lastEdited={data?.lastEdited || data?.projectStatus?.updatedAt}
                />

                <StudioToolbar
                    plan={policy?.name?.toLowerCase() || 'free'}
                    language={isKr ? 'KR' : 'EN'}
                    disabled={false}
                    onRewrite={() => {
                        const sectionKey = window.prompt(
                            isKr ? '재작성할 섹션을 입력하세요:\nstory / movement / formation / music / stage / artist_note'
                                : 'Enter section to rewrite:\nstory / movement / formation / music / stage / artist_note',
                            'story'
                        );
                        if (sectionKey) handleRewriteSection(sectionKey);
                    }}
                    onVariation={handleGenerateVariation}
                    onTune={handleTuneWithSliders}
                    onAddVersion={handleCreateVersion}
                />

                <VersionManager
                    versions={versions || []}
                    activeVersionId={activeVersionId}
                    plan={policy?.name?.toLowerCase() || 'free'}
                    disabled={Boolean(versionAction?.pending)}
                    busyAction={versionAction?.type}
                    busyVersionId={versionAction?.versionId}
                    errorMessage={studioError}
                    onDismissError={() => clearError?.()}
                    onSelect={handleSelectVersion}
                    onDuplicate={handleDuplicateVersion}
                    onDelete={handleDeleteVersion}
                    onGenerate={handleGenerateVariation}
                />

                {studioNotice ? (
                    <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-100">
                        <div className="flex items-start justify-between gap-3">
                            <span>{studioNotice}</span>
                            <button
                                type="button"
                                onClick={() => setStudioNotice('')}
                                className="shrink-0 text-amber-100/70 transition-colors hover:text-amber-50"
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </div>
                    </div>
                ) : null}

                {/* (Removed duplicate old Rewrite Buttons Grid) */}
                <div className="border-t border-white/10 pt-5">
                    <h3 className="text-sm font-semibold text-white mb-1">{isKr ? 'Mood Sliders' : 'Mood Sliders'}</h3>
                    <p className="text-xs text-slate-400 mb-4">
                        {isKr ? '슬라이더를 조작해 원하는 분위기를 만든 후 아래 적용 버튼을 누르면, AI가 프로젝트 전체 내용을 튜닝합니다.' : 'Adjust sliders to set the mood, then let AI tune the content.'}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { key: 'intensity', label: 'Intensity', desc: isKr ? '에너지 강도와 장면 압축감' : 'Energy intensity & scene compression' },
                            { key: 'emotion', label: 'Emotion', desc: isKr ? '감정 표현의 진폭과 깊이' : 'Amplitude & depth of emotion' },
                            { key: 'darkness', label: 'Darkness', desc: isKr ? '어두움, 무게감, 긴장도' : 'Heaviness, tension, & darkness' },
                            { key: 'speed', label: 'Speed', desc: isKr ? '전체 호흡 및 템포 속도' : 'Overall pacing & tempo' },
                        ].map((s) => (
                            <label key={s.key} className="block">
                                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                                    <span className="flex items-center gap-2">
                                        {s.label}
                                        <span className="hidden text-[10px] text-slate-500 sm:inline">({s.desc})</span>
                                    </span>
                                    <span>{sliders?.[s.key] ?? 50}</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={sliders?.[s.key] ?? 50}
                                    onChange={(e) => setSlider(s.key, Number(e.target.value))}
                                    disabled={!policy?.canUseMoodSliders || isTuning}
                                    className="w-full accent-primary disabled:opacity-40 cursor-pointer"
                                />
                            </label>
                        ))}
                    </div>
                    
                    <button
                        onClick={handleTuneWithSliders}
                        disabled={!policy?.canUseMoodSliders || isTuning}
                        className="mt-4 px-4 py-2 text-xs font-semibold bg-white/10 border border-white/20 hover:bg-white/20 disabled:opacity-40 flex items-center gap-2"
                    >
                        {isTuning ? (
                            <>
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {isKr ? '슬라이더 반영 중...' : 'Tuning...'}
                            </>
                        ) : (
                            isKr ? '슬라이더 반영 적용' : 'Apply Slider Tuning'
                        )}
                    </button>
                    
                    {draftData?.tuning?.summary && (
                        <div id="slider-summary-box" className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-500">
                            <h4 className="text-xs font-semibold text-primary mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                {isKr ? '슬라이더 반영 결과' : 'Tuning Result'}
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                                {isKr ? draftData.tuning.summary.kr : draftData.tuning.summary.en}
                            </p>
                            
                            {draftData?.tuning?.before && (
                                <div className="space-y-3 border-t border-primary/20 pt-3 mt-3">
                                    <h5 className="text-[10px] font-semibold text-primary/80 uppercase tracking-widest">{isKr ? '주요 변경점 (Before -> After)' : 'Key Changes (Before -> After)'}</h5>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/20 p-2 rounded">
                                        <div className="text-slate-500 line-through truncate">{t(draftData.tuning.before.narrative) || 'N/A'}</div>
                                        <div className="text-green-400 truncate">{t(draftData.narrative?.development) || 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/20 p-2 rounded">
                                        <div className="text-slate-500 line-through truncate">{draftData.tuning.before.music || 'N/A'}</div>
                                        <div className="text-green-400 truncate">{draftData.music?.style || 'N/A'}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/20 p-2 rounded">
                                        <div className="text-slate-500 line-through truncate">{draftData.tuning.before.lighting || 'N/A'}</div>
                                        <div className="text-green-400 truncate">{draftData.stage?.lighting || 'N/A'}</div>
                                    </div>
                                </div>
                            )}

                            <p className="text-[10px] text-slate-500 mt-4">
                                {isKr ? '해당 변경 사항이 안무 설명, 음악, 무대 전반에 자동 하이라이트 되었습니다.' : 'Changes have been automatically highlighted across narrative, music, and stage.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* VISUALS: Stage & Costume */}
            <div id="section-stage" className={`grid grid-cols-1 gap-8 mb-8 transition-all duration-700 ${expandedSections.stage ? '' : 'h-[75px] overflow-hidden'}`}>
                <div className="bg-white/5 border border-white/10 p-8 backdrop-blur-sm relative">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <h2 className="text-[11px] uppercase tracking-[0.2em] font-sans text-slate-400 flex items-center gap-3 cursor-pointer" onClick={() => toggleSection('stage')}>
                            <span className="w-4 h-[1px] bg-slate-400"></span>
                            {isKr ? "무대 및 비주얼 컨셉" : "Stage & Visual Concept"}
                            <span className="material-symbols-outlined text-[16px] leading-none text-white">{expandedSections.stage ? 'expand_less' : 'expand_more'}</span>
                        </h2>
                        {renderSectionAction('stage')}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-black/30 border border-white/5 rounded-lg">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="text-[10px] text-teal-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">highlight</span> {isKr ? '조명 (Lighting)' : 'Lighting'}
                                </h3>
                                {renderStageVisualizationButton('lighting')}
                            </div>
                            <p className="text-sm text-slate-300 font-serif leading-relaxed h-[80px] overflow-y-auto custom-scrollbar pr-2">{t(draftData.stage?.lighting) || 'N/A'}</p>
                            {stageVisualizations?.lighting && (
                                <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-teal-400/70">
                                    {isKr ? `저장된 2D 컨셉 · ${formatRelativeTime(stageVisualizations.lighting.savedAt || stageVisualizations.lighting.generatedAt)}` : `Saved visual concept · ${formatRelativeTime(stageVisualizations.lighting.savedAt || stageVisualizations.lighting.generatedAt)}`}
                                </p>
                            )}
                        </div>
                        <div className="p-4 bg-black/30 border border-white/5 rounded-lg">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="text-[10px] text-pink-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">checkroom</span> {isKr ? '의상 (Costume)' : 'Costume'}
                                </h3>
                                {renderStageVisualizationButton('costume')}
                            </div>
                            <p className="text-sm text-slate-300 font-serif leading-relaxed h-[80px] overflow-y-auto custom-scrollbar pr-2">{t(draftData.stage?.costume) || 'N/A'}</p>
                            {stageVisualizations?.costume && (
                                <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-pink-400/70">
                                    {isKr ? `저장된 2D 컨셉 · ${formatRelativeTime(stageVisualizations.costume.savedAt || stageVisualizations.costume.generatedAt)}` : `Saved visual concept · ${formatRelativeTime(stageVisualizations.costume.savedAt || stageVisualizations.costume.generatedAt)}`}
                                </p>
                            )}
                        </div>
                        <div className="p-4 bg-black/30 border border-white/5 rounded-lg">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="text-[10px] text-[#5B13EC] font-bold uppercase tracking-widest flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">chair</span> {isKr ? '소품 (Props)' : 'Props'}
                                </h3>
                                {renderStageVisualizationButton('props')}
                            </div>
                            <p className="text-sm text-slate-300 font-serif leading-relaxed h-[80px] overflow-y-auto custom-scrollbar pr-2">{t(draftData.stage?.props) || 'N/A'}</p>
                            {stageVisualizations?.props && (
                                <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-primary/80">
                                    {isKr ? `저장된 2D 컨셉 · ${formatRelativeTime(stageVisualizations.props.savedAt || stageVisualizations.props.generatedAt)}` : `Saved visual concept · ${formatRelativeTime(stageVisualizations.props.savedAt || stageVisualizations.props.generatedAt)}`}
                                </p>
                            )}
                        </div>
                        <div className="p-4 bg-black/30 border border-white/5 rounded-lg">
                            <h3 className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">foundation</span> {isKr ? '무대 오브젝트 (Stage Objects)' : 'Stage Objects'}
                            </h3>
                            <p className="text-sm text-slate-300 font-serif leading-relaxed h-[80px] overflow-y-auto custom-scrollbar pr-2">{t(draftData.stage?.stageObjects) || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-black/30 border border-white/5 rounded-lg">
                            <h3 className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">pan_tool_alt</span> {isKr ? '공간 사용 방식 (Spatial Use)' : 'Spatial Use'}
                            </h3>
                            <p className="text-sm text-slate-300 font-serif leading-relaxed h-[80px] overflow-y-auto custom-scrollbar pr-2">{t(draftData.stage?.spatialUse) || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-black/30 border border-white/5 rounded-lg">
                            <h3 className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">theater_comedy</span> {isKr ? '장면별 시각 분위기 (Visual Mood per Scene)' : 'Visual Mood per Scene'}
                            </h3>
                            <p className="text-sm text-slate-300 font-serif leading-relaxed h-[80px] overflow-y-auto custom-scrollbar pr-2">{t(draftData.stage?.visualMoodPerScene) || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* STEP 7: Pamphlet Designer (Exhibition Print Format) */}
            <div id="section-artist_note" className={`bg-slate-900 text-slate-100 p-8 md:p-12 mt-4 relative transition-all duration-700 rounded-2xl border border-white/10 ${expandedSections.artist_note ? '' : 'h-[75px] overflow-hidden'}`}>
                <div className="absolute top-4 right-6 text-[10px] uppercase tracking-[0.3em] font-sans text-slate-400 cursor-pointer flex items-center gap-2 z-30" onClick={() => toggleSection('artist_note')}>
                    {isKr ? 'Step 7: 최종 팜플렛 미리보기 (Pamphlet Preview)' : 'Step 7: Pamphlet Preview'}
                    <span className="material-symbols-outlined text-[16px]">{expandedSections.artist_note ? 'expand_less' : 'expand_more'}</span>
                </div>
                <div className="absolute top-4 left-6 z-30">
                    {renderSectionAction('artist_note')}
                </div>
                
                <div className="mt-12">
                     <ErrorBoundary>
                         <PamphletFlipbook 
                            pamphlet={draftData.pamphlet} 
                            isKr={isKr} 
                            onSave={(newPamphlet) => {
                                if (onDataUpdate) {
                                    onDataUpdate({ ...data, pamphlet: newPamphlet });
                                }
                            }}
                         />
                     </ErrorBoundary>
                </div>
            </div>

            {/* Action Buttons & Paywall Export */}
            <div className="flex flex-col items-center gap-4 mt-12 pb-12">
                <p className="text-xs font-sans text-slate-500 uppercase tracking-widest">Pricing & Export</p>
                <div className="flex flex-wrap justify-center gap-6">
                    <div className="relative group">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                            {isKr ? '유료 플랜에서 섹션 재생성이 가능합니다.' : 'Section regeneration is available on paid plans.'}
                        </div>
                        <button onClick={handleRegenClick} className="px-6 py-3 bg-white/5 border border-white/20 text-white rounded-none hover:bg-white/10 transition-all text-sm uppercase tracking-widest font-sans font-light">
                            {isKr ? '재생성' : 'Regenerate'}
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                            {isKr ? 'PPT 및 프로덕션 패키지 생성 (유료 플랜)' : 'Generate Pitch & Production Package (Paid Plans)'}
                        </div>
                        <button 
                            onClick={() => setIsExportModalOpen(true)}
                            className="px-8 py-3 bg-white text-black font-semibold rounded-none hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm uppercase tracking-widest font-sans flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">publish</span>
                            {isKr ? 'PPT / 프로덕션 패키지 발행' : 'Publish Production Package'}
                            <span className="font-bold border-l border-black/20 pl-2 ml-1">{String(currentPlan || 'free').toUpperCase()}</span>
                        </button>
                    </div>
                </div>
            </div>

            <ErrorBoundary>
                <ExportPackageModal 
                    isOpen={isExportModalOpen} 
                    onClose={() => setIsExportModalOpen(false)} 
                    draftData={draftData} 
                    token={token} 
                    currentPlan={currentPlan} 
                    isKr={isKr} 
                    onSaveAndView={(pkg) => {
                        const next = { ...draftData, generatedPackage: pkg };
                        onDataUpdate?.(next);
                        setIsExportModalOpen(false);
                        const targetId = projectId || draftData?.id || draftData?.projectId;
                        if (targetId) navigate(`/project/${targetId}/ppt`);
                    }}
                />
            </ErrorBoundary>

            {/* Modal for Selecting Timeline Section to add Reference */}
            {showRefSelectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <div className="bg-[#110D26] border border-white/20 p-8 rounded-none w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-[#5B13EC]"></div>
                        <h3 className="text-white font-serif italic text-xl mb-2 text-center">
                            {isKr ? "어느 섹션에 레퍼런스를 추가할까요?" : "Add Reference to Section"}
                        </h3>
                        <p className="text-center text-xs text-slate-400 mb-6 font-sans">
                            {isKr ? "적용할 안무 흐름(Timeline Cue)을 선택해주세요." : "Select a timeline cue to attach this movement reference."}
                        </p>
                        
                        <div className="flex justify-center mb-8">
                           <div className="flex flex-col items-center gap-2 bg-teal-500/10 px-6 py-4 border border-teal-500/30">
                              <span className="text-teal-400 font-bold uppercase tracking-widest text-[10px]">Reference</span>
                              <span className="text-white text-sm">{t(showRefSelectModal.name)}</span>
                           </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto pr-2 space-y-2 mb-8 custom-scrollbar">
                            {timelineItems.map((item, idx) => (
                                <button 
                                    key={item.id}
                                    onClick={() => {
                                        const newTimeline = [...timelineItems];
                                        if (!newTimeline[idx].references) newTimeline[idx].references = [];
                                        newTimeline[idx].references.push(showRefSelectModal);
                                        setTimelineItems(newTimeline);
                                        setExpandedCues(prev => ({...prev, [item.id]: true}));
                                        setShowRefSelectModal(null);
                                        // Scroll to that element seamlessly
                                        setTimeout(() => {
                                            document.getElementById('section-movement')?.scrollIntoView({ behavior: 'smooth' });
                                        }, 100);
                                    }}
                                    className="w-full text-left bg-black/40 hover:bg-white/10 border border-white/10 px-6 py-4 flex items-center justify-between transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-sans text-[#5B13EC] font-bold text-lg">{item.time}</span>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-white text-sm">{t(item.stage)}</span>
                                            <span className="text-slate-500 text-[10px] uppercase tracking-widest">{t(item.action)}</span>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">add_circle</span>
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => setShowRefSelectModal(null)}
                            className="w-full py-3 bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-colors uppercase tracking-widest font-sans text-xs"
                        >
                            {isKr ? "취소" : "Cancel"}
                        </button>
                    </div>
                </div>
            )}
            
            {/* Safe Bottom Padding */}
            <div className="h-40 w-full pointer-events-none" aria-hidden="true" />
        </div>
    );
}
