import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageToggle from '../components/LanguageToggle';
import useStore from '../store/useStore';
import BottomNav from '../components/BottomNav';
import ChoreographyDraft from '../components/ChoreographyDraft';
import { ChoreographyAIPipeline } from '../services/aiPipeline';
import CoinPricingModal from '../components/CoinPricingModal';
import useSubscriptionStore from '../store/useSubscriptionStore';
import useChoreographyStudioStore from '../store/useChoreographyStudioStore';
import { buildNewProjectRouteState } from '../lib/projectNavigation';
import { buildArtworkPatch } from '../lib/artworkMedia.js';

const i18n = {
    EN: {
        title: "AI Choreography Blueprint",
        subTitle: "SUBSCRIPTION ACCESS",
        emotionCurve: "Emotion Intensity Curve",
        aiAnalyzed: "AI Analyzed",
        timeline: "Structure Timeline",
        lma: "Movement Texture Analysis",
        intent: "Artistic Design DNA",
        coinTitle: "Download PPT",
        coinBalance: "Subscription status",
        coinDesc: "Advanced blueprints and production exports are available on paid plans.",
        modernLayout: "Modern Layout",
        academicDeck: "Academic Deck",
        chargeCoin: "View Plans",
        exportPPT: "Export to PPT",
        exportPDF: "Export to PDF (Free)",
        regenerate: "Regenerate Project",
        intro: "Intro",
        dev: "Dev",
        climax: "Climax",
        outro: "Outro",
        lmaDirect: "Direct",
        lmaSustained: "Sustained",
        lmaHeavy: "Heavy",
        lmaFlexible: "Flexible",
        intentDesc: "This choreography explores the juxtaposition of linear structural constraints and organic flexible expression using advanced movement analysis. The transition from direct space usage to heavy weight visualizes the psychological shift from social expectation to personal liberation.",
        aiStatus: "Academic Synth Analysis v4.2",
        regenTitle: "AI Idea Planning",
        genre: "Genre",
        genreValue: "Contemporary Urban",
        peopleCount: "Performers",
        peopleValue: "5 People",
        duration: "Duration",
        durationValue: "03:45",
        moodKeywords: "Mood Keywords",
        kw1: "#Dreamy",
        kw2: "#HeavyBeat",
        kw3: "#Elegant",
        projectName: "Project Name (Internal)",
        workTitle: "Work Title",
        workTitleHint: "AI-generated work title — independent from the project name",
        selectWorkTitle: "Select as final title",
        noTitleYet: "Generate a draft first, then AI will suggest creative work titles.",
        choreographyTimeline: "Choreography Timeline",
        aiGenerated: "AI Generated",
        stageCostume: "Stage & Costume Concept",
        regenerateAgain: "REGENERATE",
        stageLighting: "Stage Lighting",
        stageLightingDesc: "Atmospheric Neon",
        costumeConcept: "Costume Concept",
        costumeConceptDesc: "Fluid Mesh Layers",
        generateDraft: "Generate Draft",
        buildup: "Build-Up",
        peakCurve: "Emotion Curve (Peak)",
        competitionBadge: "🏆 Competition-Winning Mode",
        competitionHint: "Optimized for jury evaluation: 2~4 min, front-facing stage, extreme contrast",
        competitionDurationHint: "Recommended: 2:00 ~ 4:00 (Short & Intense)",
        generating: "Generating..."
    },
    KR: {
        title: "AI 안무 설계도",
        subTitle: "구독형 접근 제어",
        emotionCurve: "감정 강도 곡선",
        aiAnalyzed: "AI 분석 완료",
        timeline: "구조 타임라인",
        lma: "움직임 질감 분석 (Texture)",
        intent: "예술적 설계 DNA",
        coinTitle: "PPT 다운로드",
        coinBalance: "구독 상태",
        coinDesc: "고급 설계와 프로덕션 내보내기는 유료 플랜에서 이용할 수 있습니다.",
        modernLayout: "모던 레이아웃",
        academicDeck: "학술용 덱",
        chargeCoin: "플랜 보기",
        exportPPT: "PPT로 내보내기",
        exportPDF: "PDF로 내보내기 (무료)",
        regenerate: "프로젝트 재 생성하기",
        intro: "도입 (Intro)",
        dev: "전개 (Dev)",
        climax: "절정 (Climax)",
        outro: "종결 (Outro)",
        lmaDirect: "직접적",
        lmaSustained: "지속적",
        lmaHeavy: "무게감",
        lmaFlexible: "유연함",
        intentDesc: "본 안무는 고도화된 움직임 분석을 활용하여 선형적인 구조적 제약과 유기적인 유연한 표현 사이의 병치를 탐구합니다. 직접적인 공간 사용에서 무거운 무게감으로의 전환을 통해, 사회적 기대에서 개인적 해방으로 나아가는 심리적 전이 과정을 시각화합니다.",
        aiStatus: "학술적 종합 분석 v4.2",
        regenTitle: "AI 아이디어 기획",
        genre: "장르",
        genreValue: "컨템포러리 어반 (Contemporary Urban)",
        peopleCount: "인원수",
        peopleValue: "5 명",
        duration: "공연 시간",
        durationValue: "03:45",
        moodKeywords: "분위기 키워드",
        kw1: "#몽환적인",
        kw2: "#강렬한비트",
        kw3: "#우아한",
        projectName: "프로젝트명 (내부 작업용)",
        workTitle: "작품 제목",
        workTitleHint: "AI가 창의적으로 제안한 작품 제목 — 프로젝트명과는 별개입니다",
        selectWorkTitle: "최종 제목으로 선택",
        noTitleYet: "초안을 먼저 생성하면 AI가 창의적인 작품 제목을 제안합니다.",
        choreographyTimeline: "안무 타임라인",
        aiGenerated: "AI 생성됨",
        stageCostume: "의상 및 무대 콘셉트",
        regenerateAgain: "다시 생성하기",
        stageLighting: "무대 조명",
        stageLightingDesc: "대기질감이 느껴지는 네온",
        costumeConcept: "의상 콘셉트",
        costumeConceptDesc: "유동적인 메쉬 레이어",
        generateDraft: "안무 초안 생성하기",
        buildup: "빌드업",
        peakCurve: "감정 곡선 (최고조)",
        competitionBadge: "🏆 콩쿠르 우승 맞춤형 모드",
        competitionHint: "심사위원 평가 최적화: 2~4분, 정면 무대 설계, 극단적 대비",
        competitionDurationHint: "권장 시간: 2:00 ~ 4:00 (짧고 강렬한 구성)",
        generating: "생성 중..."
    }
};

const pipeline = new ChoreographyAIPipeline();
const UPGRADE_HINT_RE = /(monthly limit|upgrade|pro\/studio|studio plan|available on)/i;
const BACKEND_MISSING_RE = /(api route not found|non_json|failed to fetch|networkerror|network error)/i;
const EMPTY_ENTRY_ERROR = {
    KR: '새 프로젝트 화면을 준비하는 중 문제가 발생했습니다.',
    EN: 'We hit an issue while preparing the new project screen.',
};

function arraysEqual(left = [], right = []) {
    if (left === right) return true;
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
        if (left[index] !== right[index]) {
            return false;
        }
    }
    return true;
}

function normalizeSelectedTitleCandidate(candidate) {
    if (typeof candidate === 'string') {
        return { en: candidate, kr: candidate };
    }
    const fallback = candidate?.en || candidate?.kr || 'Untitled';
    return {
        en: candidate?.en || fallback,
        kr: candidate?.kr || fallback,
    };
}

function applySelectedTitleToDraft(draft, candidate) {
    if (!draft) return draft;
    const normalizedCandidate = normalizeSelectedTitleCandidate(candidate);
    const nextCoverTitle = normalizedCandidate.en;
    return sanitizeGeneratedPayload({
        ...draft,
        selectedWorkTitle: nextCoverTitle,
        titles: {
            ...(draft?.titles || {}),
            mainTitle: normalizedCandidate,
        },
        pamphlet: {
            ...(draft?.pamphlet || {}),
            coverTitle: nextCoverTitle,
        },
        lastEdited: new Date().toISOString(),
    });
}

function applyArtworkImageToDraft(draft, artworkAsset) {
    if (!draft) return draft;
    const artworkPatch = buildArtworkPatch(
        typeof artworkAsset === 'string'
            ? { originalUrl: artworkAsset, thumbnailUrl: artworkAsset }
            : artworkAsset,
    );
    return sanitizeGeneratedPayload({
        ...draft,
        ...artworkPatch,
        pamphlet: {
            ...(draft?.pamphlet || {}),
            ...(artworkPatch.pamphlet || {}),
        },
        projectStatus: draft?.projectStatus || 'in_progress',
        lastEdited: new Date().toISOString(),
    });
}

function sanitizeGeneratedPayload(payload) {
    const next = JSON.parse(JSON.stringify(payload || {}));
    if (next?.music && typeof next.music === 'object') {
        next.music.music_recommendations = [];
        delete next.music.acousticRationale;
        delete next.music.counterpointRule;
        delete next.music.searchQuery;
        delete next.music.bpm_timeline;
        if (next.music.providerRecommendations && typeof next.music.providerRecommendations === 'object') {
            delete next.music.providerRecommendations;
        }
    }
    if (Array.isArray(next?.music_recommendations)) {
        next.music_recommendations = [];
    }

    // 1. Data Normalization & Migration for old projects without Tone
    if (!next.titles) next.titles = {};
    if (!next.titles._tone) next.titles._tone = 'neutral';
    
    if (!next.concept) next.concept = {};
    if (!next.concept._moodTone) next.concept._moodTone = 'balanced';
    
    if (!next.music) next.music = {};
    if (!next.music._musicTone) next.music._musicTone = 'default';
    
    if (!next.stage) next.stage = {};
    if (!next.stage._visualTone) next.stage._visualTone = 'minimal';

    return next;
}

const Ideation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useStore();
    const t = i18n[language] || i18n.EN;
    const [searchParams, setSearchParams] = useSearchParams();
    const urlProjectId = searchParams.get('projectId');
    const safeEntryState = useMemo(
        () => buildNewProjectRouteState(urlProjectId ? { mode: 'draft' } : (location.state || {})),
        [location.state, urlProjectId],
    );
    const [showRegenerateMode, setShowRegenerateMode] = useState((urlProjectId ? 'draft' : safeEntryState.mode) !== 'draft');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedData, setGeneratedData] = useState(null);
    const [entryStatus, setEntryStatus] = useState(urlProjectId ? 'loading' : 'ready');
    const [entryError, setEntryError] = useState('');
    const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState("");
    const [runtimeNotice, setRuntimeNotice] = useState("");
    const {
        currentPlan,
        policy,
        getUsageLabel,
        refreshCapabilities,
        consumeGeneration,
        setPlan,
    } = useSubscriptionStore();
    const {
        initializeProject,
        projectId: studioProjectId,
        setProjectId,
        autosaveProject,
        fetchProject,
        generateTitle,
        saveProjectTitleSelection,
        saveProjectArtworkImage,
    } = useChoreographyStudioStore();

    const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
    
    // We need to know if the dummy state was already pushed
    const trapStatePushed = useRef(false);

    const [isRestoring, setIsRestoring] = useState(Boolean(location.state?.hasTemporaryContext));

    useEffect(() => {
        if (isRestoring) {
            const timer = setTimeout(() => setIsRestoring(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isRestoring]);

    useEffect(() => {
        // 복귀 중 클릭 불가/블랙스크린 방지를 위한 전역 스타일 정리
        document.body.style.pointerEvents = 'auto';
        document.body.style.overflow = 'auto';
    }, []);

    const autosaveTimerRef = useRef(null);
    const titleSelectionTimerRef = useRef(null);
    const titleSelectionRequestRef = useRef(0);
    const pendingTitleSelectionRef = useRef(null);
    const generatedDataRef = useRef(null);
    const activeProjectIdRef = useRef(urlProjectId || null);
    const skipNextAutosaveRef = useRef(false);
    const didSelfHealEntryRef = useRef(false);

    const [projectName, setProjectName] = useState(safeEntryState.projectName || "");
    const [genre, setGenre] = useState(safeEntryState.genre || "");
    const [peopleCount, setPeopleCount] = useState(safeEntryState.peopleCount || "");
    const [duration, setDuration] = useState(safeEntryState.duration || "");
    const [moodKeywords, setMoodKeywords] = useState(safeEntryState.moodKeywords || []);
    const [keywordInput, setKeywordInput] = useState("");
    const [titleTone, setTitleTone] = useState(safeEntryState.titleTone || "");
    const [titleCandidates, setTitleCandidates] = useState([]);
    const [selectedWorkTitle, setSelectedWorkTitle] = useState(safeEntryState.selectedWorkTitle || "");
    const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
    const [generationStepIndex, setGenerationStepIndex] = useState(0);
    const isCompetition = genre === 'Contemporary Dance Competition';
    const safeEntryProjectName = safeEntryState.projectName || '';
    const safeEntryGenre = safeEntryState.genre || '';
    const safeEntryPeopleCount = safeEntryState.peopleCount || '';
    const safeEntryDuration = safeEntryState.duration || '';
    const safeEntryMoodKeywords = safeEntryState.moodKeywords || [];
    const safeEntryMoodKeywordsKey = JSON.stringify(safeEntryMoodKeywords);
    const safeEntryTitleTone = safeEntryState.titleTone || '';
    const safeEntryMode = safeEntryState.mode || 'planning';

    useEffect(() => {
        generatedDataRef.current = generatedData;
    }, [generatedData]);

    useEffect(() => {
        activeProjectIdRef.current = studioProjectId || generatedData?.projectId || urlProjectId || null;
    }, [generatedData?.projectId, studioProjectId, urlProjectId]);

    const getDynamicStyles = () => {
        const seed = (projectName.length + genre.length + String(peopleCount).length) * 10;
        return {
            hueRotate: `hue-rotate(${seed % 360}deg)`,
            flex1: 1 + (seed % 3) * 0.5,
            flex2: 2 + (seed % 5) * 0.5,
            flex3: 3 + (seed % 4) * 0.5,
        };
    };
    const dynamicStyles = getDynamicStyles();

    const getDynamicConcept = () => {
        let baseStage = language === 'KR' ? "대기질감이 느껴지는 조명" : "Atmospheric Lighting";
        let baseCostume = language === 'KR' ? "유동적인 실루엣" : "Fluid Silhouette";

        if (genre.toLowerCase().includes('hip') || genre.toLowerCase().includes('힙합')) {
            baseStage = language === 'KR' ? "역동적인 스트로브 라이트" : "Intense Strobe Lights";
            baseCostume = language === 'KR' ? "스트릿 웨어 믹스매치" : "Streetwear Mix";
        } else if (genre.toLowerCase().includes('ballet') || genre.toLowerCase().includes('발레')) {
            baseStage = language === 'KR' ? "소프트 클래식 조명" : "Soft Classic Lighting";
            baseCostume = language === 'KR' ? "현대적으로 재해석된 튜튜" : "Modernized Tutu";
        } else if (genre.toLowerCase().includes('k-pop') || genre.toLowerCase().includes('kpop')) {
            baseStage = language === 'KR' ? "화려한 LED 백그라운드" : "Vibrant LED Background";
            baseCostume = language === 'KR' ? "테크웨어 디테일 아이돌컷" : "Techwear Idol Outfit";
        }

        if (moodKeywords.length > 0) {
            const key = moodKeywords[moodKeywords.length - 1].replace('#', '');
            baseStage += language === 'KR' ? ` (${key} 무드)` : ` (${key} Mood)`;
            baseCostume += language === 'KR' ? ` (${key} 포인트)` : ` (${key} Accent)`;
        }

        return { stage: baseStage, costume: baseCostume };
    };
    const dynamicConcept = getDynamicConcept();
    const generationSteps = language === 'KR'
        ? ['곡 구조 분석 중...', '메인 테마 제안 중...', '타이밍 맵 구축 중...', '무대 연출 기획 중...']
        : ['Analyzing music structure...', 'Proposing main theme...', 'Building timing map...', 'Planning stage direction...'];

    const handleSuggestTitles = async () => {
        setIsGeneratingTitles(true);
        try {
            const candidates = await generateTitle({
                genre: genre || 'Contemporary Dance',
                mood: moodKeywords.join(', '),
                theme: projectName || 'Untitled Project',
                tone: titleTone || '',
                count: 8,
                peopleCount: parseInt(peopleCount) || 1,
                duration: duration || '03:00',
            });
            const arr = Array.isArray(candidates) ? candidates : [candidates].filter(Boolean);
            setTitleCandidates(arr);
            // 첫 번째 후보를 자동으로 선택 (사용자가 변경 가능)
            if (arr.length > 0 && !selectedWorkTitle) {
                setSelectedWorkTitle(arr[0]);
            }
        } catch (error) {
            setUpgradeReason(error.message || '');
        } finally {
            setIsGeneratingTitles(false);
        }
    };

    const loadProjectById = useCallback(async (projectIdToLoad) => {
        if (!projectIdToLoad) return false;

        setEntryStatus('loading');
        setEntryError('');

        try {
            setProjectId(projectIdToLoad);
            const payload = await fetchProject(projectIdToLoad);
            const currentContent = payload?.project?.currentContent || payload?.currentContent || null;

            if (!currentContent) {
                throw new Error(language === 'KR' ? '프로젝트 데이터를 찾을 수 없습니다.' : 'Project data was not found.');
            }

            setGeneratedData(sanitizeGeneratedPayload({
                ...currentContent,
                projectId: payload?.project?.id || projectIdToLoad,
                projectStatus: payload?.project?.status || currentContent?.projectStatus,
                lastEdited: payload?.project?.updatedAt || currentContent?.lastEdited,
                beatMarkers: payload?.beatMarkers || currentContent?.beatMarkers || [],
                dancerRoles: payload?.dancerRoles || currentContent?.dancerRoles || [],
                stageFlow: payload?.stageFlow || currentContent?.stageFlow,
            }));
            setSelectedWorkTitle(currentContent?.selectedWorkTitle || currentContent?.titles?.mainTitle?.en || currentContent?.pamphlet?.coverTitle || '');
            setTitleCandidates(Array.isArray(currentContent?.titles?.candidates) ? currentContent.titles.candidates : []);
            setShowRegenerateMode(false);
            setEntryStatus('ready');
            return true;
        } catch (error) {
            console.error('[Seedbar] failed to load ideation project:', error);
            setEntryError(error?.message || EMPTY_ENTRY_ERROR[language] || EMPTY_ENTRY_ERROR.EN);
            setEntryStatus('error');
            return false;
        }
    }, [fetchProject, language, setProjectId]);

    const hasUnsavedChanges = useMemo(() => {
        return Boolean(!studioProjectId && (projectName || genre || duration || moodKeywords.length > 0 || peopleCount));
    }, [studioProjectId, projectName, genre, duration, moodKeywords, peopleCount]);

    const performBackNavigation = () => {
        // If there's no history or we came directly via URL, navigate to home/fallback
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/home', { replace: true });
        }
    };

    const handleBackClick = () => {
        if (showRegenerateMode && hasUnsavedChanges) {
            setIsUnsavedModalOpen(true);
        } else {
            // Remove our history trap if it exists before navigating back programmatically
            if (trapStatePushed.current) {
                window.history.back(); // Pop the dummy trap first
                setTimeout(() => performBackNavigation(), 10);
            } else {
                performBackNavigation();
            }
        }
    };

    const handleSaveAndLeave = async () => {
        try {
            await initializeProject({
                title: projectName || 'Untitled Creation',
                generatedContent: {
                    projectStatus: 'draft_planning',
                    seedbarInput: {
                        theme: projectName,
                        genre,
                        teamSize: peopleCount,
                        duration,
                        keywords: moodKeywords
                    }
                }
            });
            setIsUnsavedModalOpen(false);
            if (trapStatePushed.current) {
                window.history.back();
                setTimeout(() => performBackNavigation(), 10);
            } else {
                performBackNavigation();
            }
        } catch (e) {
            console.error(e);
            setIsUnsavedModalOpen(false);
            if (trapStatePushed.current) window.history.back();
            setTimeout(() => performBackNavigation(), 10);
        }
    };

    // System back button (popstate) trap
    useEffect(() => {
        if (showRegenerateMode && hasUnsavedChanges) {
            // Push a trap state so system back doesn't immediately leave the page
            if (!trapStatePushed.current) {
                window.history.pushState({ trapInfo: 'unsaved' }, '', window.location.href);
                trapStatePushed.current = true;
            }

            const handlePopState = (e) => {
                if (isUnsavedModalOpen) {
                    // Modal already open and they pressed back again, keep trapped
                    window.history.pushState({ trapInfo: 'unsaved' }, '', window.location.href);
                    return;
                }
                
                // Show modal, and replace the popped state to keep them here
                setIsUnsavedModalOpen(true);
                window.history.pushState({ trapInfo: 'unsaved' }, '', window.location.href);
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        } else {
            // If condition no longer holds but we have a trap, remove it
            if (trapStatePushed.current) {
                trapStatePushed.current = false;
                // We pop the trap we made so history is clean
                // But doing window.history.back() here could trigger other things, just flag it as unused.
            }
        }
    }, [showRegenerateMode, hasUnsavedChanges, isUnsavedModalOpen]);

    const handleGenerateProduction = async () => {
        if (isCompetition && !policy?.canUseCompetitionMode) {
            setUpgradeReason(language === 'KR'
                ? 'Competition Mode는 Studio 플랜에서 사용할 수 있습니다.'
                : 'Competition Mode is available on Studio plan only.');
            setIsCoinModalOpen(true);
            return;
        }

        setIsGenerating(true);
        try {
            let quotaChecked = false;
            try {
                await consumeGeneration();
                quotaChecked = true;
            } catch (quotaError) {
                const msg = quotaError?.message || '';
                if (BACKEND_MISSING_RE.test(msg)) {
                    console.warn('[Seedbar] quota check skipped due backend issue:', msg);
                } else {
                    throw quotaError;
                }
            }

            pipeline.titleTone = titleTone || null;
            const result = await pipeline.generateFullChoreography({
                genre: genre || "Contemporary",
                dancersCount: parseInt(peopleCount) || 5,
                duration: duration || "03:00",
                theme: projectName || "Untitled Creation",
                keywords: moodKeywords.length > 0 ? moodKeywords : ["#Creative"],
                titleTone: titleTone || null,
            });
            const payload = sanitizeGeneratedPayload({
                ...result,
                seedbarInput: {
                    genre: genre || "Contemporary Dance",
                    teamSize: parseInt(peopleCount) || 1,
                    mood: moodKeywords.join(', '),
                    keywords: moodKeywords.length > 0 ? moodKeywords : ["#Creative"],
                    duration: duration || "03:00",
                    competitionMode: isCompetition,
                    projectName: projectName || "Untitled Creation",
                },
                pamphlet: {
                    ...(result?.pamphlet || {}),
                    coverTitle: selectedWorkTitle || result?.titles?.mainTitle?.kr || result?.pamphlet?.coverTitle || 'Untitled Creation',
                },
                selectedWorkTitle: selectedWorkTitle || null,
            });
            let created = null;
            try {
                created = await initializeProject({
                    title: projectName || 'Untitled Project',
                    generatedContent: payload,
                });
                setProjectId(created?.project?.id || null);
            } catch (projectError) {
                const msg = projectError?.message || '';
                if (!BACKEND_MISSING_RE.test(msg)) throw projectError;
                console.warn('[Seedbar] project sync skipped due backend issue:', msg);
            }

            setGeneratedData({
                ...payload,
                projectId: created?.project?.id || null,
                quotaChecked,
            });
            setShowRegenerateMode(false);
            if (created?.project?.id) {
                setSearchParams({ projectId: created.project.id }, { replace: true });
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("AI Pipeline Error:", error);
            const msg = error.message || '';
            setUpgradeReason(msg);
            if (UPGRADE_HINT_RE.test(msg)) {
                setIsCoinModalOpen(true);
            } else {
                alert(msg || (language === 'KR' ? '생성 중 오류가 발생했습니다.' : 'Generation failed.'));
            }
        } finally {
            await refreshCapabilities();
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (!generatedData && urlProjectId) {
            loadProjectById(urlProjectId);
        }
    }, [generatedData, loadProjectById, urlProjectId]);

    useEffect(() => {
        const pid = studioProjectId || generatedData?.projectId;
        if (!pid || !generatedData) return;

        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current);
        }

        autosaveTimerRef.current = setTimeout(() => {
            if (skipNextAutosaveRef.current) {
                skipNextAutosaveRef.current = false;
                return;
            }
            autosaveProject(generatedData).catch((err) => {
                console.warn('[Seedbar] autosave failed:', err?.message || err);
            });
        }, 1200);

        return () => {
            if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        };
    }, [generatedData, studioProjectId, autosaveProject]);

    useEffect(() => {
        return () => {
            const latestDraft = generatedDataRef.current;
            const pid = activeProjectIdRef.current;
            if (!pid || !latestDraft) return;
            autosaveProject(latestDraft).catch(() => {});
        };
    }, [autosaveProject]);

    useEffect(() => {
        return () => {
            if (titleSelectionTimerRef.current) {
                clearTimeout(titleSelectionTimerRef.current);
            }
            pendingTitleSelectionRef.current?.resolve?.({ stale: true });
        };
    }, []);

    const handleBlueprintTitleSelect = useCallback((candidate) => {
        const normalizedCandidate = normalizeSelectedTitleCandidate(candidate);
        const nextTitle = normalizedCandidate.en;
        const targetProjectId = studioProjectId || generatedDataRef.current?.projectId;

        if (!targetProjectId || !generatedDataRef.current) {
            const nextDraft = applySelectedTitleToDraft(generatedDataRef.current, normalizedCandidate);
            setSelectedWorkTitle(nextTitle);
            setGeneratedData(nextDraft);
            return Promise.resolve({ ok: true, nextDraft });
        }

        const requestId = titleSelectionRequestRef.current + 1;
        titleSelectionRequestRef.current = requestId;

        if (titleSelectionTimerRef.current) {
            clearTimeout(titleSelectionTimerRef.current);
        }
        pendingTitleSelectionRef.current?.resolve?.({ stale: true });

        return new Promise((resolve, reject) => {
            pendingTitleSelectionRef.current = { resolve, reject };
            titleSelectionTimerRef.current = window.setTimeout(async () => {
                const latestDraft = generatedDataRef.current;
                if (!latestDraft) {
                    resolve({ ok: false, stale: true });
                    return;
                }

                const nextDraft = applySelectedTitleToDraft(latestDraft, normalizedCandidate);

                try {
                    await saveProjectTitleSelection({
                        selectedTitle: normalizedCandidate,
                        currentContent: nextDraft,
                    });

                    if (requestId !== titleSelectionRequestRef.current) {
                        resolve({ ok: false, stale: true });
                        return;
                    }

                    skipNextAutosaveRef.current = true;
                    window.requestAnimationFrame(() => {
                        setSelectedWorkTitle(nextTitle);
                        setGeneratedData(nextDraft);
                    });
                    resolve({ ok: true, nextDraft });
                } catch (error) {
                    if (requestId !== titleSelectionRequestRef.current) {
                        resolve({ ok: false, stale: true });
                        return;
                    }
                    console.warn('[Seedbar] title selection save failed:', error?.message || error);
                    setRuntimeNotice(
                        language === 'KR'
                            ? '작품 제목 저장이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'
                            : 'Saving the selected title is taking longer than expected. Please try again.'
                    );
                    reject(error);
                } finally {
                    pendingTitleSelectionRef.current = null;
                }
            }, 320);
        });
    }, [language, saveProjectTitleSelection, studioProjectId]);

    const handleBlueprintArtworkSave = useCallback(async (imageUrl) => {
        const targetProjectId = studioProjectId || generatedDataRef.current?.projectId;
        const latestDraft = generatedDataRef.current;

        if (!latestDraft) {
            return { ok: false, error: 'No draft data available.' };
        }

        if (!targetProjectId) {
            const localDraft = applyArtworkImageToDraft(latestDraft, imageUrl);
            window.requestAnimationFrame(() => {
                setGeneratedData(localDraft);
            });
            return { ok: true, nextDraft: localDraft };
        }

        try {
            const saved = await saveProjectArtworkImage({
                imageUrl,
                currentContent: latestDraft,
            });
            const persistedDraft = saved?.currentContent || applyArtworkImageToDraft(latestDraft, saved?.artwork || imageUrl);
            skipNextAutosaveRef.current = true;
            window.requestAnimationFrame(() => {
                setGeneratedData(persistedDraft);
            });
            return { ok: true, nextDraft: persistedDraft, artwork: saved?.artwork || null };
        } catch (error) {
            console.warn('[Seedbar] artwork image save failed:', error?.message || error);
            setRuntimeNotice(
                language === 'KR'
                    ? '대표 이미지 저장이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'
                    : 'Saving the representative image is taking longer than expected. Please try again.'
            );
            return { ok: false, error };
        }
    }, [language, saveProjectArtworkImage, studioProjectId]);

    useEffect(() => {
        refreshCapabilities();
    }, [refreshCapabilities, language]);

    useEffect(() => {
        if (!isGenerating) {
            setGenerationStepIndex(0);
            return undefined;
        }

        const timer = window.setInterval(() => {
            setGenerationStepIndex((prev) => (prev + 1) % generationSteps.length);
        }, 1400);

        return () => window.clearInterval(timer);
    }, [generationSteps.length, isGenerating]);

    useEffect(() => {
        if (urlProjectId) {
            setShowRegenerateMode((prev) => (prev ? false : prev));
            return;
        }

        if (studioProjectId !== null) {
            setProjectId(null);
        }
        setEntryError((prev) => (prev ? '' : prev));
        setEntryStatus((prev) => (prev !== 'ready' ? 'ready' : prev));
        const nextShowRegenerateMode = safeEntryMode !== 'draft';
        setShowRegenerateMode((prev) => (prev !== nextShowRegenerateMode ? nextShowRegenerateMode : prev));

        if (!generatedData) {
            setProjectName((prev) => (prev !== safeEntryProjectName ? safeEntryProjectName : prev));
            setGenre((prev) => (prev !== safeEntryGenre ? safeEntryGenre : prev));
            setPeopleCount((prev) => (prev !== safeEntryPeopleCount ? safeEntryPeopleCount : prev));
            setDuration((prev) => (prev !== safeEntryDuration ? safeEntryDuration : prev));
            setMoodKeywords((prev) => (arraysEqual(prev, safeEntryMoodKeywords) ? prev : safeEntryMoodKeywords));
            setTitleTone((prev) => (prev !== safeEntryTitleTone ? safeEntryTitleTone : prev));
            setTitleCandidates((prev) => (prev.length ? [] : prev));
        }
    }, [
        generatedData,
        safeEntryDuration,
        safeEntryGenre,
        safeEntryMode,
        safeEntryMoodKeywords,
        safeEntryMoodKeywordsKey,
        safeEntryPeopleCount,
        safeEntryProjectName,
        safeEntryTitleTone,
        setProjectId,
        studioProjectId,
        urlProjectId,
    ]);

    useEffect(() => {
        if (genre === 'Contemporary Dance Competition') {
            if (!duration) setDuration('03:00');
            if (!peopleCount) setPeopleCount('1');
        }
    }, [genre]);

    useEffect(() => {
        if ((location.state?.mode || safeEntryState.mode) !== 'draft') return;
        if (!studioProjectId || generatedData) return;
        loadProjectById(studioProjectId).catch(() => {});
    }, [generatedData, loadProjectById, location.state?.mode, safeEntryState.mode, studioProjectId]);

    const retryEntryLoad = async () => {
        if (urlProjectId || studioProjectId) {
            await loadProjectById(urlProjectId || studioProjectId);
            return;
        }

        setEntryError('');
        setEntryStatus('ready');
        setShowRegenerateMode(true);
    };

    const renderEntryFallback = () => {
        if (entryStatus === 'loading' && !generatedData && !showRegenerateMode) {
            return (
                <div className="relative z-20 px-6 pb-12">
                    <div className="mx-auto mt-10 max-w-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-primary">{language === 'KR' ? '새 안무 프로젝트 로딩 중' : 'Loading Choreography Project'}</p>
                        <div className="mx-auto mt-6 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        <p className="mt-6 text-sm leading-relaxed text-slate-300">
                            {language === 'KR'
                                ? '프로젝트 데이터와 자동저장 상태를 불러오는 중입니다. 검은 화면 대신 안전한 로딩 화면을 표시합니다.'
                                : 'Loading project data and autosave state. Showing a safe loading screen instead of a blank page.'}
                        </p>
                    </div>
                </div>
            );
        }

        if (entryStatus === 'error' && !generatedData) {
            return (
                <div className="relative z-20 px-6 pb-12">
                    <div className="mx-auto mt-10 max-w-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-primary">{language === 'KR' ? '프로젝트 진입 오류' : 'Project Entry Error'}</p>
                        <h2 className="mt-4 text-2xl font-semibold text-white">
                            {language === 'KR' ? '새 프로젝트 화면을 열지 못했습니다.' : 'We could not open the new project screen.'}
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-400">
                            {entryError || EMPTY_ENTRY_ERROR[language] || EMPTY_ENTRY_ERROR.EN}
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={retryEntryLoad}
                                className="border border-white/15 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-slate-200"
                            >
                                {language === 'KR' ? '다시 시도' : 'Retry'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setGeneratedData(null);
                                    setEntryError('');
                                    setEntryStatus('ready');
                                    setSearchParams({}, { replace: true });
                                    setProjectId(null);
                                    setShowRegenerateMode(true);
                                    navigate('/ideation', {
                                        replace: true,
                                        state: buildNewProjectRouteState(),
                                    });
                                }}
                                className="border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/10"
                            >
                                {language === 'KR' ? '빈 입력 폼 열기' : 'Open Empty Form'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    const handleAddKeyword = () => {
        if (keywordInput.trim() && !moodKeywords.includes(keywordInput.trim())) {
            setMoodKeywords([...moodKeywords, keywordInput.trim().startsWith('#') ? keywordInput.trim() : `#${keywordInput.trim()}`]);
            setKeywordInput("");
        }
    };

    const removeKeyword = (kw) => {
        setMoodKeywords(moodKeywords.filter(k => k !== kw));
    };

    useEffect(() => {
        if (urlProjectId) return;
        if (generatedData) return;
        if (showRegenerateMode) return;
        if (didSelfHealEntryRef.current) return;
        didSelfHealEntryRef.current = true;

        // Self-heal any stale route state so a new project always lands on the planning form.
        if (entryError) setEntryError('');
        if (entryStatus !== 'ready') setEntryStatus('ready');
        setShowRegenerateMode(true);
        navigate('/ideation', {
            replace: true,
            state: buildNewProjectRouteState(),
        });
    }, [entryError, entryStatus, generatedData, navigate, showRegenerateMode, urlProjectId]);

    useEffect(() => {
        if (showRegenerateMode || generatedData || urlProjectId) {
            didSelfHealEntryRef.current = false;
        }
    }, [generatedData, showRegenerateMode, urlProjectId]);

    const entryFallback = renderEntryFallback();
    const shouldShowBlueprint = !showRegenerateMode && Boolean(generatedData);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-slate-100 antialiased overflow-x-hidden selection:bg-primary/30">
            {!showRegenerateMode ? (
                <>
                    <div className="absolute top-0 left-1/2 w-full h-[600px] bg-primary/20 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-accent-pink/10 blur-[100px] rounded-full pointer-events-none"></div>
                </>
            ) : (
                <div className="absolute top-0 left-0 w-full h-[400px] bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 pointer-events-none"></div>
            )}

            <header className="relative z-30 flex flex-wrap items-center justify-between px-4 sm:px-6 pt-8 sm:pt-12 pb-6 gap-y-4">
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                    <button
                        onClick={handleBackClick}
                        className="size-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center active:scale-90 transition-transform shrink-0"
                    >
                        <span className="material-symbols-outlined text-white text-xl">arrow_back_ios_new</span>
                    </button>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">
                            {showRegenerateMode ? t.regenTitle : t.title}
                        </h1>
                        {!showRegenerateMode && (
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{t.subTitle}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto sm:justify-end overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                    <button
                        onClick={() => {
                            setUpgradeReason("");
                            setIsCoinModalOpen(true);
                        }}
                        className="flex shrink-0 items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <span className="text-sm">🧾</span>
                        <span className="text-[10px] sm:text-xs font-bold text-white tracking-widest">{getUsageLabel(language)}</span>
                    </button>
                    <div className="shrink-0">
                        <LanguageToggle />
                    </div>
                    {showRegenerateMode && (
                        <div className="size-8 sm:size-10 rounded-full border border-primary/30 overflow-hidden shrink-0 shadow-[0_0_10px_rgba(91,19,236,0.2)]">
                            <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA" />
                        </div>
                    )}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {entryFallback ? (
                    <motion.div
                        key="entry-fallback"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {entryFallback}
                    </motion.div>
                ) : shouldShowBlueprint ? (
                    <motion.div
                        key="blueprint-view"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="relative z-20 px-6 flex flex-col pb-6"
                    >
                        {isRestoring ? (
                            <div className="mx-auto mt-10 w-full max-w-4xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md animate-pulse">
                                <p className="text-[10px] uppercase tracking-[0.25em] text-primary">{language === 'KR' ? '편집 상태를 불러오는 중...' : 'Restoring workspace...'}</p>
                                <div className="mt-8 space-y-4">
                                    <div className="h-6 w-1/3 bg-white/10 rounded mx-auto" />
                                    <div className="h-4 w-1/2 bg-white/5 rounded mx-auto" />
                                    <div className="h-4 w-1/4 bg-white/5 rounded mx-auto" />
                                </div>
                            </div>
                        ) : (
                            <ChoreographyDraft
                                data={generatedData}
                                projectId={studioProjectId || generatedData?.projectId}
                                currentPlan={currentPlan}
                                policy={policy}
                                dancersCount={peopleCount}
                                onDataUpdate={(next) => setGeneratedData(next)}
                                onSelectWorkTitle={handleBlueprintTitleSelect}
                                onSaveArtworkImage={handleBlueprintArtworkSave}
                                onOpenUpgrade={(reason) => {
                                    const message = reason || "";
                                    if (UPGRADE_HINT_RE.test(message)) {
                                        setRuntimeNotice("");
                                        setUpgradeReason(message);
                                        setIsCoinModalOpen(true);
                                        return;
                                    }
                                    setIsCoinModalOpen(false);
                                    setRuntimeNotice(message || (language === 'KR' ? '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.' : 'We could not complete that request. Please try again.'));
                                }}
                            />
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="regenerate-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="relative z-20 px-6 flex flex-col pb-48"
                    >
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {/* ── 프로젝트명 (내부 작업용) ── */}
                            <div className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-xs text-slate-400">folder</span>
                                    {t.projectName}
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        type="text"
                                        placeholder={language === 'KR' ? "예: 2026 봄공연 작업물" : "Ex: Spring 2026 Project"}
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        className="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-sm font-medium outline-none focus:border-primary/50 text-white"
                                    />
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[18px]">folder_open</span>
                                </div>
                                <p className="text-[9px] text-slate-500/70">
                                    {language === 'KR' 
                                        ? '내 작업을 관리하기 위한 내부 이름입니다. 작품 제목과는 별도로 관리됩니다.' 
                                        : 'An internal name for organizing your work. This is NOT the work title.'}
                                </p>
                            </div>

                            {/* ── 작품 제목 (AI가 생성하는 실제 작품명) ── */}
                            <div className="col-span-2 bg-gradient-to-br from-primary/5 to-purple-500/5 backdrop-blur-xl border border-primary/20 p-4 rounded-xl flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] uppercase tracking-wider text-primary-light font-bold flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-xs text-primary">auto_awesome</span>
                                        {t.workTitle}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleSuggestTitles}
                                        disabled={isGeneratingTitles}
                                        className="flex items-center gap-1 bg-primary/20 hover:bg-primary/30 text-primary-light px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-colors disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                                        {isGeneratingTitles ? (language === 'KR' ? '생성 중...' : 'Generating...') : (language === 'KR' ? 'AI 제목 제안받기' : 'AI Suggest Titles')}
                                    </button>
                                </div>

                                {/* 선택된 작품 제목 표시 */}
                                {selectedWorkTitle ? (
                                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2.5 mt-1">
                                        <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                                        <span className="text-white font-bold text-sm flex-1">{selectedWorkTitle}</span>
                                        <button 
                                            type="button"
                                            onClick={() => setSelectedWorkTitle('')}
                                            className="text-white/40 hover:text-white/80 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">info</span>
                                        {t.noTitleYet}
                                    </p>
                                )}

                                {/* 제목 후보 목록 (8개 이상) */}
                                {titleCandidates.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1.5 mt-2">
                                        <p className="text-[9px] text-slate-500 font-medium mb-1">
                                            {language === 'KR' 
                                                ? `✨ AI가 제안한 작품 제목 후보 (${titleCandidates.length}개) — 탭하여 선택` 
                                                : `✨ AI-suggested work titles (${titleCandidates.length}) — tap to select`}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {titleCandidates.map((candidate, idx) => (
                                                <button
                                                    key={`${candidate}-${idx}`}
                                                    type="button"
                                                    onClick={() => setSelectedWorkTitle(candidate)}
                                                    className={`rounded-full border px-3 py-1.5 text-[10px] font-medium transition-all active:scale-95 ${
                                                        selectedWorkTitle === candidate
                                                            ? 'border-primary/60 bg-primary/25 text-white shadow-[0_0_12px_rgba(91,19,236,0.35)] ring-1 ring-primary/30'
                                                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'
                                                    }`}
                                                >
                                                    {candidate}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <p className="text-[8px] text-slate-500/60 mt-1">
                                    {t.workTitleHint}
                                </p>
                            </div>
                            <div className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{t.genre}</label>
                                <div className="relative">
                                    <select
                                        value={genre}
                                        onChange={(e) => setGenre(e.target.value)}
                                        className="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2 px-3 text-sm font-medium appearance-none outline-none focus:border-primary/50 text-white"
                                    >
                                        <option value="" disabled hidden>{language === 'KR' ? "장르를 선택하세요" : "Select a genre"}</option>
                                        <option value="Contemporary Dance">{language === 'KR' ? "컨템포러리 댄스 (Contemporary)" : "Contemporary Dance"}</option>
                                        <option value="Modern Dance">{language === 'KR' ? "현대무용 (Modern Dance)" : "Modern Dance"}</option>
                                        <option value="Lyrical Dance">{language === 'KR' ? "리리컬 댄스 (Lyrical Dance)" : "Lyrical Dance"}</option>
                                        <option value="Ballet">{language === 'KR' ? "발레 (Ballet)" : "Ballet"}</option>
                                        <option value="Experimental Contemporary">{language === 'KR' ? "실험적 현대무용 (Experimental)" : "Experimental Contemporary"}</option>
                                        <option value="Contemporary Dance Competition" disabled={!policy?.canUseCompetitionMode}>
                                            {language === 'KR'
                                                ? (policy?.canUseCompetitionMode ? "🏆 현대무용 콩쿠르 (Competition)" : "🔒 현대무용 콩쿠르 (Studio)")
                                                : (policy?.canUseCompetitionMode ? "🏆 Contemporary Dance Competition" : "🔒 Competition (Studio)")}
                                        </option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
                                </div>
                                {isCompetition && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 flex items-center gap-2"
                                    >
                                        <span className="text-amber-400 text-sm">🏆</span>
                                        <div>
                                            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{t.competitionBadge}</p>
                                            <p className="text-[9px] text-amber-400/70 mt-0.5">{t.competitionHint}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{t.peopleCount}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder={language === 'KR' ? "예: 5" : "Ex: 5"}
                                        value={peopleCount}
                                        onChange={(e) => setPeopleCount(e.target.value)}
                                        className="w-full bg-background-dark/50 border border-white/10 rounded-lg py-2 px-3 pr-10 text-sm font-medium outline-none focus:border-primary/50 text-white"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 pointer-events-none">
                                        {language === 'EN' ? 'people' : '명'}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{t.duration}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={isCompetition ? (language === 'KR' ? "02:00 ~ 04:00" : "02:00 ~ 04:00") : (language === 'KR' ? "예: 03:30" : "Ex: 03:30")}
                                        value={duration}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 4) val = val.slice(0, 4);
                                            if (val.length >= 3) {
                                                val = `${val.slice(0, 2)}:${val.slice(2)}`;
                                            }
                                            setDuration(val);
                                        }}
                                        className={`w-full bg-background-dark/50 border rounded-lg py-2 px-3 pl-8 text-sm font-medium outline-none text-white ${isCompetition ? 'border-amber-500/30 focus:border-amber-500/60' : 'border-white/10 focus:border-primary/50'}`}
                                    />
                                    <span className={`material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${isCompetition ? 'text-amber-400' : 'text-primary'}`}>timer</span>
                                </div>
                                {isCompetition && (
                                    <p className="text-[9px] text-amber-400/70 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[10px]">info</span>
                                        {t.competitionDurationHint}
                                    </p>
                                )}
                            </div>
                            <div className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex flex-col gap-3">
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{t.moodKeywords}</label>
                                <div className="flex flex-wrap gap-2">
                                    {moodKeywords.map((kw, idx) => (
                                        <span key={idx} className="flex items-center gap-1.5 text-[10px] bg-primary/20 border border-primary/30 px-2 py-1 rounded-full text-white font-medium">
                                            {kw}
                                            <button onClick={() => removeKeyword(kw)} className="hover:text-accent-pink transition-colors">
                                                <span className="material-symbols-outlined text-[10px]">close</span>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="#Tag..."
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                if (e.nativeEvent.isComposing) return;
                                                e.preventDefault();
                                                handleAddKeyword();
                                            }
                                        }}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] outline-none focus:border-primary/50"
                                    />
                                    <button
                                        onClick={handleAddKeyword}
                                        className="bg-primary/20 border border-primary/30 px-3 py-2 rounded-lg text-primary hover:bg-primary/30 active:scale-95 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 제목 톤 선택 */}
                        <div className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex flex-col gap-3">
                            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-xs text-primary">palette</span>
                                {language === 'KR' ? '제목 톤 (스타일)' : 'Title Tone'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: '', label: language === 'KR' ? '자동 선택' : 'Auto', icon: '🎲' },
                                    { value: 'poetic', label: language === 'KR' ? '시적' : 'Poetic', icon: '🌸' },
                                    { value: 'modern', label: language === 'KR' ? '현대적' : 'Modern', icon: '🔷' },
                                    { value: 'cold', label: language === 'KR' ? '차가운' : 'Cold', icon: '🧊' },
                                    { value: 'experimental', label: language === 'KR' ? '실험적' : 'Experimental', icon: '🧬' },
                                    { value: 'emotional', label: language === 'KR' ? '감정적' : 'Emotional', icon: '💧' },
                                    { value: 'abstractTone', label: language === 'KR' ? '추상적' : 'Abstract', icon: '◎' },
                                    { value: 'direct', label: language === 'KR' ? '직설적' : 'Direct', icon: '🔪' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setTitleTone(opt.value)}
                                        className={`text-[10px] px-3 py-1.5 rounded-full border font-medium transition-all active:scale-95
                                            ${titleTone === opt.value
                                                ? 'bg-primary/30 border-primary/50 text-white shadow-[0_0_8px_rgba(91,19,236,0.3)]'
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {opt.icon} {opt.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[9px] text-slate-500/70">
                                {language === 'KR'
                                    ? '선택한 톤에 따라 제목 생성 구조가 달라집니다. 매번 다른 톤을 선택하면 더 다양한 제목이 나옵니다.'
                                    : 'Title structure varies by tone. Switching tones produces more diverse titles.'}
                            </p>
                            {/* AI title generation button moved up to projectName input */}
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4 mt-2">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                                    {t.choreographyTimeline}
                                </h2>
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{t.aiGenerated}</span>
                            </div>

                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 min-h-[220px] relative overflow-hidden">
                                <div className="flex gap-1.5 h-20 mb-4 relative z-10 shrink-0 transition-all duration-700">
                                    <div style={{ flex: dynamicStyles.flex1 }} className="bg-primary/20 border border-primary/30 rounded-lg flex flex-col items-center justify-center px-1 py-2 text-center overflow-hidden transition-all duration-700">
                                        <span className="text-[7px] text-primary/80 font-bold uppercase truncate w-full">{t.intro}</span>
                                        <span className="material-symbols-outlined text-sm text-primary">motion_sensor_active</span>
                                    </div>
                                    <div style={{ flex: dynamicStyles.flex2 }} className="bg-primary/40 border border-primary/50 rounded-lg flex flex-col items-center justify-center py-2 px-1 relative overflow-hidden text-center transition-all duration-700">
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
                                        <span className="text-[7px] text-white font-bold uppercase relative z-10 truncate w-full break-keep">{t.buildup}</span>
                                        <span className="material-symbols-outlined text-sm text-white relative z-10">speed</span>
                                    </div>
                                    <div style={{ flex: dynamicStyles.flex3 }} className="bg-primary border border-primary/60 rounded-lg flex flex-col items-center justify-center py-2 px-1 shadow-lg shadow-primary/20 text-center overflow-hidden transition-all duration-700">
                                        <div className="flex flex-col items-center -mt-1">
                                            <span className="text-[7px] text-white font-bold uppercase truncate w-full break-keep">{t.climax}</span>
                                            <span className="text-[5px] text-white/60 font-medium tracking-widest">(PEAK)</span>
                                        </div>
                                        <span className="material-symbols-outlined text-sm text-white mt-0.5">bolt</span>
                                    </div>
                                    <div style={{ flex: 1.5 }} className="bg-primary/20 border border-primary/30 rounded-lg flex flex-col items-center justify-center px-1 py-2 text-center overflow-hidden transition-all duration-700">
                                        <span className="text-[7px] text-primary/80 font-bold uppercase truncate w-full break-keep">{t.outro}</span>
                                        <span className="material-symbols-outlined text-sm text-primary">waves</span>
                                    </div>
                                </div>
                                <div className="absolute inset-x-4 bottom-8 h-32 pointer-events-none">
                                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                                        <path
                                            d={`M0 35 Q10 35, 15 30 T${15 + (dynamicStyles.flex1 * 5)} 25 T${30 + (dynamicStyles.flex2 * 4)} 20 T${45 + (dynamicStyles.flex3 * 4)} 5 T75 25 T90 30 T100 35`}
                                            fill="none"
                                            stroke="rgba(91, 19, 236, 1)"
                                            strokeWidth="1.5"
                                            style={{
                                                strokeDasharray: 4,
                                                filter: 'drop-shadow(0 0 8px rgba(91, 19, 236, 0.6))',
                                                transition: 'd 0.7s ease'
                                            }}
                                        ></path>
                                        <circle cx={45 + (dynamicStyles.flex3 * 4)} cy="5" fill="#fff" r="2" style={{ transition: 'cx 0.7s ease' }}></circle>
                                    </svg>
                                </div>
                                <div className="flex justify-between mt-12 px-1">
                                    <span className="text-[9px] text-slate-500">00:00</span>
                                    <span className="text-[9px] text-primary font-bold">{duration ? `~ ${duration}` : 'Live'}</span>
                                    <span className="text-[9px] text-slate-500">{duration || "00:00"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">{t.stageCostume}</h2>
                                <button className="text-primary text-[10px] font-bold uppercase">{t.regenerateAgain}</button>
                            </div>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                                <div className="min-w-[200px] rounded-xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                                    <div className="h-32 relative">
                                        <img alt="Stage Lighting" className="w-full h-full object-cover transition-all duration-1000" src="/images/stage_neon_lighting.png" style={{ filter: dynamicStyles.hueRotate }} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                                        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center bg-black/20">
                                            <div className="transform -rotate-12 opacity-40 mix-blend-overlay">
                                                <span className="text-white font-black text-2xl tracking-[0.3em] uppercase drop-shadow-lg">
                                                    SEEDBAR
                                                </span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 left-3 pr-2 z-20">
                                            <span className="text-[10px] font-bold uppercase text-white/60">{t.stageLighting}</span>
                                            <p className="text-xs font-bold text-white leading-tight break-keep">{dynamicConcept.stage}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="min-w-[200px] rounded-xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                                    <div className="h-32 relative">
                                        <img alt="Costume Concepts" className="w-full h-full object-cover transition-all duration-1000" src="/images/contemporary_costume_concept.png" style={{ filter: dynamicStyles.hueRotate }} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                                        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center bg-black/20">
                                            <div className="transform -rotate-12 opacity-40 mix-blend-overlay">
                                                <span className="text-white font-black text-2xl tracking-[0.3em] uppercase drop-shadow-lg">
                                                    SEEDBAR
                                                </span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 left-3 pr-2 z-20">
                                            <span className="text-[10px] font-bold uppercase text-white/60">{t.costumeConcept}</span>
                                            <p className="text-xs font-bold text-white leading-tight break-keep">{dynamicConcept.costume}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            {showRegenerateMode && (
                <>
                    <div className="fixed bottom-24 w-full z-40 px-6 pointer-events-none">
                        <div className="relative group pointer-events-auto">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                {language === 'KR' ? '월 생성 한도는 서버에서 관리됩니다.' : 'Monthly creation limits are enforced on server.'}
                            </div>
                            <button
                                onClick={handleGenerateProduction}
                                disabled={isGenerating}
                                className="w-full bg-primary text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(91,19,236,0.5)] active:scale-95 transition-all border border-primary/50 backdrop-blur-md disabled:opacity-50"
                            >
                                <span>{isGenerating ? t.generating : t.generateDraft}</span>
                                <span className={`material-symbols-outlined ${isGenerating ? 'animate-spin' : ''}`}>
                                    {isGenerating ? 'progress_activity' : 'scrollable_header'}
                                </span>
                            </button>
                        </div>
                    </div>
                    <BottomNav />
                </>
            )}

            {isGenerating && (
                <div className="fixed inset-0 z-[100] bg-background-dark/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6"></div>
                    <p className="text-xl font-display font-bold tracking-widest animate-pulse">{t.generating}</p>
                    <div className="mt-5 w-[min(88vw,440px)] rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-slate-400">
                            <span>{language === 'KR' ? '진행 단계' : 'Progress Steps'}</span>
                            <span>{generationStepIndex + 1} / {generationSteps.length}</span>
                        </div>
                        <div className="space-y-2">
                            {generationSteps.map((step, index) => (
                                <div
                                    key={step}
                                    className={`rounded-xl border px-3 py-3 text-sm transition-all ${
                                        index === generationStepIndex
                                            ? 'border-primary/40 bg-primary/15 text-white'
                                            : index < generationStepIndex
                                                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                                                : 'border-white/10 bg-black/20 text-slate-500'
                                    }`}
                                >
                                    {index + 1}. {step}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <CoinPricingModal
                isOpen={isCoinModalOpen}
                onClose={() => setIsCoinModalOpen(false)}
                currentPlan={currentPlan}
                onSelectPlan={async (nextPlan) => {
                    await setPlan(nextPlan);
                    await refreshCapabilities();
                }}
            />
            {isCoinModalOpen && upgradeReason ? (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[101] max-w-[90vw] rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs text-amber-200 backdrop-blur">
                    {upgradeReason}
                </div>
            ) : null}
            {runtimeNotice ? (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[101] max-w-[90vw] rounded-lg border border-white/20 bg-black/60 px-4 py-2 text-xs text-slate-100 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <span>{runtimeNotice}</span>
                        <button
                            type="button"
                            onClick={() => setRuntimeNotice('')}
                            className="text-slate-300 transition-colors hover:text-white"
                        >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    </div>
                </div>
            ) : null}
            {generatedData && generatedData.quotaChecked === false ? (
                <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[101] max-w-[90vw] rounded-lg border border-slate-400/30 bg-slate-500/10 px-4 py-2 text-xs text-slate-200 backdrop-blur">
                    {language === 'KR'
                        ? '테스트 모드: 서버 사용량 체크가 일시적으로 비활성화되었습니다.'
                        : 'Test mode: server usage check is temporarily unavailable.'}
                </div>
            ) : null}

            {isUnsavedModalOpen && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0D0A1C] border border-white/20 p-6 rounded-2xl w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex bg-rose-500/20 w-12 h-12 rounded-full items-center justify-center mb-1">
                            <span className="material-symbols-outlined text-rose-500">warning</span>
                        </div>
                        <h3 className="text-white text-lg font-bold tracking-tight">
                            {language === 'KR' ? '저장되지 않은 변경사항' : 'Unsaved Changes'}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                            {language === 'KR' 
                                ? '변경 사항이 저장되지 않을 수 있습니다.\n창을 닫으시겠습니까?' 
                                : 'Your changes may not be saved.\nAre you sure you want to leave?'}
                        </p>
                        <div className="flex flex-col gap-2 mt-4">
                            <button onClick={handleSaveAndLeave} className="w-full bg-primary/20 text-primary border border-primary/50 py-3 rounded-xl text-sm font-bold hover:bg-primary/30 transition-colors">
                                {language === 'KR' ? '저장 후 나가기' : 'Save and Leave'}
                            </button>
                            <button onClick={() => {
                                setIsUnsavedModalOpen(false);
                                if (trapStatePushed.current) window.history.back();
                                setTimeout(() => performBackNavigation(), 10);
                            }} className="w-full bg-rose-500/10 text-rose-400 border border-rose-500/30 py-3 rounded-xl text-sm font-bold hover:bg-rose-500/20 transition-colors">
                                {language === 'KR' ? '계속 나가기' : 'Leave without saving'}
                            </button>
                            <button onClick={() => setIsUnsavedModalOpen(false)} className="w-full bg-white/5 text-slate-300 border border-white/10 py-3 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
                                {language === 'KR' ? '취소' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default Ideation;
