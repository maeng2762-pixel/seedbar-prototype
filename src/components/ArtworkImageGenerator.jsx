import React, { useState, useEffect, useMemo } from 'react';
import StableArtworkPreview from './StableArtworkPreview';
import { resolveArtworkUrl } from '../lib/artworkMedia.js';
import { getLocalizedText } from '../../shared/localizedText.js';
import { getUserFacingApiMessage, requestJsonWithSession } from '../lib/sessionRequest.js';
import { reportRuntimeDiagnostic } from '../services/runtimeDiagnostics.js';

const LOADING_MESSAGES_KR = [
    "작품 분위기를 분석하는 중...",
    "대표 비주얼을 생성하는 중...",
    "예술적 터치를 더하는 중...",
    "팜플렛용 이미지를 준비하는 중..."
];

const LOADING_MESSAGES_EN = [
    "Analyzing artwork mood...",
    "Generating representative visual...",
    "Adding artistic touch...",
    "Preparing image for pamphlet..."
];

export default function ArtworkImageGenerator({ draftData, isKr, onSaveImage }) {
    const savedArtworkUrl = resolveArtworkUrl(draftData, { prefer: 'thumbnail', allowFallback: false });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
    const [generatedUrl, setGeneratedUrl] = useState(savedArtworkUrl || null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [saveNotice, setSaveNotice] = useState('');
    const [fallbackMode, setFallbackMode] = useState(false);
    const [sourceLabel, setSourceLabel] = useState(savedArtworkUrl ? (isKr ? '저장된 대표 이미지' : 'Saved representative image') : '');

    const fallbackCandidates = useMemo(() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return [
            {
                url: origin ? `${origin}/images/stage_neon_lighting.png` : '/images/stage_neon_lighting.png',
                label: isKr ? '공연 조명 기반 기본 커버' : 'Stage-lighting fallback cover',
            },
            {
                url: origin ? `${origin}/images/contemporary_costume_concept.png` : '/images/contemporary_costume_concept.png',
                label: isKr ? '의상 무드 기반 기본 커버' : 'Costume mood fallback cover',
            },
        ];
    }, [isKr]);

    useEffect(() => {
        setGeneratedUrl(savedArtworkUrl || null);
        setFallbackMode(false);
        setSourceLabel(savedArtworkUrl ? (isKr ? '저장된 대표 이미지' : 'Saved representative image') : '');
    }, [savedArtworkUrl, isKr]);

    // Rotate loading messages
    useEffect(() => {
        let interval;
        if (isGenerating) {
            interval = setInterval(() => {
                setLoadingMessageIdx(prev => (prev + 1) % 4);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isGenerating]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setErrorMsg(null);
        setSaveNotice('');
        setFallbackMode(false);
        setLoadingMessageIdx(0);

        try {
            const language = isKr ? 'KR' : 'EN';
            const title = getLocalizedText(
                draftData?.titles?.mainTitle
                || draftData?.selectedWorkTitle
                || draftData?.title
                || draftData?.projectName,
                language,
                isKr ? '제목 미정 작품' : 'Untitled performance',
            );
            const genre = String(draftData?.genre || draftData?.music?.style || 'Contemporary Dance');
            const mood = getLocalizedText(
                draftData?.mood
                || draftData?.concept?.artisticPhilosophy
                || draftData?.concept?.artisticStatement,
                language,
                isKr ? '추상적이고 무대적인 분위기' : 'Abstract stage atmosphere',
            );
            const concept = getLocalizedText(
                draftData?.concept?.artisticStatement
                || draftData?.artistNote
                || draftData?.storyConcept,
                language,
                '',
            );
            const emotion = Array.isArray(draftData?.narrative?.emotionCurve?.labels)
                ? draftData.narrative.emotionCurve.labels.join(', ')
                : getLocalizedText(draftData?.narrative?.summary, language, '');
            const style = isKr
                ? '공연 팜플렛과 포스터에 적합한 고급 공연 사진 스타일'
                : 'High-end stage photography suitable for a performance poster and pamphlet';

            const payload = { title, genre, mood, concept, emotion, style };
            const { data } = await requestJsonWithSession('/api/image/generate', {
                method: 'POST',
                body: payload,
            }, {
                featureKey: 'image_generation',
                timeoutMs: 50000,
            });
            if (data.imageUrl) {
                setGeneratedUrl(data.imageUrl);
                const usedFallback = data.source === 'fallback';
                setFallbackMode(usedFallback);
                setSourceLabel(
                    usedFallback
                        ? (isKr ? '기본 공연 커버' : 'Curated fallback cover')
                        : (isKr ? 'AI 생성 대표 이미지' : 'AI-generated representative image')
                );
                setSaveNotice(
                    usedFallback
                        ? (isKr
                            ? 'AI 이미지 서버가 불안정해 공연용 기본 커버를 먼저 보여드렸습니다. 저장하거나 다시 생성할 수 있습니다.'
                            : 'The AI image service is unstable, so a curated performance cover is shown first. You can save it or try again.')
                        : ''
                );
            } else {
                throw new Error('No image URL returned.');
            }
        } catch (error) {
            console.error('Image generation failed:', error);
            reportRuntimeDiagnostic({
                category: 'image_generation_failed',
                severity: 'error',
                message: error?.message || 'Representative artwork generation failed.',
                meta: {
                    hasDraftData: Boolean(draftData),
                    title: draftData?.selectedWorkTitle || draftData?.title || '',
                },
            });
            setErrorMsg(getUserFacingApiMessage(error, {
                isKr,
                messages: isKr ? {
                    auth: '세션이 만료되어 이미지를 생성할 수 없습니다. 다시 로그인 후 시도해 주세요.',
                    authRetryFailed: '세션 자동 복구에 실패했습니다. 다시 로그인 후 이미지를 생성해 주세요.',
                    validation: '작품 정보가 부족하여 이미지를 생성할 수 없습니다. 제목, 장르, 분위기를 확인해 주세요.',
                    config: '이미지 생성 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.',
                    timeout: '이미지 생성 시간이 길어지고 있습니다. 잠시 후 다시 시도해 주세요.',
                    network: '이미지 생성 서버 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.',
                    server: '이미지 생성 서버에서 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
                } : {
                    auth: 'Your session expired, so the artwork image could not be generated. Please log in again.',
                    authRetryFailed: 'Automatic session recovery failed. Please log in again to generate the artwork image.',
                    validation: 'The artwork prompt is missing some required project context.',
                    config: 'The image generation server could not be reached. Please try again shortly.',
                    timeout: 'The image generation request timed out. Please try again shortly.',
                    network: 'The image generation connection is unstable. Please try again shortly.',
                    server: 'The image generation server hit an issue. Please try again later.',
                },
            }));
            if (!savedArtworkUrl) {
                const fallback = fallbackCandidates[0];
                setGeneratedUrl(fallback.url);
                setFallbackMode(true);
                setSourceLabel(fallback.label);
                setSaveNotice(
                    isKr
                        ? 'AI 생성이 지연되어 임시 대표 커버를 먼저 보여드렸습니다. 다시 시도하거나 이 이미지를 저장할 수 있습니다.'
                        : 'AI generation is temporarily unavailable, so a fallback cover is shown first. You can retry or save this image.',
                );
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedUrl || isSaving) return;

        setIsSaving(true);
        setErrorMsg(null);
        setSaveNotice('');

        try {
            const result = await onSaveImage?.(generatedUrl);
            if (result?.ok === false) {
                throw result.error || new Error('Failed to save representative image');
            }
            setSaveNotice(isKr ? '대표 이미지가 저장되었습니다.' : 'Representative image saved.');
            setSourceLabel(fallbackMode
                ? (isKr ? '저장된 기본 커버' : 'Saved fallback cover')
                : (isKr ? '저장된 대표 이미지' : 'Saved representative image'));
        } catch (error) {
            console.error('Representative image save failed:', error);
            setErrorMsg(getUserFacingApiMessage(error, {
                isKr,
                messages: isKr ? {
                    auth: '세션이 만료되어 대표 이미지를 저장할 수 없습니다. 다시 로그인 후 시도해 주세요.',
                    authRetryFailed: '세션 자동 복구에 실패했습니다. 다시 로그인 후 저장해 주세요.',
                    network: '대표 이미지 저장 중 서버 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.',
                    server: '대표 이미지 저장 중 문제가 발생했습니다. 다시 시도해 주세요.',
                } : {
                    auth: 'Your session expired, so the representative image could not be saved.',
                    authRetryFailed: 'Automatic session recovery failed. Please log in again to save the representative image.',
                    network: 'The connection was unstable while saving the representative image.',
                    server: 'The representative image could not be saved right now.',
                },
            }));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[#0a0f1c]/80 backdrop-blur-md border border-indigo-500/20 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 h-full"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                    <h2 className="text-[14px] uppercase tracking-[0.2em] font-sans text-indigo-300 mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">imagesmode</span>
                        {isKr ? "분위기에 어울리는 작품 대표 사진 생성하기" : "Generate Representative Artwork Image"}
                    </h2>
                    <p className="text-xs text-slate-400 font-sans mb-6">
                        {isKr ? "공연 포스터와 팜플렛에 어울리는 안전한 대표 비주얼을 생성합니다. 과도한 노출이나 성적 강조 없이 무대 의상과 공연 분위기를 우선합니다." : "Generate a safe, performance-ready representative visual for pamphlets and pitch presentations. It prioritizes stage costume and artistic atmosphere without sexualized exposure."}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 text-[10px] uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                            {isKr ? '공연 포스터 중심' : 'Performance Poster'}
                        </span>
                        <span className="px-3 py-1 text-[10px] uppercase tracking-widest border border-indigo-500/30 bg-indigo-500/10 text-indigo-200">
                            {isKr ? '안전한 의상 / 무대 스타일' : 'Safe Stage Costume'}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {(!generatedUrl || isGenerating) && (
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-none shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all flex items-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    {isGenerating ? 'hourglass_empty' : 'magic_button'}
                                </span>
                                {isGenerating 
                                    ? (isKr ? (LOADING_MESSAGES_KR[loadingMessageIdx]) : (LOADING_MESSAGES_EN[loadingMessageIdx]))
                                    : (isKr ? "대표 사진 생성" : "Generate Cover Art")}
                            </button>
                        )}

                        {generatedUrl && !isGenerating && (
                            <>
                                <button
                                    onClick={handleGenerate}
                                    className="px-5 py-2.5 bg-white/5 border border-white/20 hover:bg-white/10 text-slate-300 font-semibold transition-all flex items-center gap-2 text-[11px] uppercase tracking-widest"
                                >
                                    <span className="material-symbols-outlined text-[16px]">cycle</span>
                                    {isKr ? "다른 버전 다시 생성" : "Regenerate Alternative"}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-teal-500/20 border border-teal-500/50 hover:bg-teal-500/30 text-teal-300 font-bold transition-all flex items-center gap-2 text-[11px] uppercase tracking-widest shadow-[0_0_10px_rgba(20,184,166,0.2)] disabled:opacity-60"
                                >
                                    <span className="material-symbols-outlined text-[16px]">{isSaving ? 'progress_activity' : 'done_all'}</span>
                                    {isSaving
                                        ? (isKr ? "저장 중..." : "Saving...")
                                        : (isKr ? "저장 / 대표 이미지로 설정" : "Save / Set as Representative")}
                                </button>
                            </>
                        )}
                    </div>
                    {errorMsg && <p className="text-rose-400 mt-3 text-xs">{errorMsg}</p>}
                    {saveNotice && <p className="text-emerald-300 mt-3 text-xs">{saveNotice}</p>}
                    {!isGenerating && errorMsg && (
                        <button
                            onClick={handleGenerate}
                            className="mt-3 inline-flex items-center gap-2 border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-[11px] uppercase tracking-widest text-rose-200 transition-colors hover:bg-rose-500/20"
                        >
                            <span className="material-symbols-outlined text-[14px]">refresh</span>
                            {isKr ? '다시 시도' : 'Retry'}
                        </button>
                    )}
                </div>

                <div className="w-full md:w-[320px] aspect-square flex-shrink-0 bg-black/40 border border-white/10 flex items-center justify-center relative shadow-inner overflow-hidden">
                    {generatedUrl ? (
                         <StableArtworkPreview src={generatedUrl} alt="Artwork Representative" className={`transition-opacity duration-1000 ${isGenerating ? 'opacity-30 blur-sm' : 'opacity-100'}`} />
                    ) : (
                        <div className="text-center p-6 flex flex-col items-center opacity-50">
                            <span className="material-symbols-outlined text-[48px] mb-4 text-slate-500">photo_library</span>
                            <p className="text-xs uppercase tracking-widest text-slate-500">No Image</p>
                        </div>
                    )}
                    
                    {isGenerating && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
                            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold animate-pulse">
                                {isKr ? "생성 중..." : "Generating..."}
                            </span>
                        </div>
                    )}
                    {sourceLabel && !isGenerating && (
                        <div className="absolute bottom-3 left-3 right-3 bg-black/60 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-slate-200 backdrop-blur-sm">
                            {fallbackMode ? (isKr ? '임시 커버' : 'Fallback cover') : (isKr ? '현재 미리보기' : 'Current preview')}: {sourceLabel}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
