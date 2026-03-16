import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import LanguageToggle from '../components/LanguageToggle';

const Home = () => {
    const navigate = useNavigate();
    const { language } = useStore();

    const i18n = {
        EN: {
            continuePreview: 'Continue Project',
            lastEdited: 'Last edited: ',
            continueBtn: 'Continue Editing',
            title: "Choreography Reimagined",
            desc: 'Experience the fusion of human movement and artificial intelligence.',
            startBtn: 'Start New Creation',
            learnBtn: 'Practice & Learn',
            aiInspiration: 'Today\'s AI Inspiration',
            genIdeaBtn: 'Generate Idea',
            featured: 'Featured Works',
            viewAll: 'View all',
            save: 'Save',
            remix: 'Remix'
        },
        KR: {
            continuePreview: '최근 작업 이어하기',
            lastEdited: '마지막 수정: ',
            continueBtn: '계속 작업하기',
            title: "창작의 경계를 넘어서다",
            desc: '인간의 움직임과 인공지능이 만나는 새로운 예술적 경험을 시작하세요.',
            startBtn: '새 프로젝트 시작하기',
            learnBtn: '연습 및 학습하기',
            aiInspiration: '오늘의 AI 영감',
            genIdeaBtn: '아이디어 생성',
            featured: '추천 작품',
            viewAll: '전체 보기',
            save: '보관함에 저장',
            remix: '이 안무로 리믹스'
        }
    };

    const t = i18n[language] || i18n.EN;

    const recentProject = {
        id: 'mock-1',
        title: 'Liquid Grace Draft',
        time: '2 hours ago',
        timeKo: '2시간 전',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATo1NG19Rt5g4x2eojodNB3BkIRKGKoIRirHCzAi4iyB950KaYecpg36Z3PIsukW4FF6kTJlZOHEwp8TD4Acbn71FyFSIjhye2NW3YpK6U9Q--xB0YPiZUjfzAyFhTsX64cJDqqml39-UzNDPCKKzFhZHk0nYCdC0gXwxwP6UJLH9CSsW-3NSj7UTBjYpLhy90P3zrUwgxdKHDB-8-UFT-Ncw3f2e6Xh8pmSRfTCjuL4iKOrMatIbg5IoAknwdKrSXlJ_-Hullbg'
    };

    const aiInspirations = [
        { id: 'ai1', title: language === 'KR' ? '감정 기반 움직임' : 'Emotion-based Movement', icon: 'favorite', prompt: { moodKeywords: ['#Emotional'] } },
        { id: 'ai2', title: language === 'KR' ? '공간 중심 안무 아이디어' : 'Space-centric Choreography', icon: 'view_in_ar', prompt: { moodKeywords: ['#Spatial', '#Formation'] } },
        { id: 'ai3', title: language === 'KR' ? '리듬 기반 움직임' : 'Rhythm-based Movement', icon: 'graphic_eq', prompt: { moodKeywords: ['#Rhythmic', '#Dynamic'] } }
    ];

    const featuredWorks = [
        {
            id: 'f1', title: 'Neon Flow', author: 'AI-Gen #042',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0MrZpBDEK_y7jL8T4qVGj-CzqStkLhjU3oakguMIc0tTKjzm0kPOobI7ynzDjKtXV9zakujz8YeQXW2f57IyrfzscQJOF6ZAvR1C1mUN5h2nkrgJ0KZL3bWrNWc3wfD_zgiu3L_gqqzqMiT9xLwlcUmUID0o8-N_alFf2G9Z-F4b9p-LWB7kLlz3HFQZPB46vycMW7NADG2N656B08Ic5XANmtC3BSb5wcX8TfICK_fey5fQxQ-KAq6DtfxAy7Z0fygj8a2nFtg',
            promptState: { genre: 'Contemporary', moodKeywords: ['#Neon', '#Flow'] }
        },
        {
            id: 'f2', title: 'Liquid Grace', author: 'AI-Gen #089',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjNiUzAod5vPLKQymH5BkGCIOnHsELxjb7bMkqTbHFKyjflvi-bHvtTgV7TiD6WAIz_YVd3-1HEPlg6KGuk_4-BMygRWofovqZyDgzSW4T43ZKuEk5YpxPp-Fc7zelTg-Np3ASBQkvLgKS5bwVuRMACAyGyBw1lh-ysxOeIb7BDwFxQQLo4Aas0xzKfjXUpyTgQX0M7LTZGTBHI3Hh28kJYqWqt_zsFWHvQcIcsj6dVXeMAEqwIR98Rt0aDX4VGCaMo8jzcBDjYQ',
            promptState: { genre: 'Lyrical', moodKeywords: ['#Liquid', '#Grace'] }
        }
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-x-hidden overflow-y-auto">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark/20 via-background-dark/90 to-background-dark z-10 transition-colors"></div>
                <div
                    className="w-full h-full bg-cover bg-center opacity-40 pointer-events-none"
                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCXE6qwdSbDPutfwDiB8LNKFdhyPW_6OieztmmDYe9pIt16MwqRkgh96rhamNL8WoC6xc-bfab9azEywq5MPi1KWDyZ4NMCUu2fMBkjgSY8eUSPAhVxH_PtrV6jeJBRgLqq4D1mOmWLYzG0ISE8R3zGnMJMfExiEaMQilJ8-R9QqKq6t8WN3KtoPfSXF4mlKCWtr1Xi46UqdQu7QZ_-KxTdeq-ED5MFDU4dTE8mihi5TIaxePzV1_zwUbqsoiEEFzo1V4viC4_cbA')` }}>
                </div>
            </div>

            {/* Top Navigation Area */}
            <div className="relative z-20 flex items-center justify-between p-6 pt-12">
                <div className="flex items-center gap-2">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <span className="material-symbols-outlined text-primary text-xl">temp_preferences_custom</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <div className="size-10 rounded-full border-2 border-primary/50 overflow-hidden shadow-[0_0_10px_rgba(91,19,236,0.3)]">
                        <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA" />
                    </div>
                </div>
            </div>

            {/* Main Content Scrollable Area */}
            <div className="relative z-20 px-6 pb-28 space-y-8 mt-2">
                
                {/* 1. Continue Project */}
                <section>
                    <h2 className="text-sm font-bold text-white mb-3 tracking-wide">{t.continuePreview}</h2>
                    <div className="glass-panel p-3 rounded-2xl flex items-center gap-4 bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                        <img src={recentProject.thumbnail} alt={recentProject.title} className="size-16 rounded-xl object-cover opacity-80" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white text-base font-bold truncate">{recentProject.title}</h3>
                            <p className="text-slate-400 text-[10px] mt-1">{t.lastEdited}{language === 'KR' ? recentProject.timeKo : recentProject.time}</p>
                        </div>
                        <button 
                            onClick={() => navigate(`/ideation?projectId=${recentProject.id}`, { state: { mode: 'draft' } })}
                            className="shrink-0 bg-primary/90 hover:bg-primary text-white text-[10px] font-bold py-2 px-3 rounded-xl transition-all active:scale-95 shadow-md shadow-primary/30"
                        >
                            {t.continueBtn}
                        </button>
                    </div>
                </section>

                {/* Hero / Main CTAs */}
                <section className="text-center py-6">
                    <h1 className="text-gradient tracking-tight text-4xl font-extrabold leading-tight pb-2 drop-shadow-lg">
                        {t.title}
                    </h1>
                    <p className="text-slate-300 text-sm max-w-[280px] mx-auto mb-8 leading-relaxed font-medium drop-shadow-md">
                        {t.desc}
                    </p>
                    <div className="flex flex-col gap-4 w-full max-w-[320px] mx-auto">
                        <button
                            onClick={() => navigate('/ideation', { state: { mode: 'planning' } })}
                            className="flex items-center justify-between group cursor-pointer overflow-hidden rounded-xl h-14 pl-6 pr-4 bg-primary text-white text-base font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(91,19,236,0.5)] hover:shadow-primary/80">
                            <span>{t.startBtn}</span>
                            <div className="bg-white/20 rounded-lg p-1.5 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                            </div>
                        </button>
                        <button className="flex items-center justify-between group cursor-pointer overflow-hidden rounded-xl h-14 pl-6 pr-4 glass-panel bg-white/10 text-white text-base font-bold transition-all active:scale-95 border border-white/10">
                            <span>{t.learnBtn}</span>
                            <div className="bg-primary/30 rounded-lg p-1.5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl text-primary-light">school</span>
                            </div>
                        </button>
                    </div>
                </section>

                {/* 2. AI Inspiration */}
                <section>
                    <h2 className="text-sm font-bold text-white mb-3 tracking-wide">{t.aiInspiration}</h2>
                    <div className="grid grid-cols-1 gap-2">
                        {aiInspirations.map(item => (
                            <div key={item.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between group bg-white/5 border border-white/10 hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/30 transition-all">
                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    </div>
                                    <span className="text-white text-sm font-medium tracking-wide">{item.title}</span>
                                </div>
                                <button 
                                    onClick={() => navigate('/ideation', { state: { mode: 'create', ...item.prompt } })}
                                    className="border border-primary/50 text-primary hover:bg-primary/20 text-[10px] font-bold py-1.5 px-3 rounded-lg transition-colors active:scale-95"
                                >
                                    {t.genIdeaBtn}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Featured Works */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-sm tracking-wide">{t.featured}</h3>
                        <span className="text-primary text-[10px] font-bold cursor-pointer hover:text-primary-hover">{t.viewAll}</span>
                    </div>
                    <div className="flex overflow-x-auto gap-4 -mx-6 px-6 no-scrollbar snap-x pb-2">
                        {featuredWorks.map(work => (
                            <div key={work.id} className="snap-start min-w-[240px] rounded-2xl overflow-hidden glass-panel relative group bg-white/5 border border-white/10 shadow-lg">
                                <div className="aspect-[4/3] w-full relative overflow-hidden">
                                    <img alt={work.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" src={work.image} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/30 to-transparent"></div>
                                    <div className="absolute top-3 right-3 bg-white/20 hover:bg-primary transition-colors backdrop-blur-md size-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95 border border-white/20">
                                        <span className="material-symbols-outlined text-base text-white">play_arrow</span>
                                    </div>
                                </div>
                                <div className="p-4 relative z-10 -mt-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-white text-base font-bold truncate tracking-tight">{work.title}</p>
                                            <p className="text-slate-400 text-[10px] mt-0.5">{work.author}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => navigate('/ideation', { state: { mode: 'create', ...work.promptState } })}
                                            className="flex-1 bg-primary/20 border border-primary/30 hover:bg-primary/40 text-primary text-[10px] font-bold py-2 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                                            {t.remix}
                                        </button>
                                        <button 
                                            className="size-8 shrink-0 bg-white/5 hover:bg-white/20 border border-white/10 flex items-center justify-center rounded-xl transition-colors active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-slate-300">bookmark_add</span>
                                        </button>
                                    </div>
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

export default Home;
