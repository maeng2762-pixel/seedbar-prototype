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
            title: "Choreography Reimagined",
            desc: 'Experience the fusion of human movement and artificial intelligence.',
            startBtn: 'Start New Creation',
            learnBtn: 'Practice & Learn',
            featured: 'Featured Works',
            viewAll: 'View all'
        },
        KR: {
            title: "창작의 경계를 넘어서다",
            desc: '인간의 움직임과 인공지능이 만나는 새로운 예술적 경험을 시작하세요.',
            startBtn: '새 프로젝트 시작하기',
            learnBtn: '연습 및 학습하기',
            featured: '추천 작품',
            viewAll: '전체 보기'
        }
    };

    const t = i18n[language] || i18n.EN;

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-hidden">
            {/* Hero Section with Background Animation/Video Placeholder */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark/20 via-background-dark/60 to-background-dark z-10"></div>
                <div
                    className="w-full h-full bg-cover bg-center opacity-60"
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

            {/* Main Content */}
            <div className="relative z-20 flex flex-col items-center justify-center flex-grow px-6 text-center">
                <h1 className="text-gradient tracking-tight text-[44px] font-extrabold leading-tight pb-2">
                    {t.title}
                </h1>
                <p className="text-slate-400 text-sm max-w-[280px] mb-10 leading-relaxed">
                    {t.desc}
                </p>
                <div className="flex flex-col gap-4 w-full max-w-[320px]">
                    <button
                        onClick={() => navigate('/ideation', { state: { mode: 'planning' } })}
                        className="flex items-center justify-between group cursor-pointer overflow-hidden rounded-xl h-14 pl-6 pr-4 bg-primary text-white text-base font-bold transition-all active:scale-95 shadow-lg shadow-primary/20">
                        <span>{t.startBtn}</span>
                        <div className="bg-white/20 rounded-lg p-1.5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">auto_awesome</span>
                        </div>
                    </button>
                    <button className="flex items-center justify-between group cursor-pointer overflow-hidden rounded-xl h-14 pl-6 pr-4 glass-panel text-white text-base font-bold transition-all active:scale-95">
                        <span>{t.learnBtn}</span>
                        <div className="bg-primary/20 rounded-lg p-1.5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl text-primary">school</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Featured Works Carousel Section */}
            <div className="relative z-20 pb-24">
                <div className="flex items-center justify-between px-6 mb-4">
                    <h3 className="text-white font-bold text-lg">{t.featured}</h3>
                    <span className="text-primary text-xs font-bold">{t.viewAll}</span>
                </div>
                <div className="flex overflow-x-auto gap-4 px-6 no-scrollbar pb-4">
                    {/* Card 1 */}
                    <div className="min-w-[160px] aspect-[3/4] rounded-xl overflow-hidden glass-panel relative group">
                        <img alt="Neon Flow" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0MrZpBDEK_y7jL8T4qVGj-CzqStkLhjU3oakguMIc0tTKjzm0kPOobI7ynzDjKtXV9zakujz8YeQXW2f57IyrfzscQJOF6ZAvR1C1mUN5h2nkrgJ0KZL3bWrNWc3wfD_zgiu3L_gqqzqMiT9xLwlcUmUID0o8-N_alFf2G9Z-F4b9p-LWB7kLlz3HFQZPB46vycMW7NADG2N656B08Ic5XANmtC3BSb5wcX8TfICK_fey5fQxQ-KAq6DtfxAy7Z0fygj8a2nFtg" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                            <p className="text-white text-xs font-bold">Neon Flow</p>
                            <p className="text-slate-400 text-[10px]">AI-Gen #042</p>
                        </div>
                        <div className="absolute top-3 right-3 glass-panel size-7 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs text-white">play_arrow</span>
                        </div>
                    </div>
                    {/* Card 2 */}
                    <div className="min-w-[160px] aspect-[3/4] rounded-xl overflow-hidden glass-panel relative group">
                        <img alt="Liquid Grace" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjNiUzAod5vPLKQymH5BkGCIOnHsELxjb7bMkqTbHFKyjflvi-bHvtTgV7TiD6WAIz_YVd3-1HEPlg6KGuk_4-BMygRWofovqZyDgzSW4T43ZKuEk5YpxPp-Fc7zelTg-Np3ASBQkvLgKS5bwVuRMACAyGyBw1lh-ysxOeIb7BDwFxQQLo4Aas0xzKfjXUpyTgQX0M7LTZGTBHI3Hh28kJYqWqt_zsFWHvQcIcsj6dVXeMAEqwIR98Rt0aDX4VGCaMo8jzcBDjYQ" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                            <p className="text-white text-xs font-bold">Liquid Grace</p>
                            <p className="text-slate-400 text-[10px]">AI-Gen #089</p>
                        </div>
                        <div className="absolute top-3 right-3 glass-panel size-7 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs text-white">play_arrow</span>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Home;
