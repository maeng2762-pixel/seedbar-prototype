import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const i18n = {
    EN: { 
        home: 'Home', explore: 'Explore', library: 'Library', profile: 'Profile',
        newProject: 'New Choreography Project',
        aiIdea: 'Generate AI Choreography Idea',
        improvise: 'Start Improvisation Prompt',
        importMotion: 'Import Video/Motion Data'
    },
    KR: { 
        home: '홈', explore: '탐색', library: '보관함', profile: '프로필',
        newProject: '새 안무 프로젝트 생성',
        aiIdea: 'AI 안무 아이디어 생성',
        improvise: '즉흥 움직임 프롬프트 시작',
        importMotion: '영상 또는 모션 데이터 불러오기'
    },
};

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useStore();
    const t = i18n[language] || i18n.EN;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    return (
        <React.Fragment>
            <AnimatePresence>
                {isModalOpen && (
                    <React.Fragment>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-background-dark/80 backdrop-blur-sm z-[55] pointer-events-auto"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            className="fixed bottom-28 left-4 right-4 z-[60] bg-slate-900 border border-white/10 rounded-2xl p-2 pointer-events-auto shadow-[0_0_30px_rgba(91,19,236,0.15)] glass-panel"
                        >
                            <button className="w-full flex items-center gap-3 p-4 bg-primary/20 hover:bg-primary/30 rounded-xl mb-1 transition-colors group" onClick={() => { setIsModalOpen(false); navigate('/ideation', { state: { mode: 'planning' } }); }}>
                                <div className="size-8 rounded-lg bg-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[20px]">add_box</span>
                                </div>
                                <span className="text-white text-sm font-bold tracking-tight">{t.newProject}</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-xl transition-colors group" onClick={() => { setIsModalOpen(false); navigate('/explore'); }}>
                                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
                                </div>
                                <span className="text-slate-200 text-sm font-medium tracking-tight group-hover:text-white transition-colors">{t.aiIdea}</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-xl transition-colors group" onClick={() => setIsModalOpen(false)}>
                                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">directions_run</span>
                                </div>
                                <span className="text-slate-200 text-sm font-medium tracking-tight group-hover:text-white transition-colors">{t.improvise}</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-xl transition-colors group" onClick={() => setIsModalOpen(false)}>
                                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">video_library</span>
                                </div>
                                <span className="text-slate-200 text-sm font-medium tracking-tight group-hover:text-white transition-colors">{t.importMotion}</span>
                            </button>
                        </motion.div>
                    </React.Fragment>
                )}
            </AnimatePresence>

            <div className="fixed bottom-0 w-full z-50 pb-5 px-4 pointer-events-none">
                <div className="glass-panel rounded-full h-16 flex items-center justify-around px-2 border-white/10 pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    {/* Home */}
                    <button
                        onClick={() => navigate('/home')}
                        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${isActive('/home') ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span className="material-symbols-outlined text-[22px]" style={isActive('/home') ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
                        <span className="text-[9px] font-bold tracking-wide">{t.home}</span>
                    </button>

                    {/* Explore */}
                    <button
                        onClick={() => navigate('/explore')}
                        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${isActive('/explore') ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span className="material-symbols-outlined text-[22px]" style={isActive('/explore') ? { fontVariationSettings: "'FILL' 1" } : {}}>explore</span>
                        <span className="text-[9px] font-bold tracking-wide">{t.explore}</span>
                    </button>

                    {/* Center FAB */}
                    <div className="flex-1 flex justify-center -mt-10">
                        <button
                            onClick={() => setIsModalOpen(!isModalOpen)}
                            className={`size-14 rounded-full flex items-center justify-center shadow-lg border-4 border-background-dark active:scale-95 transition-all duration-300 ${isModalOpen ? 'bg-background-dark text-white border-primary rotate-45' : 'bg-primary text-white shadow-primary/40'}`}
                            aria-label="Create Menu"
                        >
                            <span className="material-symbols-outlined text-3xl">add</span>
                        </button>
                    </div>

                    {/* Library */}
                    <button
                        onClick={() => navigate('/library')}
                        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${isActive('/library') ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span className="material-symbols-outlined text-[22px]" style={isActive('/library') ? { fontVariationSettings: "'FILL' 1" } : {}}>movie</span>
                        <span className="text-[9px] font-bold tracking-wide">{t.library}</span>
                    </button>

                    {/* Profile */}
                    <button
                        onClick={() => navigate('/profile')}
                        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${isActive('/profile') ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span className="material-symbols-outlined text-[22px]" style={isActive('/profile') ? { fontVariationSettings: "'FILL' 1" } : {}}>person</span>
                        <span className="text-[9px] font-bold tracking-wide">{t.profile}</span>
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
};

export default BottomNav;
