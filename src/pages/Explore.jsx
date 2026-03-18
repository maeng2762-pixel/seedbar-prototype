import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import useExploreStore from '../store/useExploreStore';
import LanguageToggle from '../components/LanguageToggle';

const i18n = {
    EN: {
        title: 'Discovery Hub',
        subtitle: 'Curated Dance References & Learning',
        search: 'Search for references to study...',
        latestReferences: 'Latest References',
        todayDanceVids: "Today's Dance Videos",
        performanceHighlights: 'Performance Highlights',
        structureRef: 'Choreography Structure Reference',
        movementLearning: 'Movement Detail Learning',
        startProject: 'Apply this Reference',
        seeAll: 'See All'
    },
    KR: {
        title: '탐색 스튜디오',
        subtitle: '보고 배우는 무용 레퍼런스 공간',
        search: '안무에 바로 참고할 수 있는 영상 찾기...',
        latestReferences: '최신 레퍼런스',
        todayDanceVids: '오늘의 무용 영상',
        performanceHighlights: '공연 하이라이트',
        structureRef: '안무 구조 참고',
        movementLearning: '움직임 디테일 학습',
        startProject: '이 레퍼런스 적용하기',
        seeAll: '전체 보기'
    }
};

const ExploreCard = ({ item, t, onStart }) => (
    <div className="relative rounded-2xl overflow-hidden glass-panel group mb-4">
        <div className="h-48 relative overflow-hidden">
            <img alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" src={item.image || item.preview} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
            <div className="absolute top-3 left-3 flex gap-1">
                <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">{item.genre}</div>
                {item.dancers && (
                    <div className="bg-[#5B13EC]/80 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold text-white tracking-wider">
                        {item.dancers} Dancers
                    </div>
                )}
            </div>
            <div className="absolute top-3 right-3">
                <button className="bg-black/40 hover:bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white/80 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">bookmark</span>
                </button>
            </div>
            
            <div className="absolute bottom-3 left-3 right-3 flex flex-col justify-end">
                {item.learningObject && (
                    <div className="inline-block bg-[#5B13EC]/20 border border-[#5B13EC]/40 text-teal-300 text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm w-max mb-1.5">
                        💡 {item.learningObject}
                    </div>
                )}
                <div className="flex justify-between items-end gap-2">
                    <div className="flex-[0_0_70%] pr-2">
                        <h3 className="text-white text-lg font-bold truncate mb-1">{item.title}</h3>
                        <p className="text-slate-300 text-[10px] line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    <button 
                        onClick={() => onStart(item.promptState)}
                        className="shrink-0 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 text-[9px] font-bold text-white active:scale-95 transition-all text-center"
                    >
                        {t.startProject}
                    </button>
                </div>
            </div>
        </div>
    </div>
);


const Explore = () => {
    const { language } = useStore();
    const t = i18n[language];
    const navigate = useNavigate();

    const {
        latestReferences,
        todayDanceVids,
        performanceHighlights,
        structureRef,
        movementLearning,
        fetchExploreData
    } = useExploreStore();

    useEffect(() => {
        fetchExploreData();
    }, [fetchExploreData]);

    const handleStartProject = (promptState) => {
        navigate('/ideation', { state: { mode: 'create', ...promptState } });
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-slate-100 antialiased overflow-x-hidden pb-28">
            <div className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md pt-12 pb-4 px-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-extrabold tracking-tight text-white">{t.title}</h1>
                    <LanguageToggle />
                </div>
                <p className="text-[11px] text-[#5B13EC] font-bold uppercase tracking-widest mb-1">{t.subtitle}</p>
                <p className="text-xs text-slate-400 mb-4">{language === 'KR' ? '안무에 바로 참고할 수 있는 영상만 큐레이션합니다' : 'Curated dance references you can immediately apply.'}</p>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input className="w-full h-12 pl-12 pr-4 bg-slate-800/40 border border-[#5B13EC]/20 rounded-2xl text-sm focus:ring-1 focus:ring-[#5B13EC]/50 text-white placeholder:text-slate-500 glass-panel tracking-tight" placeholder={t.search} type="text" />
                </div>
            </div>

            <div className="px-6 space-y-12 mt-4">
                
                {/* 1. 최신 레퍼런스 */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-3 bg-[#5B13EC] rounded-full"></span>
                            {t.latestReferences}
                        </h2>
                        <span className="text-[10px] text-slate-400 cursor-pointer hover:text-white transition-colors">{t.seeAll}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {latestReferences.map(item => (
                            <ExploreCard key={item.id} item={item} t={t} onStart={handleStartProject} />
                        ))}
                    </div>
                </section>

                {/* 2. 오늘의 무용 영상 */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-3 bg-[#5B13EC] rounded-full"></span>
                            {t.todayDanceVids}
                        </h2>
                    </div>
                    <div className="flex flex-col gap-1">
                        {todayDanceVids.map(item => (
                            <ExploreCard key={item.id} item={item} t={t} onStart={handleStartProject} />
                        ))}
                    </div>
                </section>

                {/* 3. 공연 하이라이트 */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-3 bg-[#5B13EC] rounded-full"></span>
                            {t.performanceHighlights}
                        </h2>
                    </div>
                    <div className="flex flex-col gap-1">
                        {performanceHighlights.map(item => (
                            <ExploreCard key={item.id} item={item} t={t} onStart={handleStartProject} />
                        ))}
                    </div>
                </section>

                {/* 4. 안무 구조 참고 */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-3 bg-[#5B13EC] rounded-full"></span>
                            {t.structureRef}
                        </h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        {structureRef.map(item => (
                            <div key={item.id} className="relative glass-panel bg-gradient-to-br from-[#5B13EC]/10 to-transparent border border-[#5B13EC]/20 p-4 rounded-xl flex flex-col justify-between">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-[#5B13EC] text-xl">account_tree</span>
                                    <h3 className="text-xs font-bold text-white leading-tight">{item.title}</h3>
                                </div>
                                <div className="inline-block bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm w-max mb-3">
                                    🎯 {item.learningObject}
                                </div>
                                
                                <div className="bg-black/40 rounded-lg p-3 mb-3 border border-white/5">
                                    <p className="text-[11px] text-white/90 leading-relaxed font-semibold">{item.motionPrompt}</p>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-snug mb-4">{item.description}</p>

                                <button 
                                    onClick={() => handleStartProject(item.promptState)}
                                    className="w-full flex items-center justify-center gap-2 bg-[#5B13EC] hover:bg-[#4a0ebb] text-white text-[11px] font-bold py-2.5 rounded-lg transition-colors active:scale-95"
                                >
                                    {t.startProject}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. 움직임 디테일 학습 */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-3 bg-[#5B13EC] rounded-full"></span>
                            {t.movementLearning}
                        </h2>
                    </div>
                    <div className="flex overflow-x-auto gap-4 -mx-6 px-6 no-scrollbar snap-x pb-4">
                        {movementLearning.map(item => (
                            <div key={item.id} className="snap-start shrink-0 w-[240px] rounded-xl overflow-hidden glass-panel border border-white/10 bg-slate-900/50">
                                <div className="h-[140px] relative overflow-hidden">
                                     <img alt={item.title} className="w-full h-full object-cover opacity-70" src={item.preview} />
                                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                     <div className="absolute top-2 right-2 flex gap-1">
                                        <button className="bg-black/50 hover:bg-black/70 backdrop-blur-md p-1.5 rounded-full text-white/80 hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[12px]">bookmark</span>
                                        </button>
                                     </div>
                                </div>
                                <div className="p-4 bg-gradient-to-b from-slate-900 to-black relative z-10 border-t border-white/5">
                                    <div className="inline-block bg-teal-500/10 text-teal-300 text-[9px] font-bold px-1.5 py-0.5 rounded mb-2 w-max truncate">
                                        💡 {item.learningObject}
                                    </div>
                                    <h3 className="text-xs font-bold text-white mb-1">{item.title}</h3>
                                    <p className="text-[10px] text-slate-400 mb-3 line-clamp-2 leading-relaxed h-8">{item.description}</p>
                                    <button 
                                        onClick={() => handleStartProject(item.promptState)}
                                        className="w-full border border-[#5B13EC]/50 hover:bg-[#5B13EC]/10 text-white text-[10px] font-bold py-2 rounded active:scale-95 transition-all"
                                    >
                                        {t.startProject}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
            <BottomNav />
        </div>
    );
};

export default Explore;
