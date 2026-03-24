import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import LanguageToggle from '../components/LanguageToggle';
import useChoreographyStudioStore from '../store/useChoreographyStudioStore';
import { ARTWORK_FALLBACK_URL } from '../lib/artworkMedia.js';
import { reportRuntimeDiagnostic } from '../services/runtimeDiagnostics.js';
import {
    buildStageVisualization,
    getSavedStageVisualization,
    getStageAssetMeta,
    buildReferencePhotos,
} from '../services/stageVisual3d';

const legacyI18n = {
    EN: {
        title: '2D Path Planner',
        project: 'Project: Cyber Flow',
        export: 'Export to Presentation',
        exportSub: 'Optimized for PPT & Keynote (.pptx)',
        timelineTitle: 'Emotion Curve & Sequence',
        blocks: { intro: 'Intro', 'build-up': 'Build-up', climax: 'Climax', outro: 'Outro' },
        addBlock: 'Drag Labanotation Blocks here',
        aiBtn: 'Regenerate Sequence'
    },
    KR: {
        title: '2D AI 동선 설계',
        project: '프로젝트: 사이버 플로우',
        export: '실무용 문서(PPT) 내보내기',
        exportSub: 'PPT & 기획서 포맷으로 자동 변환',
        timelineTitle: '감정 곡선 & 시퀀스 타임라인',
        blocks: { intro: '도입부', 'build-up': '고조', climax: '절정', outro: '해소' },
        addBlock: '라반 동작 기호를 여기에 드래그 하세요',
        aiBtn: 'AI 모션 재구축'
    }
};

const assetAccent = {
    lighting: {
        ring: 'rgba(94, 234, 212, 0.35)',
        glow: '#5EEAD4',
        chip: 'text-teal-300 border-teal-400/30 bg-teal-400/10',
    },
    props: {
        ring: 'rgba(139, 92, 246, 0.35)',
        glow: '#A78BFA',
        chip: 'text-violet-300 border-violet-400/30 bg-violet-400/10',
    },
    costume: {
        ring: 'rgba(244, 114, 182, 0.35)',
        glow: '#F472B6',
        chip: 'text-pink-300 border-pink-400/30 bg-pink-400/10',
    },
};

const REFERENCE_FAILURE_STORAGE_KEY = 'seedbar:reference-image-failures:v1';
const REFERENCE_FAILURE_LIMIT = 2;

function canUseStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readFailureMap() {
    if (!canUseStorage()) return {};
    try {
        const raw = window.localStorage.getItem(REFERENCE_FAILURE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function writeFailureMap(map) {
    if (!canUseStorage()) return;
    try {
        window.localStorage.setItem(REFERENCE_FAILURE_STORAGE_KEY, JSON.stringify(map));
    } catch {
        // ignore localStorage failures
    }
}

function getFailureCount(url) {
    if (!url) return 0;
    const map = readFailureMap();
    return Number(map[url]) || 0;
}

function clearFailureCounts(urls = []) {
    if (!canUseStorage()) return;
    const map = readFailureMap();
    let touched = false;

    urls.forEach((url) => {
        if (url && map[url]) {
            delete map[url];
            touched = true;
        }
    });

    if (touched) writeFailureMap(map);
}

function recordReferenceFailure(photo, url) {
    if (!url) return;
    const map = readFailureMap();
    map[url] = (Number(map[url]) || 0) + 1;
    writeFailureMap(map);

    reportRuntimeDiagnostic({
        category: 'visual_reference_image_error',
        severity: 'warn',
        message: `Visual reference image failed to load: ${url}`,
        meta: {
            photoId: photo?.id || '',
            query: photo?.query || '',
            assetType: photo?.assetType || '',
            sourceUrl: photo?.sourceUrl || '',
        },
    }, { useBeacon: true });
}

function isRenderableImageUrl(url = '') {
    const value = String(url || '').trim();
    if (!value) return false;
    if (value.startsWith('data:image/')) return true;
    if (value.startsWith('/images/') || value.startsWith('/media/')) return true;

    try {
        const parsed = new URL(value, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        const path = parsed.pathname.toLowerCase();
        const host = parsed.hostname.toLowerCase();

        if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.webp') || path.endsWith('.gif') || path.endsWith('.svg')) {
            return true;
        }

        return [
            'images.unsplash.com',
            'images.pexels.com',
            'i.ytimg.com',
            'upload.wikimedia.org',
            'localhost',
            '127.0.0.1',
        ].includes(host);
    } catch {
        return false;
    }
}

function uniqueUrls(values = []) {
    return [...new Set(values.filter(Boolean))];
}

function buildPhotoCandidates(photo, { includeFailed = false } = {}) {
    const candidates = uniqueUrls([
        photo?.thumbnailUrl,
        photo?.imageUrl,
        photo?.detailImageUrl,
        ...(Array.isArray(photo?.fallbackImageUrls) ? photo.fallbackImageUrls : []),
        photo?.fallbackCoverUrl,
        ARTWORK_FALLBACK_URL,
    ]).filter(isRenderableImageUrl);

    return includeFailed
        ? candidates
        : candidates.filter((url) => url.startsWith('data:image/') || getFailureCount(url) < REFERENCE_FAILURE_LIMIT);
}

function localized(value, language) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return language === 'KR' ? value.kr || value.en || '' : value.en || value.kr || '';
}

function normalizeProjectContent(payload) {
    if (!payload) return null;
    return payload?.project?.currentContent || payload?.currentContent || payload || null;
}

function ProjectAnchorList({ anchors = [], language = 'EN' }) {
    return (
        <div className="grid grid-cols-1 gap-2">
            {anchors.map((anchor, index) => (
                <div key={`${localized(anchor, language)}_${index}`} className="border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300">
                    {localized(anchor, language)}
                </div>
            ))}
        </div>
    );
}

function PaletteSwatches({ palette = [] }) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {palette.map((entry) => (
                <div key={entry.hex} className="border border-white/10 bg-black/20 p-3">
                    <div className="h-16 w-full rounded-sm border border-white/10" style={{ background: entry.hex }} />
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">{entry.name}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{entry.hex}</p>
                </div>
            ))}
        </div>
    );
}

function StageVisualPreview({ visualization, assetType, language = 'EN' }) {
    const palette = visualization?.palette || [];
    const bgA = palette[0]?.hex || '#202233';
    const bgB = palette[1]?.hex || '#0d1120';
    const glow = palette[2]?.hex || '#ffffff';
    const beamOpacityScale = assetType === 'lighting' ? 1 : 0.62;
    const propOpacity = assetType === 'props' ? 0.96 : 0.55;
    const costumeOpacity = assetType === 'costume' ? 0.98 : 0.66;

    return (
        <div className="relative min-h-[460px] overflow-hidden border border-white/10 bg-[#0a0a12]">
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(circle at 50% 10%, ${glow}22 0%, transparent 30%), linear-gradient(180deg, ${bgA}55 0%, ${bgB} 62%, #05050a 100%)`,
                }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:22px_22px] opacity-20" />

            {visualization?.lightBeams?.map((beam) => (
                <div
                    key={beam.id}
                    className="absolute top-0 h-[72%] blur-2xl mix-blend-screen"
                    style={{
                        left: `${beam.x}%`,
                        width: `${beam.width}%`,
                        transform: `translateX(-50%) skewX(${beam.skew}deg)`,
                        opacity: beam.opacity * beamOpacityScale,
                        clipPath: 'polygon(36% 0, 64% 0, 100% 100%, 0 100%)',
                        background: `linear-gradient(180deg, ${beam.color}AA 0%, transparent 85%)`,
                    }}
                />
            ))}

            <div className="absolute inset-x-[8%] bottom-[18%] h-[24%] rounded-[50%] border border-white/10 bg-white/5 blur-[1px]" />
            <div className="absolute inset-x-[4%] bottom-[7%] h-[18%] rounded-[100%] bg-black/50 blur-xl" />
            <div className="absolute inset-x-[12%] bottom-[12%] h-[18%] [transform:perspective(700px)_rotateX(75deg)] border border-white/10 bg-gradient-to-b from-white/5 to-black/50" />

            {visualization?.propLayout?.map((prop) => (
                <div
                    key={prop.id}
                    className="absolute border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                    style={{
                        left: `${prop.x}%`,
                        top: `${prop.y}%`,
                        width: `${prop.width}%`,
                        height: `${prop.height}%`,
                        transform: `rotate(${prop.rotation}deg)`,
                        background: `linear-gradient(160deg, ${prop.color}D0 0%, #111827 100%)`,
                        opacity: propOpacity,
                        boxShadow: `0 18px 32px rgba(0,0,0,0.35), 0 0 26px ${prop.color}22`,
                    }}
                />
            ))}

            <div className="absolute left-1/2 bottom-[18%] h-[48%] w-[18%] -translate-x-1/2">
                <div
                    className="absolute left-1/2 top-[4%] h-[16%] w-[24%] -translate-x-1/2 rounded-full border border-white/10 bg-white/10 backdrop-blur-sm"
                    style={{ boxShadow: `0 0 28px ${glow}33`, opacity: costumeOpacity }}
                />
                {visualization?.silhouetteLayers?.map((layer) => (
                    <div
                        key={layer.id}
                        className="absolute left-1/2 bottom-0 -translate-x-1/2 border border-white/10 backdrop-blur-[1px]"
                        style={{
                            width: `${layer.width}%`,
                            height: `${layer.height}%`,
                            transform: `translateX(calc(-50% + ${layer.offsetX}px)) translateY(${layer.offsetY}px) rotate(${layer.rotation}deg)`,
                            background: `linear-gradient(180deg, ${layer.color}DD 0%, #111827 100%)`,
                            borderRadius: '48% 52% 32% 34% / 28% 28% 72% 72%',
                            opacity: layer.opacity * costumeOpacity,
                            boxShadow: `0 0 34px ${layer.color}22`,
                        }}
                    />
                ))}
            </div>

            <div className="absolute left-5 top-5 border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">{language === 'KR' ? '실제 공연 참고 시안' : 'Production Reference Frame'}</p>
                <p className="mt-1 text-sm font-semibold text-white">{localized(visualization?.title, language)}</p>
            </div>

            <div className="absolute inset-x-5 bottom-5 border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">{localized(visualization?.focusTitle, language)}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">{localized(visualization?.summary, language)}</p>
            </div>
        </div>
    );
}

function ReferencePhotoGrid({ photos = [], language = 'EN' }) {
    const isKr = language === 'KR';
    if (!photos.length) {
        return (
            <div className="border border-dashed border-white/10 bg-black/20 px-4 py-6">
                <div className="h-28 animate-pulse bg-white/[0.04]" />
                <p className="mt-4 text-xs text-slate-400">
                    {isKr ? '참고 사진을 정리하는 중입니다. 잠시 후 다시 불러오세요.' : 'Preparing reference photos. Please try again in a moment.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                    {localized(photos[0]?.categoryLabel, language) || (isKr ? '실제 참고 사진' : 'Reference Photos')}
                </p>
                <span className="text-[9px] text-white/30 uppercase tracking-widest">{localized(photos[0]?.sourceLabel || photos[0]?.source, language) || 'Visual Reference'}</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {photos.map((photo) => (
                    <ReferencePhotoCard key={photo.id} photo={photo} language={language} />
                ))}
            </div>
        </div>
    );
}

function ReferencePhotoCard({ photo, language = 'EN' }) {
    const isKr = language === 'KR';
    const [retryNonce, setRetryNonce] = React.useState(0);
    const [candidateIndex, setCandidateIndex] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);

    const displayCandidates = React.useMemo(
        () => buildPhotoCandidates(photo, { includeFailed: retryNonce > 0 }),
        [photo, retryNonce],
    );

    const activeSrc = displayCandidates[candidateIndex] || photo?.fallbackCoverUrl || ARTWORK_FALLBACK_URL;
    const isFallbackActive = activeSrc === photo?.fallbackCoverUrl || activeSrc === ARTWORK_FALLBACK_URL;
    const detailHref = isRenderableImageUrl(photo?.detailImageUrl) ? photo.detailImageUrl : (photo?.sourceUrl || photo?.searchUrl || '#');
    const retryTargets = React.useMemo(
        () => uniqueUrls([
            photo?.thumbnailUrl,
            photo?.imageUrl,
            photo?.detailImageUrl,
            ...(Array.isArray(photo?.fallbackImageUrls) ? photo.fallbackImageUrls : []),
        ]),
        [photo],
    );

    React.useEffect(() => {
        setCandidateIndex(0);
        setIsLoading(true);
    }, [photo?.id, retryNonce]);

    const handleError = React.useCallback(() => {
        recordReferenceFailure(photo, activeSrc);
        if (candidateIndex < displayCandidates.length - 1) {
            setCandidateIndex((current) => current + 1);
            setIsLoading(true);
            return;
        }
        setIsLoading(false);
    }, [activeSrc, candidateIndex, displayCandidates.length, photo]);

    const handleRetry = React.useCallback(() => {
        clearFailureCounts(retryTargets);
        setRetryNonce((current) => current + 1);
    }, [retryTargets]);

    return (
        <div className="group overflow-hidden border border-white/10 bg-black/30 transition-all hover:border-white/25">
            <div className="relative aspect-[4/3] overflow-hidden bg-black/50">
                {isLoading && (
                    <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent">
                        <div className="absolute inset-x-4 top-4 h-3 rounded-full bg-white/[0.08]" />
                        <div className="absolute inset-x-4 top-10 h-3 w-2/3 rounded-full bg-white/[0.06]" />
                        <div className="absolute inset-x-4 bottom-4 h-16 rounded-2xl bg-black/20" />
                    </div>
                )}

                <img
                    key={`${photo.id}_${retryNonce}_${candidateIndex}`}
                    src={activeSrc}
                    alt={photo.query}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{
                        objectPosition: candidateIndex === 0
                            ? (photo?.thumbnailObjectPosition || '50% 50%')
                            : (photo?.detailObjectPosition || photo?.thumbnailObjectPosition || '50% 50%'),
                    }}
                    onLoad={() => setIsLoading(false)}
                    onError={handleError}
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/60">{photo.query}</p>
                        {photo?.headline && (
                            <p className="mt-1 text-xs font-medium text-white">{localized(photo.headline, language)}</p>
                        )}
                    </div>
                    {isFallbackActive && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-amber-200">
                            {isKr ? '대체 이미지' : 'Fallback'}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3 px-3 py-3">
                <p className="text-xs leading-relaxed text-slate-300">{localized(photo.description, language)}</p>
                {photo?.note && (
                    <p className="text-[11px] leading-relaxed text-slate-400">{localized(photo.note, language)}</p>
                )}

                {isFallbackActive && (
                    <div className="border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[11px] text-amber-100">
                        <p>{isKr ? '외부 참고 사진이 지연되거나 실패해 기본 커버 이미지로 대체했습니다.' : 'The primary reference photo failed, so a stable fallback cover is shown instead.'}</p>
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-amber-200 transition-colors hover:text-white"
                        >
                            <span className="material-symbols-outlined text-[14px]">refresh</span>
                            {isKr ? '다시 불러오기' : 'Reload'}
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest">
                    {photo?.sourceUrl && (
                        <a
                            href={photo.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-teal-400 transition-colors hover:text-teal-300"
                        >
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            {isKr ? '출처 보기' : 'Source'}
                        </a>
                    )}
                    {detailHref && detailHref !== '#' && (
                        <a
                            href={detailHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-violet-400 transition-colors hover:text-violet-300"
                        >
                            <span className="material-symbols-outlined text-[14px]">image</span>
                            {isKr ? '상세 보기' : 'Full View'}
                        </a>
                    )}
                    {photo?.searchUrl && (
                        <a
                            href={photo.searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-white/50 transition-colors hover:text-white/80"
                        >
                            <span className="material-symbols-outlined text-[14px]">travel_explore</span>
                            {isKr ? '더 찾기' : 'More'}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

function StageVisualizationEditor() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const language = useStore((state) => state.language);
    const isKr = language === 'KR';
    const { fetchProject, updateProject, setProjectId, temporaryDraft } = useChoreographyStudioStore();

    const assetType = location.state?.assetType || searchParams.get('asset') || 'lighting';
    const projectId = location.state?.projectId || searchParams.get('projectId') || null;
    const initialContent = location.state?.hasTemporaryContext ? temporaryDraft : (location.state?.projectContent || null);

    const [projectContent, setProjectContent] = useState(initialContent);
    const [workingVisualization, setWorkingVisualization] = useState(() => {
        if (!initialContent) return null;
        return getSavedStageVisualization(initialContent, assetType)
            || buildStageVisualization({ assetType, projectContent: initialContent, revision: 0 });
    });
    const [isHydrating, setIsHydrating] = useState(Boolean(projectId) && !initialContent);
    const [isRewriting, setIsRewriting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const assetMeta = useMemo(() => getStageAssetMeta(assetType), [assetType]);
    const accent = assetAccent[assetType] || assetAccent.lighting;
    const savedVisualization = getSavedStageVisualization(projectContent || {}, assetType);
    const projectTitle = localized(projectContent?.pamphlet?.coverTitle || projectContent?.titles?.scientific, language) || 'Seedbar Project';
    const preparedVisualization = useMemo(() => {
        if (!workingVisualization) return null;
        return {
            ...workingVisualization,
            referencePhotos: projectContent
                ? buildReferencePhotos({
                    assetType,
                    projectContent,
                    revision: workingVisualization?.revision || 0,
                })
                : (workingVisualization?.referencePhotos || []),
        };
    }, [assetType, projectContent, workingVisualization]);

    // Scroll to top on mount (prevents inheriting parent scroll position)
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!projectId) return;
        setProjectId(projectId);
    }, [projectId, setProjectId]);

    useEffect(() => {
        let cancelled = false;
        if (!projectId) return undefined;

        setIsHydrating(!initialContent);
        fetchProject(projectId)
            .then((payload) => {
                if (cancelled) return;
                const nextContent = normalizeProjectContent(payload);
                if (nextContent) {
                    setProjectContent(nextContent);
                }
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err?.message || (isKr ? '프로젝트를 불러오지 못했습니다.' : 'Failed to load project.'));
            })
            .finally(() => {
                if (!cancelled) setIsHydrating(false);
            });

        return () => {
            cancelled = true;
        };
    }, [fetchProject, initialContent, isKr, projectId]);

    useEffect(() => {
        if (!projectContent) return;
        const nextSaved = getSavedStageVisualization(projectContent, assetType);
        setWorkingVisualization(nextSaved || buildStageVisualization({ assetType, projectContent, revision: 0 }));
    }, [assetType, projectContent]);

    const handleRewrite = () => {
        if (!projectContent) return;
        setIsRewriting(true);
        setError('');
        window.setTimeout(() => {
            const nextRevision = (workingVisualization?.revision || 0) + 1;
            setWorkingVisualization(buildStageVisualization({
                assetType,
                projectContent,
                revision: nextRevision,
            }));
            setIsRewriting(false);
        }, 260);
    };

    const handleSave = async () => {
        if (!projectContent || !preparedVisualization) {
            setError(isKr ? '저장할 비주얼 컨셉 데이터가 아직 준비되지 않았습니다.' : 'The visual concept is not ready to save yet.');
            return;
        }

        if (!projectId) {
            setError(isKr ? '프로젝트 ID가 없어 저장할 수 없습니다.' : 'Project ID is missing, so this concept cannot be saved.');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const savedAt = new Date().toISOString();
            const nextContent = {
                ...projectContent,
                visualizations3d: {
                    ...(projectContent.visualizations3d || {}),
                    [assetType]: {
                        ...preparedVisualization,
                        savedAt,
                    },
                },
                projectStatus: projectContent?.projectStatus === 'final' ? 'final' : 'in_progress',
                lastEdited: savedAt,
            };

            await updateProject({
                currentContent: nextContent,
                teamSize: nextContent?.teamSize || nextContent?.seedbarInput?.teamSize || 1,
            });

            navigate(`/ideation?projectId=${projectId}`, {
                replace: true,
                state: {
                    mode: 'draft',
                    saved3dAsset: assetType,
                    saved3dAt: savedAt,
                },
            });
        } catch (err) {
            setError(err?.message || (isKr ? '저장 중 문제가 발생했습니다.' : 'Failed to save the visualization.'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!projectContent && !isHydrating) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-dark px-6 text-center text-slate-300">
                <div className="max-w-lg border border-white/10 bg-white/5 p-8">
                    <p className="text-sm uppercase tracking-[0.25em] text-white/50">{isKr ? '2D 비주얼 스튜디오' : '2D Visual Studio'}</p>
                    <h1 className="mt-4 text-2xl font-semibold text-white">{isKr ? '프로젝트 데이터를 찾지 못했습니다.' : 'We could not find the project data.'}</h1>
                    <p className="mt-4 text-sm leading-relaxed text-slate-400">
                        {isKr
                            ? '안무설계도 화면에서 다시 조명, 소품, 의상 카드의 버튼을 눌러 들어오면 저장 가능한 비주얼 편집기로 연결됩니다.'
                            : 'Open this page again from the lighting, props, or costume card inside the choreography studio so the editor has the right project context.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-6 border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
                    >
                        {isKr ? '이전 화면으로' : 'Go Back'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-slate-100">
            <div className="mx-auto flex max-w-[1500px] flex-col px-4 pb-10 pt-8 md:px-8">
                <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
                    <div className="flex items-start gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="mt-1 flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
                        >
                            <span className="material-symbols-outlined text-xl text-white">arrow_back_ios_new</span>
                        </button>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">{isKr ? '안무설계도 기반 2D 비주얼 스튜디오' : '2D Visual Studio from Choreography Blueprint'}</p>
                            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{projectTitle}</h1>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className={`border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${accent.chip}`}>
                                    {localized(assetMeta.label, language)}
                                </span>
                                <span className="border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60">
                                    {savedVisualization
                                        ? (isKr ? '저장된 버전 존재' : 'Saved version exists')
                                        : (isKr ? '새 2D 컨셉' : 'New visual concept')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <LanguageToggle />
                        <button
                            type="button"
                            onClick={handleRewrite}
                            disabled={isHydrating || isRewriting || !projectContent}
                            className="border border-white/15 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isRewriting ? (isKr ? '다른 버전 생성 중...' : 'Rewriting...') : 'REWRITE'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isHydrating || isSaving || !preparedVisualization}
                            className="bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isSaving
                                ? (isKr ? '저장 중...' : 'Saving...')
                                : (isKr ? '저장 후 스튜디오로 돌아가기' : 'Save and Return')}
                        </button>
                    </div>
                </header>

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">{localized(assetMeta.focus, language)}</p>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{localized(preparedVisualization?.realismNote, language)}</p>
                    </div>
                    {savedVisualization?.savedAt && (
                        <div className="border border-white/10 bg-white/5 px-4 py-3 text-right">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">{isKr ? '마지막 저장' : 'Last Saved'}</p>
                            <p className="mt-1 text-sm text-white">{new Date(savedVisualization.savedAt).toLocaleString()}</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-5 border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {error}
                    </div>
                )}

                <div className="grid gap-8 md:grid-cols-[1fr_1fr] items-start">
                    {/* Primary Photo (1 Image) */}
                    <div className="space-y-6">
                        <section className="border border-white/10 bg-white/5 p-4 md:p-5" style={{ boxShadow: `0 0 0 1px ${accent.ring}` }}>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                    {isKr ? '📸 실제 공연 참고 사진' : '📸 Real Performance Reference'}
                                </p>
                            </div>
                            {preparedVisualization?.referencePhotos?.length > 0 ? (
                                <ReferencePhotoGrid photos={preparedVisualization.referencePhotos.slice(0, 1)} language={language} />
                            ) : (
                                <div className="border border-dashed border-white/10 bg-black/20 px-4 py-6">
                                    <div className="h-48 animate-pulse bg-white/[0.04]" />
                                    <p className="mt-4 text-xs text-slate-400">
                                        {isKr ? '참고 사진을 준비 중입니다.' : 'Preparing reference photo.'}
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Metadata summary (Less is more) */}
                    <aside className="space-y-6">
                        <section className="border border-white/10 bg-white/5 p-5">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{isKr ? '비주얼 요약' : 'Visual Summary'}</p>
                            <p className="mt-3 text-sm leading-relaxed text-slate-200">{localized(preparedVisualization?.summary, language)}</p>
                        </section>

                        <section className="border border-white/10 bg-white/5 p-5">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{isKr ? '제작자 가이드' : 'Production Notes'}</p>
                            <div className="mt-4 space-y-2">
                                {(preparedVisualization?.materialNotes || []).map((note, index) => (
                                    <div key={`${localized(note, language)}_${index}`} className="border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300">
                                        {localized(note, language)}
                                    </div>
                                ))}
                                {(preparedVisualization?.placementNotes || []).map((note, index) => (
                                    <div key={`${localized(note, language)}_${index}`} className="border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300">
                                        {localized(note, language)}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function LegacyEditor3D() {
    const navigate = useNavigate();
    const { language, activeSection, setActiveSection, blocks, updateBlockLength } = useStore();
    const t = legacyI18n[language] || legacyI18n.EN;

    const [performers, setPerformers] = useState(3);
    const [dancers, setDancers] = useState([]);

    const generatePaths = () => {
        const colors = ['#5b13ec', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e', '#6366f1'];
        const newDancers = [];
        for (let i = 0; i < performers; i += 1) {
            const sx = 10 + Math.random() * 80;
            const sy = 10 + Math.random() * 80;
            const ex = 10 + Math.random() * 80;
            const ey = 10 + Math.random() * 80;
            const mx = (sx + ex) / 2 + (Math.random() - 0.5) * 50;
            const my = (sy + ey) / 2 + (Math.random() - 0.5) * 50;

            newDancers.push({
                id: i + 1,
                x: ex,
                y: ey,
                path: `M${sx},${sy} Q${mx},${my} ${ex},${ey}`,
                color: colors[i % colors.length]
            });
        }
        setDancers(newDancers);
    };

    useEffect(() => {
        generatePaths();
    }, [performers, activeSection]);

    const handleDragRight = (event, id) => {
        event.stopPropagation();
        updateBlockLength(id, 1);
    };

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-dark font-display text-slate-100 antialiased">
            <header className="relative z-50 flex items-center justify-between px-6 pb-4 pt-12">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="glass-panel flex size-10 items-center justify-center rounded-full border border-white/10 hover:bg-white/10 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-xl text-white">arrow_back_ios_new</span>
                    </button>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight text-white">{t.title}</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t.project}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <LanguageToggle />
                </div>
            </header>

            <main className="relative flex flex-grow flex-col px-4 pb-4">
                <div className="relative z-10 flex h-[40vh] w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111116] to-[#0a0a0f] shadow-2xl bg-[length:30px_30px]" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)' }}>
                    <svg className="relative z-10 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="1">
                                <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="#5b13ec" stopOpacity="0.8" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {dancers.map((dancer) => (
                            <g key={dancer.id} className="transition-all duration-1000 ease-in-out">
                                <path d={dancer.path} fill="none" stroke="url(#lineGrad)" strokeWidth="0.8" strokeDasharray="2 3" />
                                <circle cx={dancer.x} cy={dancer.y} r="2.5" fill={dancer.color} filter="url(#glow)" className="animate-pulse" />
                                <text x={dancer.x} y={dancer.y - 4} fontSize="3" fill="#ffffff" fontWeight="bold" textAnchor="middle">{dancer.id}</text>
                            </g>
                        ))}
                    </svg>

                    <div className="absolute left-4 top-4 z-20 flex flex-col gap-3">
                        <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-md">
                            <span className="mb-1 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400">Dancers</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPerformers(Math.max(1, performers - 1))} className="flex size-6 items-center justify-center rounded-md bg-white/10 font-bold text-white transition-all active:bg-white/20">-</button>
                                <span className="w-6 text-center text-sm font-bold text-primary">{performers}</span>
                                <button onClick={() => setPerformers(Math.min(20, performers + 1))} className="flex size-6 items-center justify-center rounded-md bg-white/10 font-bold text-white transition-all active:bg-white/20">+</button>
                            </div>
                        </div>
                        <button onClick={generatePaths} className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/50 bg-primary/90 px-3 py-2.5 text-[10px] font-bold text-white shadow-lg shadow-primary/20 transition-all outline-none hover:bg-primary">
                            <span className="material-symbols-outlined text-[14px]">auto_fix</span>
                            AI Path Gen
                        </button>
                    </div>

                    <div className="absolute right-4 top-4 z-20 box-border rounded-lg border border-white/5 bg-black/40 px-3 py-1.5 backdrop-blur-md">
                        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.7)]">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]"></span>
                            2D PLANNING: <span className="text-white">{t.blocks[activeSection] || activeSection}</span>
                        </span>
                    </div>
                </div>

                <div className="glass-panel relative z-20 mt-4 flex flex-grow flex-col rounded-3xl p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300">
                            <span className="material-symbols-outlined text-lg text-primary">timeline</span>
                            {t.timelineTitle}
                        </h2>
                        <button className="rounded-full bg-primary/20 px-3 py-1.5 text-[10px] font-bold text-primary transition-colors hover:bg-primary/30">
                            {t.aiBtn}
                        </button>
                    </div>

                    <div className="pointer-events-none relative mb-2 h-12 w-full opacity-50">
                        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                            <path d="M0 35 C 20 35, 40 10, 60 5 S 80 30, 100 35" fill="none" stroke="#5b13ec" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px rgba(91,19,236,0.8))' }} />
                        </svg>
                    </div>

                    <div className="relative flex flex-grow items-center gap-2 overflow-x-auto overflow-y-hidden rounded-xl border border-white/5 bg-black/20 p-2">
                        {blocks.map((block) => (
                            <div
                                key={block.id}
                                onClick={() => setActiveSection(block.type.toLowerCase())}
                                className={`relative flex h-20 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 transition-all ${activeSection === block.type.toLowerCase() ? 'border-primary bg-primary/40 shadow-[0_0_15px_rgba(91,19,236,0.5)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                style={{ width: `${block.length * 40}px` }}
                            >
                                <span className="text-[10px] font-bold uppercase text-white/80">{t.blocks[block.type.toLowerCase()] || block.type}</span>
                                <span className="mt-1 text-[8px] text-slate-400">{block.name}</span>
                                <div
                                    className="absolute bottom-0 right-0 top-0 flex w-3 cursor-ew-resize items-center justify-center rounded-r-lg bg-white/10 transition-colors hover:bg-primary/50"
                                    onClick={(event) => handleDragRight(event, block.id)}
                                    title="Click to expand"
                                >
                                    <div className="h-4 w-0.5 rounded-full bg-white/50" />
                                </div>
                            </div>
                        ))}

                        <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-white/10">
                            <span className="max-w-[80px] text-center text-[10px] text-slate-500">{t.addBlock}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex h-14 gap-3">
                        <div className="glass-panel flex flex-grow items-center gap-4 rounded-xl px-4">
                            <button className="text-white transition-colors hover:text-primary">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                            </button>
                            <div className="relative h-1.5 flex-grow cursor-pointer rounded-full bg-white/10">
                                <div className="absolute left-0 top-0 h-full w-[45%] rounded-full bg-primary shadow-[0_0_10px_rgba(91,19,236,0.5)]" />
                            </div>
                        </div>
                        <button className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#9d50bb] px-5 shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <span className="text-[11px] font-bold tracking-wide text-white">{t.export}</span>
                            <span className="text-[8px] text-white/70">{t.exportSub}</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

const Editor3D = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const assetType = location.state?.assetType || searchParams.get('asset');
    const isVisualStudio = ['lighting', 'props', 'costume'].includes(assetType);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    if (isVisualStudio) {
        return <StageVisualizationEditor />;
    }

    return <LegacyEditor3D />;
};

export default Editor3D;
