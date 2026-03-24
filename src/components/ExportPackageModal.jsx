import React, { useState } from 'react';
import { getUserFacingApiMessage, requestJsonWithSession } from '../lib/sessionRequest.js';
import { reportRuntimeDiagnostic } from '../services/runtimeDiagnostics.js';

export default function ExportPackageModal({ isOpen, onClose, draftData, token, currentPlan, isKr, onSaveAndView }) {
    const [step, setStep] = useState(1); // 1: Select Type, 2: Generating, 3: Editor
    const [exportType, setExportType] = useState('full'); // 'ppt_only', 'ppt_script', 'full'
    const [language, setLanguage] = useState(isKr ? 'KR' : 'EN');
    const [generatedPackage, setGeneratedPackage] = useState(null);
    const [activeTab, setActiveTab] = useState('ppt'); // 'ppt', 'script', 'stage', 'lighting'
    const [error, setError] = useState('');
    const [errorType, setErrorType] = useState(null); // 'auth', 'plan', 'server', 'network', null
    const [statusNotice, setStatusNotice] = useState('');

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setStep(2);
        setError('');
        setErrorType(null);
        setStatusNotice(
            currentPlan && !['studio', 'team', 'team_starter', 'enterprise'].includes(String(currentPlan).toLowerCase())
                ? (isKr ? '현재 플랜 권한을 서버에서 다시 확인하고 있습니다.' : 'Re-checking your plan entitlement with the server.')
                : (isKr ? '세션과 발행 권한을 확인한 뒤 패키지 생성을 시작합니다.' : 'Checking session and publishing access before generating the package.')
        );

        try {
            const { data } = await requestJsonWithSession('/api/export/package', {
                method: 'POST',
                body: {
                    draftData,
                    options: { exportType, language }
                },
            }, {
                featureKey: 'package_publish',
                timeoutMs: 90000,
            });

            setGeneratedPackage(data.packageContent);
            setStep(3);
            setStatusNotice(isKr ? '패키지가 생성되었습니다. 내용을 검토한 뒤 저장할 수 있습니다.' : 'The package is ready. Review it before saving.');
        } catch (err) {
            reportRuntimeDiagnostic({
                category: 'package_publish_failed',
                severity: 'error',
                message: err?.message || 'Package publishing failed.',
                meta: {
                    exportType,
                    language,
                    currentPlan: currentPlan || 'unknown',
                },
            });
            if (err?.type === 'auth') setErrorType('auth');
            else if (err?.type === 'plan') setErrorType('plan');
            else if (err?.type === 'network') setErrorType('network');
            else setErrorType('server');

            setError(getUserFacingApiMessage(err, {
                isKr,
                messages: isKr ? {
                    auth: '세션이 만료되어 자동 복구를 시도했습니다. 계속되지 않으면 다시 로그인해 주세요.',
                    authRetryFailed: '세션 자동 복구에 실패했습니다. 다시 로그인 후 패키지 발행을 이어가 주세요.',
                    plan: '현재 플랜에서 패키지 발행 권한을 확인할 수 없습니다.',
                    timeout: '패키지 생성 시간이 길어지고 있습니다. 잠시 후 다시 시도해 주세요.',
                    network: '서버 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.',
                    server: '패키지 생성 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
                } : {
                    auth: 'Your session expired. We tried to recover it automatically, but please log in again if publishing does not continue.',
                    authRetryFailed: 'Automatic session recovery failed. Please log in again to continue publishing the package.',
                    plan: 'We could not verify package publishing permission for your plan.',
                    timeout: 'Package generation is taking longer than expected. Please try again shortly.',
                    network: 'The server connection is unstable. Please try again shortly.',
                    server: 'The server hit an issue while generating the package. Please try again later.',
                },
            }));
            setStatusNotice('');
            setStep(1);
        }
    };

    const handleSaveAndView = async () => {
        // Save to backend directly here, or just let parent handle it? 
        // We will do both. Calling the API ensures the document is saved permanently.
        try {
            const targetId = draftData?._id || draftData?.id;
            
            if (targetId) {
                // Background save to MongoDB
                const updatedContent = { ...draftData, generatedPackage };
                await requestJsonWithSession(`/api/choreography/projects/${targetId}`, {
                    method: 'PUT',
                    body: {
                        title: draftData.title || 'Untitled',
                        currentContent: updatedContent,
                    },
                }, {
                    featureKey: 'package_publish_save',
                    timeoutMs: 30000,
                });
            }
        } catch (e) {
            console.error('Failed to auto-save generated package:', e);
            reportRuntimeDiagnostic({
                category: 'package_publish_save_failed',
                severity: 'warn',
                message: e?.message || 'Failed to save generated package.',
            });
        }

        if (onSaveAndView) {
            onSaveAndView(generatedPackage);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md font-sans">
            <div className="bg-[#110D26] border border-white/20 p-8 rounded-none w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[90vh]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-[#5B13EC]"></div>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-white text-2xl font-light italic">
                            {isKr ? '고급 안무 패키지 발행' : 'Publish Advanced Package'}
                        </h2>
                        <p className="text-xs text-slate-400 tracking-widest uppercase mt-1">
                            {isKr ? '발표 및 제작 커뮤니케이션용 문서 생성' : 'Generate Presentation & Production Documents'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 mb-4 flex flex-col items-start gap-4">
                        <div className="text-red-400 text-sm">{error}</div>
                        <div className="flex gap-2">
                            {errorType === 'auth' && (
                                <button onClick={handleGenerate} className="px-4 py-2 bg-red-500/20 text-red-300 text-xs border border-red-500/30 hover:bg-red-500/30 transition-colors uppercase tracking-widest">
                                    {isKr ? '다시 시도' : 'Try Again'}
                                </button>
                            )}
                            {errorType === 'plan' && (
                                <button onClick={onClose} className="px-4 py-2 bg-red-500/20 text-red-300 text-xs border border-red-500/30 hover:bg-red-500/30 transition-colors uppercase tracking-widest">
                                    {isKr ? '권한 다시 확인하기' : 'Check Permissions'}
                                </button>
                            )}
                            {(errorType === 'server' || errorType === 'network') && (
                                <button onClick={handleGenerate} className="px-4 py-2 bg-red-500/20 text-red-300 text-xs border border-red-500/30 hover:bg-red-500/30 transition-colors uppercase tracking-widest">
                                    {isKr ? '다시 시도' : 'Try Again'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 1: Selection */}
                {step === 1 && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-4">
                            <label className="flex items-start gap-4 p-4 border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <input type="radio" className="mt-1" name="exportType" value="ppt_only" checked={exportType === 'ppt_only'} onChange={(e) => setExportType(e.target.value)} />
                                <div>
                                    <div className="text-white font-bold">{isKr ? '발표용 PPT 템플릿 텍스트' : 'Presentation PPT Text'}</div>
                                    <div className="text-slate-400 text-xs mt-1">{isKr ? '안무 기획의 핵심 내용을 슬라이드 포맷으로 요약 정리합니다. (12장 내외)' : 'Summarizes core concepts for your presentation slides.'}</div>
                                </div>
                            </label>
                            
                            <label className="flex items-start gap-4 p-4 border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <input type="radio" className="mt-1" name="exportType" value="ppt_script" checked={exportType === 'ppt_script'} onChange={(e) => setExportType(e.target.value)} />
                                <div>
                                    <div className="text-white font-bold">{isKr ? 'PPT + 발표 대본' : 'PPT + Presentation Script'}</div>
                                    <div className="text-slate-400 text-xs mt-1">{isKr ? 'PPT 슬라이드에 매칭되는 흐름의 피칭/수업용 대본을 함께 생성합니다.' : 'Generates presentation script matched per slide.'}</div>
                                </div>
                            </label>

                            <label className="flex items-start gap-4 p-4 border border-teal-500/30 bg-teal-500/5 cursor-pointer hover:bg-teal-500/10 transition-colors">
                                <input type="radio" className="mt-1 accent-teal-500" name="exportType" value="full" checked={exportType === 'full'} onChange={(e) => setExportType(e.target.value)} />
                                <div>
                                    <div className="text-teal-400 font-bold">{isKr ? '전체 프로덕션 패키지 (권장)' : 'Full Production Package (Recommended)'}</div>
                                    <div className="text-slate-400 text-xs mt-1">{isKr ? 'PPT, 발표 대본에 더해 무대감독 및 조명감독 통신용 큐시트를 자동 생성하고 품질 점검을 수행합니다.' : 'Includes PPT, Script, and detailed cue sheets for Stage & Lighting directors.'}</div>
                                </div>
                            </label>
                        </div>

                        <div className="mt-8 border-t border-white/10 pt-6 flex justify-between items-center">
                            <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-black border border-white/20 text-white text-sm p-2 outline-none">
                                <option value="KR">한국어 (Korean)</option>
                                <option value="EN">English</option>
                            </select>
                            
                            <button onClick={handleGenerate} className="px-8 py-3 bg-white text-black font-semibold hover:bg-slate-200 transition-all uppercase tracking-widest text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                                {isKr ? '패키지 생성 시작' : 'Generate Package'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Generating Loading */}
                {step === 2 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-6"></div>
                        <h3 className="text-white text-lg font-light tracking-wide mb-2">
                            {isKr ? 'AI가 전문가 수준의 패키지를 작성하고 있습니다...' : 'Generating professional package...'}
                        </h3>
                        <p className="text-slate-400 text-sm">
                            {statusNotice || (isKr ? '누락된 세부 정보를 보완하고 품질을 점검합니다. (최대 1분 소요)' : 'Synthesizing details and running quality checks.')}
                        </p>
                    </div>
                )}

                {/* Step 3: Editor */}
                {step === 3 && generatedPackage && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-white/10 mb-4 overflow-x-auto custom-scrollbar">
                            <button onClick={() => setActiveTab('ppt')} className={`px-4 py-2 text-sm uppercase tracking-widest whitespace-nowrap ${activeTab === 'ppt' ? 'text-teal-400 border-b-2 border-teal-400 bg-white/5' : 'text-slate-400 hover:text-white'}`}>
                                {isKr ? '프레젠테이션' : 'PPT Slides'}
                            </button>
                            {(exportType === 'ppt_script' || exportType === 'full') && (
                                <button onClick={() => setActiveTab('script')} className={`px-4 py-2 text-sm uppercase tracking-widest whitespace-nowrap ${activeTab === 'script' ? 'text-teal-400 border-b-2 border-teal-400 bg-white/5' : 'text-slate-400 hover:text-white'}`}>
                                    {isKr ? '발표 대본' : 'Script'}
                                </button>
                            )}
                            {exportType === 'full' && (
                                <>
                                    <button onClick={() => setActiveTab('stage')} className={`px-4 py-2 text-sm uppercase tracking-widest whitespace-nowrap ${activeTab === 'stage' ? 'text-teal-400 border-b-2 border-teal-400 bg-white/5' : 'text-slate-400 hover:text-white'}`}>
                                        {isKr ? '무대감독 지시서' : 'Stage Doc'}
                                    </button>
                                    <button onClick={() => setActiveTab('lighting')} className={`px-4 py-2 text-sm uppercase tracking-widest whitespace-nowrap ${activeTab === 'lighting' ? 'text-teal-400 border-b-2 border-teal-400 bg-white/5' : 'text-slate-400 hover:text-white'}`}>
                                        {isKr ? '조명감독 큐시트' : 'Lighting Doc'}
                                    </button>
                                    <button onClick={() => setActiveTab('costume')} className={`px-4 py-2 text-sm uppercase tracking-widest whitespace-nowrap ${activeTab === 'costume' ? 'text-teal-400 border-b-2 border-teal-400 bg-white/5' : 'text-slate-400 hover:text-white'}`}>
                                        {isKr ? '의상/소품 정리표' : 'Costume & Props'}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Editors */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {activeTab === 'ppt' && (
                                <div className="space-y-6">
                                    {(generatedPackage.pptSlides || []).map((slide, idx) => (
                                        <div key={idx} className="bg-black/30 border border-white/10 p-5">
                                            <div className="flex gap-4 mb-4 items-center">
                                                <span className="text-teal-400 font-bold border border-teal-400/30 bg-teal-400/10 px-2 py-1 text-xs">#{slide.slideNumber}</span>
                                                <input 
                                                    type="text" 
                                                    value={slide.title} 
                                                    onChange={e => {
                                                        const newVal = [...generatedPackage.pptSlides];
                                                        newVal[idx].title = e.target.value;
                                                        setGeneratedPackage({...generatedPackage, pptSlides: newVal});
                                                    }}
                                                    className="bg-transparent text-white w-full outline-none text-xl font-bold font-serif"
                                                    placeholder="Slide Title"
                                                />
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Core Message</label>
                                                <input 
                                                    type="text" 
                                                    value={slide.coreMessage || ''} 
                                                    onChange={e => {
                                                        const newVal = [...generatedPackage.pptSlides];
                                                        newVal[idx].coreMessage = e.target.value;
                                                        setGeneratedPackage({...generatedPackage, pptSlides: newVal});
                                                    }}
                                                    className="w-full bg-black/50 border border-white/10 text-teal-200 p-2 outline-none focus:border-teal-500/50 text-sm font-semibold"
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Bullet Points (Sub-description)</label>
                                                <textarea 
                                                    value={(slide.subDescription || []).join('\n')}
                                                    onChange={e => {
                                                        const newVal = [...generatedPackage.pptSlides];
                                                        newVal[idx].subDescription = e.target.value.split('\n');
                                                        setGeneratedPackage({...generatedPackage, pptSlides: newVal});
                                                    }}
                                                    className="w-full bg-black/50 border border-white/5 text-slate-300 p-3 min-h-[80px] outline-none focus:border-white/20 text-sm leading-relaxed"
                                                    placeholder="- Point 1&#10;- Point 2"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                                                        <span className="material-symbols-outlined text-[14px]">palette</span> Visual Aid
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        value={slide.visualAid || ''} 
                                                        onChange={e => {
                                                            const newVal = [...generatedPackage.pptSlides];
                                                            newVal[idx].visualAid = e.target.value;
                                                            setGeneratedPackage({...generatedPackage, pptSlides: newVal});
                                                        }}
                                                        className="w-full bg-transparent border-b border-white/10 text-slate-400 p-1 text-xs outline-none focus:text-slate-300 focus:border-white/30"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                                                        <span className="material-symbols-outlined text-[14px]">campaign</span> Presentation Point
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        value={slide.presentationPoint || ''} 
                                                        onChange={e => {
                                                            const newVal = [...generatedPackage.pptSlides];
                                                            newVal[idx].presentationPoint = e.target.value;
                                                            setGeneratedPackage({...generatedPackage, pptSlides: newVal});
                                                        }}
                                                        className="w-full bg-transparent border-b border-[#5B13EC]/30 text-[#5B13EC]/80 p-1 text-xs outline-none focus:text-[#5B13EC] focus:border-[#5B13EC]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'script' && (
                                <textarea 
                                    value={generatedPackage.presentationScript || ''}
                                    onChange={e => setGeneratedPackage({...generatedPackage, presentationScript: e.target.value})}
                                    className="w-full h-full min-h-[400px] bg-black/30 border border-white/10 p-6 text-slate-300 outline-none focus:border-white/30 whitespace-pre-wrap leading-relaxed font-serif"
                                />
                            )}
                            {activeTab === 'stage' && (
                                <textarea 
                                    value={generatedPackage.stageDirectorDoc || ''}
                                    onChange={e => setGeneratedPackage({...generatedPackage, stageDirectorDoc: e.target.value})}
                                    className="w-full h-full min-h-[400px] bg-black/30 border border-white/10 p-6 text-slate-300 outline-none focus:border-white/30 whitespace-pre-wrap leading-relaxed font-mono text-sm"
                                />
                            )}
                            {activeTab === 'lighting' && (
                                <textarea 
                                    value={generatedPackage.lightingDirectorDoc || ''}
                                    onChange={e => setGeneratedPackage({...generatedPackage, lightingDirectorDoc: e.target.value})}
                                    className="w-full h-full min-h-[400px] bg-black/30 border border-white/10 p-6 text-[#5B13EC]/80 outline-none focus:border-[#5B13EC]/50 whitespace-pre-wrap leading-relaxed font-mono text-sm"
                                />
                            )}
                            {activeTab === 'costume' && (
                                <textarea 
                                    value={generatedPackage.costumePropDoc || ''}
                                    onChange={e => setGeneratedPackage({...generatedPackage, costumePropDoc: e.target.value})}
                                    className="w-full h-full min-h-[400px] bg-black/30 border border-white/10 p-6 text-pink-500/80 outline-none focus:border-pink-500/50 whitespace-pre-wrap leading-relaxed font-mono text-sm"
                                />
                            )}
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-4 flex justify-end gap-3">
                            <button onClick={() => setStep(1)} className="px-6 py-2 border border-white/20 text-white hover:bg-white/10 text-sm uppercase tracking-widest">
                                {isKr ? '다시 생성' : 'Regenerate'}
                            </button>
                            <button onClick={handleSaveAndView} className="px-6 py-2 bg-teal-500 text-black font-bold hover:bg-teal-400 transition-colors flex items-center gap-2 text-sm uppercase tracking-widest">
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                {isKr ? '저장 및 뷰어 열기' : 'Save & Open Viewer'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
