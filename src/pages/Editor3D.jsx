import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import LanguageToggle from '../components/LanguageToggle';

// Text Dictionary
const i18n = {
    EN: {
        title: '2D Path Planner',
        project: 'Project: Cyber Flow',
        export: 'Export to Presentation',
        exportSub: 'Optimized for PPT & Keynote (.pptx)',
        timelineTitle: 'Emotion Curve & Sequence',
        blocks: { 'intro': 'Intro', 'build-up': 'Build-up', 'climax': 'Climax', 'outro': 'Outro' },
        addBlock: 'Drag Labanotation Blocks here',
        aiBtn: 'Regenerate Sequence'
    },
    KR: {
        title: '2D AI 동선 설계',
        project: '프로젝트: 사이버 플로우',
        export: '실무용 문서(PPT) 내보내기',
        exportSub: 'PPT & 기획서 포맷으로 자동 변환',
        timelineTitle: '감정 곡선 & 시퀀스 타임라인',
        blocks: { 'intro': '도입부', 'build-up': '고조', 'climax': '절정', 'outro': '해소' },
        addBlock: '라반 동작 기호를 여기에 드래그 하세요',
        aiBtn: 'AI 모션 재구축 (1 💳)'
    }
};

const Editor3D = () => {
    const navigate = useNavigate();
    const { language, activeSection, setActiveSection, blocks, updateBlockLength } = useStore();
    const t = i18n[language] || i18n.EN;

    const [performers, setPerformers] = useState(3);
    const [dancers, setDancers] = useState([]);

    const generatePaths = () => {
        const colors = ['#5b13ec', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e', '#6366f1'];
        const newDancers = [];
        for (let i = 0; i < performers; i++) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [performers, activeSection]);

    // Simple Drag Logic for Timeline Blocks (Resizing)
    const handleDragRight = (e, id) => {
        e.stopPropagation();
        updateBlockLength(id, 1);
    };

    return (
        <div className="relative flex h-screen w-full flex-col bg-background-dark font-display text-slate-100 antialiased overflow-hidden">

            {/* 1. TOP HEADER */}
            <header className="relative z-50 flex items-center justify-between px-6 pt-12 pb-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="size-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 border border-white/10 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-white text-xl">arrow_back_ios_new</span>
                    </button>
                    <div>
                        <h1 className="text-white font-bold text-sm tracking-tight">{t.title}</h1>
                        <p className="text-primary text-[10px] uppercase tracking-widest font-bold">{t.project}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <LanguageToggle />
                    <div className="size-10 rounded-full border border-primary/30 overflow-hidden shadow-[0_0_10px_rgba(91,19,236,0.3)]">
                        <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA" />
                    </div>
                </div>
            </header>

            <main className="relative flex-grow flex flex-col px-4 pb-4">

                {/* 2. 2D STAGE PATH PLANNER */}
                <div className="relative w-full h-[40vh] rounded-3xl overflow-hidden bg-gradient-to-b from-[#111116] to-[#0a0a0f] border border-white/10 shadow-2xl z-10 flex flex-col bg-[length:30px_30px]" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)' }}>

                    {/* The 2D visualization SVG */}
                    <svg className="w-full h-full relative z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
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
                        {dancers.map(d => (
                            <g key={d.id} className="transition-all duration-1000 ease-in-out">
                                {/* Path with dash-array animation style effect */}
                                <path d={d.path} fill="none" stroke="url(#lineGrad)" strokeWidth="0.8" strokeDasharray="2 3" />
                                {/* Current Dancer Position */}
                                <circle cx={d.x} cy={d.y} r="2.5" fill={d.color} filter="url(#glow)" className="animate-pulse" />
                                <text x={d.x} y={d.y - 4} fontSize="3" fill="#ffffff" fontWeight="bold" textAnchor="middle">{d.id}</text>
                            </g>
                        ))}
                    </svg>

                    {/* Viewport Overlay Controls */}
                    <div className="absolute left-4 top-4 flex flex-col gap-3 z-20">
                        <div className="flex flex-col gap-1 bg-black/60 rounded-xl border border-white/10 py-2 px-3 backdrop-blur-md">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center mb-1">Dancers</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPerformers(Math.max(1, performers - 1))} className="size-6 bg-white/10 active:bg-white/20 rounded-md flex items-center justify-center text-white font-bold transition-all">-</button>
                                <span className="text-sm font-bold w-6 text-center text-primary">{performers}</span>
                                <button onClick={() => setPerformers(Math.min(20, performers + 1))} className="size-6 bg-white/10 active:bg-white/20 rounded-md flex items-center justify-center text-white font-bold transition-all">+</button>
                            </div>
                        </div>
                        <button onClick={generatePaths} className="bg-primary/90 hover:bg-primary text-white text-[10px] px-3 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all outline-none border border-primary/50 shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[14px]">auto_fix</span>
                            AI Path Gen
                        </button>
                    </div>

                    <div className="absolute top-4 right-4 z-20 bg-black/40 border border-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg box-border">
                        <span className="text-[10px] text-[rgba(255,255,255,0.7)] font-bold tracking-widest uppercase flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981] animate-pulse"></span>
                            2D PLANNING: <span className="text-white">{t.blocks[activeSection] || activeSection}</span>
                        </span>
                    </div>
                </div>

                {/* 3. TIMELINE & EMOTION CURVE EDITOR (Drag & Drop area) */}
                <div className="flex-grow mt-4 glass-panel rounded-3xl p-5 flex flex-col relative z-20">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">timeline</span>
                            {t.timelineTitle}
                        </h2>
                        <button className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors">
                            {t.aiBtn}
                        </button>
                    </div>

                    {/* Simple Emotion Curve visual over timeline */}
                    <div className="w-full h-12 relative mb-2 opacity-50 pointer-events-none">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                            <path d="M0 35 C 20 35, 40 10, 60 5 S 80 30, 100 35" fill="none" stroke="#5b13ec" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px rgba(91,19,236,0.8))' }} />
                        </svg>
                    </div>

                    {/* Timeline Tracks */}
                    <div className="flex-grow relative bg-black/20 rounded-xl border border-white/5 p-2 overflow-x-auto overflow-y-hidden flex items-center gap-2">
                        {blocks.map((b) => (
                            <div
                                key={b.id}
                                onClick={() => setActiveSection(b.type.toLowerCase())}
                                className={`relative h-20 rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all border-2 
                                ${activeSection === b.type.toLowerCase() ? 'bg-primary/40 border-primary shadow-[0_0_15px_rgba(91,19,236,0.5)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                style={{
                                    width: `${b.length * 40}px`,
                                    flexShrink: 0
                                }}
                            >
                                <span className="text-[10px] uppercase font-bold text-white/80">{t.blocks[b.type.toLowerCase()] || b.type}</span>
                                <span className="text-[8px] text-slate-400 mt-1">{b.name}</span>

                                {/* Resize Handle Right */}
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-3 bg-white/10 hover:bg-primary/50 cursor-ew-resize rounded-r-lg flex items-center justify-center transition-colors"
                                    onClick={(e) => handleDragRight(e, b.id)}
                                    title="Click to expand"
                                >
                                    <div className="w-0.5 h-4 bg-white/50 rounded-full"></div>
                                </div>
                            </div>
                        ))}

                        <div className="h-20 w-32 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] text-slate-500 max-w-[80px] text-center">{t.addBlock}</span>
                        </div>
                    </div>

                    {/* Playback Controls & Export Box */}
                    <div className="mt-4 flex gap-3 h-14">
                        <div className="flex-grow glass-panel rounded-xl flex items-center px-4 gap-4">
                            <button className="text-white hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                            </button>
                            <div className="flex-grow h-1.5 bg-white/10 rounded-full cursor-pointer relative">
                                <div className="absolute left-0 top-0 h-full w-[45%] bg-primary rounded-full shadow-[0_0_10px_rgba(91,19,236,0.5)]"></div>
                            </div>
                        </div>
                        <button className="bg-gradient-to-br from-primary to-[#9d50bb] px-5 rounded-xl flex flex-col justify-center items-center shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                            <span className="font-bold text-[11px] text-white tracking-wide">{t.export}</span>
                            <span className="text-[8px] text-white/70">{t.exportSub}</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Editor3D;
