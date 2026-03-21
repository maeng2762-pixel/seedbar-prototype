import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChoreographyAIPipeline } from '../services/aiPipeline';

export default function Planner() {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [planResult, setPlanResult] = useState(null);
    const [generationCount, setGenerationCount] = useState(0);
    const [showPaywall, setShowPaywall] = useState(false);

    // Custom specific inputs
    const [genre, setGenre] = useState('Contemporary Fusion');
    const [professorStyle, setProfessorStyle] = useState('Storytelling (서사 중심)');
    const [performers, setPerformers] = useState(3);
    const [cue, setCue] = useState('');

    const handleGenerate = async () => {
        // [3단계] 결제 트리거 - 1번째 무료, 2번째부터 Paywall
        if (generationCount >= 1) {
            setShowPaywall(true);
            return;
        }

        setIsGenerating(true);
        // [1단계] 프론트엔드 - 백엔드 AI 파이프라인 실제 연결
        try {
            // TODO: 실제 인증된 userID 사용 (우선 임시 ID 세팅)
            const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';
            const pipeline = new ChoreographyAIPipeline(TEMP_USER_ID);

            // AI 생성 파이프라인 시작 (키워드 배열 생성, 인원수, 러닝타임 기본 5분 전달)
            const keywords = [genre, professorStyle, cue].filter(Boolean);
            const result = await pipeline.generateFullChoreography(keywords, performers, 5);

            // 파이프라인에서 반환된 구조에 맞춰 Planner UI State 세팅
            const mappedStructure = result.structure_and_LMA.map((s, idx) => ({
                part: s.part || `Part ${idx + 1}`,
                phase: s.phase || "해당 구간",
                lma_tags: s.lma_tags
                    ? [s.lma_tags.effort, s.lma_tags.space, s.lma_tags.time, s.lma_tags.flow].filter(Boolean)
                    : ["Light", "Indirect"],
                space: s.spatial_path || "무대 전역 활용",
                desc: s.desc || "AI 생성 동작 제안"
            }));

            // 구조 데이터가 부족할 경우 UI 에러 방지를 위한 폴백
            if (mappedStructure.length < 3) {
                while (mappedStructure.length < 3) {
                    mappedStructure.push({
                        part: `Part ${mappedStructure.length + 1}`,
                        phase: "지정 안됨",
                        lma_tags: ["Strong", "Direct"],
                        space: "공간 미지정",
                        desc: "추가 전개 구간입니다."
                    });
                }
            }

            setPlanResult({
                metadata: {
                    philosophical_question: result.metadata.philosophical_question || "설정되지 않은 질문?",
                    emotional_direction: result.metadata.emotional_direction || "감정 흐름 진행",
                    symbolic_elements: result.metadata.symbolic_elements || ["오브제 1"]
                },
                emotion_curve: result.emotion_curve || [
                    { phase: "A (0~2분)", emotion_state: "차가운 고립", intensity: 10 },
                    { phase: "B (2~5분)", emotion_state: "마찰과 긴장", intensity: 60 },
                    { phase: "C (5~7분)", emotion_state: "완전한 붕괴", intensity: 100 },
                    { phase: "Outro (7~8분)", emotion_state: "허공의 수용", intensity: 20 }
                ],
                structure_and_LMA: mappedStructure,
                presentation_data: {
                    intro_text: result.presentation_data.intro_text || "작품의 서두입니다.",
                    images: { // 시각 효과를 위해 기존 Mock 이미지 유지
                        wardrobe: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiFcKiHlr7OiKzBqNlOb_jTGUoznDhKaPNqXq5_2wMTCLfsXO3z5UnMbudmuuYusn5uZKdoc_57LR_xfmiJX-s_eT7WC79OpBBktYRiMhojA6HcsyTT_dPFnPvXkWzUZsE_VLJcEPoviP-jxwV_4JCt9OXpNJQAsOzLiYUsRkmAJhP-w05DcYDdBg5QOYQfWUhpH0G39nkSELhVHnDm7Daz8QU--n56zXFP9L8rpioGMXbSKbPW32T2ig6bbiPwwYqRjBI4IeZvQ",
                        stage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbKsp1nkvXkv08ywxPYH_cDy4fnp21snYVXBbYVmR1UyR3oB3dtu5Iu9_fhsXCl0MuTeBMZZAnN1ZjhhCqqFHW8YVZrrZCZvPuA8vq73HTAwLlkwGqD7NYKlKSa0shvzu6AMbFTxDBxDPFI4CRNRRaZBzWnqI0PXKQBFtEuhGYrMnhzg06SB1-EsH5f9jv3zhAMOk5ifRNbnkjfMiW6O6APHD9tzM7PfyVfXILYEeUyqQYHCWT37ecmkDVVO4X-xqYQjmdRPHH7w"
                    }
                }
            });

            // 첫 무료 생성 완료 처리
            setGenerationCount(1);
        } catch (error) {
            console.error("AI파이프라인 오류:", error);
            alert("작품 생성 중 오류가 발생했습니다. (백엔드 오류 혹은 크레딧 부족)");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePPTExport = () => {
        // PPT 다운로드는 무조건 Pro 등급(페이월)
        setShowPaywall(true);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#0f0f13] text-slate-100 overflow-x-hidden pb-28 font-display">
            {/* Header */}
            <header className="flex items-center bg-[#0f0f13]/90 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div onClick={() => navigate(-1)} className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-white text-lg">arrow_back_ios_new</span>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white tracking-tight">AI Choreography</h1>
                        <p className="text-[11px] text-primary font-bold uppercase tracking-widest">Workflow Engine</p>
                    </div>
                </div>
            </header>

            <main className="px-6 pt-6 space-y-8">
                {/* Setup Section */}
                <section className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[#a0a0b0]">01. Constraints</h2>
                        <span className="text-[10px] bg-white/10 text-white px-2 py-1 rounded-md font-bold uppercase">Setup</span>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 space-y-5 shadow-2xl">
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Genre</span>
                                <select value={genre} onChange={e => setGenre(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/50 p-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-primary outline-none transition-all">
                                    <option>Contemporary Fusion</option>
                                    <option>Modern Hip Hop</option>
                                    <option>Ballet</option>
                                </select>
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Dancers</span>
                                <input value={performers} onChange={e => setPerformers(e.target.value)} type="number" className="w-full rounded-xl border border-white/10 bg-black/50 p-3.5 text-sm font-bold text-white text-center focus:ring-2 focus:ring-primary outline-none transition-all" />
                            </label>
                        </div>

                        <label className="flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Professor Persona (지도 성향)</span>
                            <select value={professorStyle} onChange={e => setProfessorStyle(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/50 p-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-primary outline-none transition-all">
                                <option>Storytelling (서사 중심)</option>
                                <option>Experimental (실험적 성향)</option>
                                <option>Technical (테크닉 엄격)</option>
                            </select>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Core Concept Idea</span>
                            <input value={cue} onChange={e => setCue(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/50 p-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-white/20" placeholder="예: 디지털 고립, 심장박동..." type="text" />
                        </label>
                    </div>

                    <button
                        onClick={handleGenerate} disabled={isGenerating}
                        className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-3 text-[15px] transition-all
                            ${isGenerating ? 'bg-primary/50 text-white/50 cursor-not-allowed' : 'bg-primary text-white shadow-[0_4px_24px_rgba(91,19,236,0.4)] hover:shadow-[0_4px_32px_rgba(91,19,236,0.6)] active:scale-[0.98]'}`}>
                        {isGenerating ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                AI 6단계 생성 알고리즘 가동 중...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">auto_awesome</span>
                                {generationCount === 0 ? '작품 및 동선 설계하기 (1회 무료)' : '새로운 버전 생성하기 (Pro)'}
                            </>
                        )}
                    </button>
                </section>

                {/* [2단계] 결과 화면 시각화 (WOW Points) */}
                {planResult && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* WOW: 의도 카드 UI */}
                        <section className="space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[#a0a0b0]">02. Core Intent (작품 의도)</h2>
                            <div className="p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">Philosophical Concept</p>
                                <h3 className="text-2xl font-bold leading-tight mb-4 text-white">"{planResult.metadata.philosophical_question}"</h3>
                                <p className="text-sm text-slate-300 leading-relaxed mb-4">{planResult.presentation_data.intro_text}</p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {planResult.metadata.symbolic_elements.map((el, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-[10px] font-bold text-slate-300"> 오브제: {el} </span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* WOW: 유선형 감정 곡선 그래프 UI */}
                        <section className="space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[#a0a0b0]">03. Phrasing & Emotion</h2>
                            <div className="rounded-3xl bg-black/40 border border-white/10 p-5 relative">
                                <div className="flex justify-between items-end mb-4 relative z-10">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Climax Intensity</p>
                                        <p className="text-3xl font-bold text-white">100<span className="text-sm text-primary ml-1">%</span></p>
                                    </div>
                                    <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold uppercase rounded-lg border border-primary/30">AI Phrasing</span>
                                </div>
                                <div className="h-40 w-full relative pt-4">
                                    {/* Seamless Curved Graph Mock */}
                                    <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <defs>
                                            <linearGradient id="wowGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="rgba(91, 19, 236, 0.6)" />
                                                <stop offset="100%" stopColor="rgba(91, 19, 236, 0)" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0 80 C 25 80, 40 40, 60 10 S 85 80, 100 80 L 100 100 L 0 100 Z" fill="url(#wowGradient)" />
                                        <path d="M0 80 C 25 80, 40 40, 60 10 S 85 80, 100 80" fill="none" stroke="#5b13ec" strokeWidth="4" className="shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(91,19,236,0.8))' }} />
                                        <circle cx="60" cy="10" r="5" fill="#fff" className="animate-pulse shadow-[0_0_15px_#fff]" />
                                    </svg>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase mt-2">
                                    <span>{planResult.emotion_curve[0].emotion_state}</span>
                                    <span className="text-primary">{planResult.emotion_curve[2].emotion_state}</span>
                                    <span>{planResult.emotion_curve[3].emotion_state}</span>
                                </div>
                            </div>
                        </section>

                        {/* WOW: 타임라인 안무 구조 & LMA 칩 UI */}
                        <section className="space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[#a0a0b0]">04. Timeline & LMA Mapping</h2>
                            <div className="space-y-4">
                                {planResult.structure_and_LMA.map((block, idx) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                                        {/* Timeline Dot */}
                                        <div className="absolute top-0 bottom-0 left-6 w-[2px] bg-white/10 z-0"></div>
                                        <div className="relative z-10 flex gap-4">
                                            <div className="mt-1 w-3 h-3 rounded-full border-2 border-[#0f0f13] bg-primary skeleton-pulse"></div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-lg text-white">{block.part}</h3>
                                                    <span className="text-xs font-bold text-slate-400">{block.phase}</span>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed dark:text-slate-300">{block.desc}</p>
                                                <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                                                    <span className="material-symbols-outlined text-[14px] text-slate-400">conversion_path</span>
                                                    <p className="text-xs text-slate-400">{block.space}</p>
                                                </div>
                                                {/* LMA Tags */}
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {block.lma_tags.map((tag, tIdx) => (
                                                        <span key={tIdx} className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md shadow-sm border ${tIdx === 0 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                                                            tIdx === 1 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                                                'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                            }`}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* PPT Export Section */}
                        <section className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent p-5 rounded-3xl border border-primary/20">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">co_present</span>
                                        Export Presentation
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">교수 제출용 PPTX 및 대본 다운로드</p>
                                </div>
                                <button onClick={handlePPTExport} className="px-5 py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
                                    Download <span className="material-symbols-outlined text-[16px]">download</span>
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 w-full z-40 bg-[#0f0f13]/80 backdrop-blur-xl border-t border-white/10 pt-4 pb-8 px-6">
                <div className="flex justify-around items-center">
                    <button className="flex flex-col items-center gap-1.5 text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                        <span className="text-[10px] font-bold uppercase">Planner</span>
                    </button>
                    <button onClick={() => navigate('/editor')} className="flex flex-col items-center gap-1.5 text-[#a0a0b0]">
                        <span className="material-symbols-outlined">polyline</span>
                        <span className="text-[10px] font-bold uppercase">Canvas</span>
                    </button>
                </div>
            </nav>

            {/* [3단계] Paywall Modal */}
            {showPaywall && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-6">
                    <div className="bg-[#1a1a20] border border-white/10 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg">
                                <span className="material-symbols-outlined text-white text-2xl">workspace_premium</span>
                            </div>
                            <button onClick={() => setShowPaywall(false)} className="text-slate-500 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Upgrade to a Paid Plan</h2>
                        <p className="text-sm text-slate-300 mb-6 relative z-10">무제한 AI 작품 생성과 발표용 PPT 자동 내보내기는 <strong className="text-white">Pro 티어</strong> 전용 기능입니다.</p>

                        <div className="space-y-3 mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                <span className="text-sm text-slate-200">AI 모션 플래닝 무제한 생성</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                <span className="text-sm text-slate-200">완성된 작품 PPTX 즉시 추출</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                <span className="text-sm text-slate-200">교수 피드백/의도 스크립트 고도화</span>
                            </div>
                        </div>

                        <button className="w-full py-4 rounded-2xl bg-white text-black font-bold text-[15px] shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all relative z-10">
                            ₩39,000 / 월 구독하기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
