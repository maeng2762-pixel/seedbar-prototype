import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import useExploreStore from '../store/useExploreStore';
import LanguageToggle from '../components/LanguageToggle';

const i18n = {
    EN: {
        title: 'Discovery Hub',
        subtitle: 'AI Choreography Creation Reference',
        search: 'Search ideas, movements...',
        aiTemplates: 'AI Choreography Templates',
        choreoLibrary: 'AI Choreography Library',
        movementIdeas: 'Movement Ideas / Prompts',
        stagePatterns: 'Stage Pattern Library',
        musicDiscovery: 'Choreography Music Recommendations',
        learningHub: 'Learning Hub',
        startProject: 'Start with this',
        generateVariation: 'Generate Variation',
        seeAll: 'See All'
    },
    KR: {
        title: '탐색 스튜디오',
        subtitle: '창작 영감 + 학습 레퍼런스',
        search: '움직임 아이디어 검색...',
        aiTemplates: 'AI 안무 템플릿',
        choreoLibrary: 'AI 안무 보관함',
        movementIdeas: '움직임 프롬프트',
        stagePatterns: '2D 무대 패턴 라이브러리',
        musicDiscovery: '안무용 음악 추천',
        learningHub: '학습 및 연습하기',
        startProject: '이 스타일로 시작하기',
        generateVariation: '변형 생성',
        seeAll: '전체 보기'
    }
};

const Explore = () => {
    const { language } = useStore();
    const t = i18n[language];
    const navigate = useNavigate();

    const {
        choreographyLibrary,
        movementIdeas,
        stagePatterns,
        musicDiscovery,
        aiTemplates,
        learningHighlights,
        fetchExploreData,
        loading
    } = useExploreStore();

    useEffect(() => {
        fetchExploreData();
    }, [fetchExploreData]);

    const handleStartProject = (promptState) => {
        // ideation 탭으로 state와 함께 이동
        navigate('/ideation', { state: { mode: 'create', ...promptState } });
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-slate-100 antialiased overflow-x-hidden pb-28">
            <div className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md pt-12 pb-4 px-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-extrabold tracking-tight text-white">{t.title}</h1>
                    <LanguageToggle />
                </div>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-4">{t.subtitle}</p>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input className="w-full h-12 pl-12 pr-4 bg-slate-800/40 border border-white/10 rounded-2xl text-sm focus:ring-1 focus:ring-primary/50 text-white placeholder:text-slate-500 glass-panel tracking-tight" placeholder={t.search} type="text" />
                </div>
            </div>

            <div className="px-6 space-y-10 mt-2">
                
                {/* 1. AI Choreography Templates */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white">{t.aiTemplates}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {aiTemplates.map(item => (
                            <motion.div 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleStartProject(item.promptState)}
                                key={item.id} 
                                className="glass-panel relative bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-3xl text-primary mb-2">{item.icon}</span>
                                <h3 className="text-xs font-bold text-white mb-1">{language === 'KR' ? item.titleKr : item.titleEn}</h3>
                                <p className="text-[9px] text-slate-400 line-clamp-2 leading-snug">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 2. AI Choreography Library */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white">{t.choreoLibrary}</h2>
                        <span className="text-[10px] text-primary font-bold cursor-pointer">{t.seeAll}</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        {choreographyLibrary.map(item => (
                            <div key={item.id} className="relative rounded-2xl overflow-hidden glass-panel h-48 group">
                                <img alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" src={item.image} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                                <div className="absolute top-3 left-3 flex gap-1">
                                    <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">{item.genre}</div>
                                    <div className="bg-primary/80 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold text-white tracking-wider">{item.dancers} Dancers</div>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <button className="bg-black/40 hover:bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white/80 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-sm">bookmark</span>
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                    <div className="flex-[0_0_70%] pr-2">
                                        <h3 className="text-white text-lg font-bold truncate mb-1">{item.title}</h3>
                                        <p className="text-slate-300 text-[10px] line-clamp-1 mb-1">{item.description}</p>
                                        <p className="text-primary text-[9px] font-bold">{item.mood}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleStartProject(item.promptState)}
                                        className="shrink-0 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-full px-3 py-1.5 text-[9px] font-bold text-white active:scale-95 transition-all"
                                    >
                                        {t.startProject}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Movement Ideas / Prompts */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white">{t.movementIdeas}</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        {movementIdeas.map(item => (
                            <div key={item.id} className="relative glass-panel bg-gradient-to-br from-white/10 to-transparent border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                                <div className="absolute top-3 right-3">
                                    <button className="text-slate-400 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">bookmark</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                                    <h3 className="text-xs font-bold text-white leading-tight">{item.title}</h3>
                                </div>
                                
                                <div className="bg-black/30 rounded-xl p-3 mb-3 border border-white/5">
                                    <p className="text-sm text-primary-light font-bold leading-relaxed">{item.motionPrompt}</p>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-4">
                                    <span className="bg-white/10 px-2 py-1 rounded text-[9px] text-slate-300 tracking-wide font-medium">{item.energy} Energy</span>
                                    <span className="bg-white/10 px-2 py-1 rounded text-[9px] text-slate-300 tracking-wide font-medium">{item.genre}</span>
                                </div>

                                <button 
                                    onClick={() => handleStartProject(item.promptState)}
                                    className="w-full flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary text-[11px] font-bold py-2.5 rounded-xl transition-colors active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                    {t.generateVariation}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Stage Pattern Library */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white">{t.stagePatterns}</h2>
                    </div>
                    <div className="flex overflow-x-auto gap-4 -mx-6 px-6 no-scrollbar snap-x">
                        {stagePatterns.map(item => (
                            <div key={item.id} className="snap-start shrink-0 w-[200px] rounded-2xl overflow-hidden glass-panel border border-white/10 bg-slate-900/50">
                                <div className="h-[120px] relative overflow-hidden">
                                     <img alt={item.title} className="w-full h-full object-cover opacity-70" src={item.preview} />
                                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                                     <div className="absolute top-2 right-2 flex gap-1">
                                        <button className="bg-black/50 hover:bg-black/70 backdrop-blur-md p-1.5 rounded-full text-white/80 hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[12px]">bookmark</span>
                                        </button>
                                     </div>
                                </div>
                                <div className="p-4 -mt-6 relative z-10">
                                    <h3 className="text-xs font-bold text-white mb-1">{item.title}</h3>
                                    <p className="text-[9px] text-slate-400 mb-2">{item.dancers} Dancers</p>
                                    <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed mb-3">{item.description}</p>
                                    <button 
                                        onClick={() => handleStartProject(item.promptState)}
                                        className="w-full border border-primary/50 text-primary text-[10px] font-bold py-1.5 rounded-lg active:scale-95 transition-all"
                                    >
                                        Use Pattern
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. Choreography Music Recommendation */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white">{t.musicDiscovery}</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        {musicDiscovery.map(item => (
                            <div key={item.id} className="glass-panel p-3 rounded-2xl flex items-center gap-3 relative overflow-hidden">
                                <img src={item.image} alt={item.playlist} className="size-16 rounded-xl object-cover shrink-0 opacity-80" />
                                <div className="flex-1 min-w-0 py-1">
                                    <h3 className="text-sm font-bold text-white truncate">{item.playlist}</h3>
                                    
                                    <div className="flex flex-col gap-1 mt-1 mb-2">
                                        <div className="flex gap-2 items-center">
                                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px] text-primary-light whitespace-nowrap">Tempo. {item.tempo}</span>
                                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px] text-slate-300 font-medium whitespace-nowrap truncate">{item.mood}</span>
                                        </div>
                                        <p className="text-[9px] text-slate-400 truncate">Styles: {item.recommendedStyle}</p>
                                    </div>
                                    
                                </div>
                                <div className="flex flex-col items-center gap-2 pr-1">
                                    <button className="text-slate-400 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                                    </button>
                                    <button 
                                        onClick={() => handleStartProject(item.promptState)}
                                        className="size-7 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/40 active:scale-95 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-primary text-[14px]">headphones</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. Learning Hub UX (Footer style) */}
                <section className="pb-8">
                     <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white">{t.learningHub}</h2>
                    </div>
                    <div className="rounded-2xl glass-panel border border-white/5 bg-gradient-to-br from-white/5 to-transparent overflow-hidden divide-y divide-white/5">
                        {learningHighlights.map(item => (
                            <div key={item.id} className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                                <div>
                                    <span className="text-[9px] text-primary font-bold tracking-widest uppercase block mb-1">{item.category}</span>
                                    <h3 className="text-xs font-medium text-slate-200">{item.title}</h3>
                                </div>
                                <span className="material-symbols-outlined text-sm text-slate-500">chevron_right</span>
                            </div>
                        ))}
                        <div className="p-3 text-center bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                            <span className="text-[10px] font-bold text-white">Go to Learning Hub</span>
                        </div>
                    </div>
                </section>

            </div>
            <BottomNav />
        </div>
    );
};

export default Explore;
