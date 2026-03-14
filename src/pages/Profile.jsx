import React from 'react';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import LanguageToggle from '../components/LanguageToggle';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const i18n = {
    EN: {
        role: 'Contemporary Artist',
        bio: 'Exploring the intersection of fluid movement and generative algorithms. Former Soloist at Milan Dance Lab.',
        stats: ['Hours', 'Projects', 'Score'],
        achievements: 'Achievements',
        viewAll: 'View all',
        portfolio: 'My Portfolio',
        badges: ['Streak King', 'AI Pioneer', 'Quick Learner', 'Locked'],
        uploadNew: 'Upload New',
    },
    KR: {
        role: '컨템포러리 아티스트',
        bio: '유연한 움직임과 생성 알고리즘의 결합을 탐구합니다. 전 밀라노 댄스 랩 솔로이스트.',
        stats: ['활동 시간', '프로젝트', '창의 점수'],
        achievements: '달성 업적',
        viewAll: '전체 보기',
        portfolio: '나의 포트폴리오',
        badges: ['열정의 창작자', 'AI 개척자', '빠른 학습자', '잠금됨'],
        uploadNew: '새 작업 올리기',
    }
};

const Profile = () => {
    const navigate = useNavigate();
    const authUser = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const { language } = useStore();
    const t = i18n[language];

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-slate-100 antialiased overflow-x-hidden pb-24">
            <div className="relative z-20 flex items-center justify-between p-6 pt-12">
                <button className="size-10 rounded-full glass-panel flex items-center justify-center border border-white/10 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-slate-300">settings</span>
                </button>
                <LanguageToggle />
            </div>

            <div className="relative z-20 flex flex-col items-center px-6 mt-4">
                <div className="relative">
                    <div className="size-28 rounded-full border-2 border-primary p-1">
                        <img alt="User profile picture of a professional dancer" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA" />
                    </div>
                    <div className="absolute bottom-1 right-1 size-7 bg-primary rounded-full flex items-center justify-center border-2 border-background-dark">
                        <span className="material-symbols-outlined text-[14px] text-white">edit</span>
                    </div>
                </div>
                <h1 className="text-2xl font-bold mt-4">Elena Rossi</h1>
                {authUser?.email ? <p className="text-slate-400 text-xs mt-1">{authUser.email}</p> : null}
                {authUser?.plan ? <p className="text-primary text-xs mt-1 uppercase">{authUser.plan} plan</p> : null}
                <p className="text-primary text-sm font-medium">{t.role}</p>
                <p className="text-slate-400 text-xs text-center mt-3 max-w-[280px] leading-relaxed">
                    {t.bio}
                </p>
                <button
                    onClick={async () => {
                        await logout();
                        navigate('/login', { replace: true });
                    }}
                    className="mt-4 text-xs px-3 py-1.5 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10"
                >
                    {language === 'KR' ? '로그아웃' : 'Logout'}
                </button>
            </div>

            <div className="px-6 mt-8 grid grid-cols-3 gap-3">
                <div className="glass-panel rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-white font-bold text-lg">124</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t.stats[0]}</span>
                </div>
                <div className="glass-panel rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-white font-bold text-lg">18</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t.stats[1]}</span>
                </div>
                <div className="glass-panel rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-white font-bold text-lg">92%</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t.stats[2]}</span>
                </div>
            </div>

            <div className="mt-10 px-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest">{t.achievements}</h3>
                    <span className="text-primary text-xs font-bold cursor-pointer">{t.viewAll}</span>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                        <div className="size-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{t.badges[0]}</span>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                        <div className="size-14 rounded-full bg-gradient-to-br from-blue-400 to-primary p-[2px]">
                            <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{t.badges[1]}</span>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                        <div className="size-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{t.badges[2]}</span>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                        <div className="size-14 rounded-full bg-slate-700/50 p-[2px]">
                            <div className="w-full h-full rounded-full bg-background-dark/50 flex items-center justify-center opacity-40">
                                <span className="material-symbols-outlined text-slate-500">lock</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-600">{t.badges[3]}</span>
                    </div>
                </div>
            </div>

            <div className="mt-10 px-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest">{t.portfolio}</h3>
                    <div className="flex gap-2">
                        <span className="material-symbols-outlined text-primary text-xl cursor-pointer">grid_view</span>
                        <span className="material-symbols-outlined text-slate-500 text-xl cursor-pointer">reorder</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden glass-panel relative group">
                        <img alt="Choreography Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0MrZpBDEK_y7jL8T4qVGj-CzqStkLhjU3oakguMIc0tTKjzm0kPOobI7ynzDjKtXV9zakujz8YeQXW2f57IyrfzscQJOF6ZAvR1C1mUN5h2nkrgJ0KZL3bWrNWc3wfD_zgiu3L_gqqzqMiT9xLwlcUmUID0o8-N_alFf2G9Z-F4b9p-LWB7kLlz3HFQZPB46vycMW7NADG2N656B08Ic5XANmtC3BSb5wcX8TfICK_fey5fQxQ-KAq6DtfxAy7Z0fygj8a2nFtg" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                            <p className="text-white text-xs font-bold">Midnight Pulse</p>
                            <p className="text-slate-400 text-[10px]">Jan 12, 2024</p>
                        </div>
                    </div>
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden glass-panel relative group">
                        <img alt="Choreography Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjNiUzAod5vPLKQymH5BkGCIOnHsELxjb7bMkqTbHFKyjflvi-bHvtTgV7TiD6WAIz_YVd3-1HEPlg6KGuk_4-BMygRWofovqZyDgzSW4T43ZKuEk5YpxPp-Fc7zelTg-Np3ASBQkvLgKS5bwVuRMACAyGyBw1lh-ysxOeIb7BDwFxQQLo4Aas0xzKfjXUpyTgQX0M7LTZGTBHI3Hh28kJYqWqt_zsFWHvQcIcsj6dVXeMAEqwIR98Rt0aDX4VGCaMo8jzcBDjYQ" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                            <p className="text-white text-xs font-bold">Aether Flow</p>
                            <p className="text-slate-400 text-[10px]">Dec 28, 2023</p>
                        </div>
                    </div>
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden glass-panel relative group">
                        <img alt="Choreography Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATo1NG19Rt5g4x2eojodNB3BkIRKGKoIRirHCzAi4iyB950KaYecpg36Z3PIsukW4FF6kTJlZOHEwp8TD4Acbn71FyFSIjhye2NW3YpK6U9Q--xB0YPiZUjfzAyFhTsX64cJDqqml39-UzNDPCKKzFhZHk0nYCdC0gXwxwP6UJLH9CSsW-3NSj7UTBjYpLhy90P3zrUwgxdKHDB-8-UFT-Ncw3f2e6Xh8pmSRfTCjuL4iKOrMatIbg5IoAknwdKrSXlJ_-Hullbg" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                            <p className="text-white text-xs font-bold">Kinetic Soul</p>
                            <p className="text-slate-400 text-[10px]">Dec 15, 2023</p>
                        </div>
                    </div>
                    <div className="aspect-[4/5] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 group cursor-pointer active:bg-slate-800/20 transition-colors">
                        <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">add</span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">{t.uploadNew}</span>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Profile;
