import React, { useState } from 'react';
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
        styleAnalysis: 'Creative Style Analysis',
        styleTraits: {
            movement: { label: 'Movement Style', value: 'Fluid & Grounded' },
            rhythm: { label: 'Rhythm Pattern', value: 'Dynamic Syncopation' },
            space: { label: 'Space Utilization', value: 'Wide Diagonal' }
        },
        scoreDetail: 'Creative Score Detail',
        scoreMetrics: {
            originality: 'Originality',
            complexity: 'Movement Complexity',
            structure: 'Structural Completeness'
        },
        achievements: 'Achievements',
        viewAll: 'View all',
        portfolio: 'My Portfolio',
        badges: ['First Project', '10 Projects', 'AI Master', 'Improv Expert'],
        uploadNew: 'Upload New',
        exportPortfolio: 'Export Portfolio',
        exportOptions: {
            pdf: 'PDF Document',
            video: 'Video Reel',
            presentation: 'Presentation'
        }
    },
    KR: {
        role: '컨템포러리 아티스트',
        bio: '유연한 움직임과 생성 알고리즘의 결합을 탐구합니다. 전 밀라노 댄스 랩 솔로이스트.',
        stats: ['활동 시간', '프로젝트', '창의 점수'],
        styleAnalysis: '창작 스타일 분석',
        styleTraits: {
            movement: { label: '움직임 스타일', value: '유연하고 무게감 있는 스타일' },
            rhythm: { label: '리듬 사용 패턴', value: '다이나믹한 당김음 위주' },
            space: { label: '공간 활용 방식', value: '넓은 대각선 동선 집중 활용' }
        },
        scoreDetail: '창의 점수 상세 분석',
        scoreMetrics: {
            originality: '독창성',
            complexity: '움직임 복잡도',
            structure: '구조 완성도'
        },
        achievements: '달성 업적',
        viewAll: '전체 보기',
        portfolio: '나의 포트폴리오',
        badges: ['첫 안무 프로젝트', '프로젝트 10개', 'AI 협업 마스터', '즉흥 안무 전문가'],
        uploadNew: '새 작업 올리기',
        exportPortfolio: '포트폴리오 내보내기',
        exportOptions: {
            pdf: 'PDF 내보내기',
            video: '영상 릴 형식',
            presentation: '발표 프레젠테이션'
        }
    }
};

const Profile = () => {
    const navigate = useNavigate();
    const authUser = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const { language } = useStore();
    const t = i18n[language];
    const [showExportMenu, setShowExportMenu] = useState(false);

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

            <div className="mt-8 px-6">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 inline-flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
                    {t.styleAnalysis}
                </h3>
                <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3 border border-white/5">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{t.styleTraits.movement.label}</span>
                        <span className="text-sm text-white font-semibold">{t.styleTraits.movement.value}</span>
                    </div>
                    <div className="h-[1px] w-full bg-white/10 my-1"></div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{t.styleTraits.rhythm.label}</span>
                        <span className="text-sm text-white font-semibold">{t.styleTraits.rhythm.value}</span>
                    </div>
                    <div className="h-[1px] w-full bg-white/10 my-1"></div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{t.styleTraits.space.label}</span>
                        <span className="text-sm text-white font-semibold">{t.styleTraits.space.value}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 px-6">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 inline-flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-400 text-[18px]">radar</span>
                    {t.scoreDetail}
                </h3>
                <div className="glass-panel rounded-2xl p-5 flex flex-col gap-5 border border-white/5">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs text-slate-300 font-bold">{t.scoreMetrics.originality}</span>
                            <span className="text-xs text-primary-light font-bold">95</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary to-purple-400 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs text-slate-300 font-bold">{t.scoreMetrics.complexity}</span>
                            <span className="text-xs text-teal-300 font-bold">88</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs text-slate-300 font-bold">{t.scoreMetrics.structure}</span>
                            <span className="text-xs text-blue-300 font-bold">92</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 px-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400 text-[18px]">workspace_premium</span>
                        {t.achievements}
                    </h3>
                    <span className="text-primary text-xs font-bold cursor-pointer">{t.viewAll}</span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                    <div className="flex-shrink-0 flex flex-col items-center gap-2 w-[72px]">
                        <div className="size-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">{t.badges[0]}</span>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center gap-2 w-[72px]">
                        <div className="size-14 rounded-full bg-gradient-to-br from-blue-400 to-primary p-[2px]">
                            <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>library_add_check</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">{t.badges[1]}</span>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center gap-2 w-[72px]">
                        <div className="size-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">{t.badges[2]}</span>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center gap-2 w-[72px]">
                        <div className="size-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-400" style={{ fontVariationSettings: "'FILL' 1" }}>self_improvement</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">{t.badges[3]}</span>
                    </div>
                </div>
            </div>

            <div className="mt-10 px-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400 text-[18px]">folder_special</span>
                        {t.portfolio}
                    </h3>
                    <div className="relative">
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-1 text-[11px] bg-primary/20 text-primary-light px-3 py-1.5 rounded-full font-bold hover:bg-primary/30 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-[15px]">ios_share</span>
                            {t.exportPortfolio}
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-30 overflow-hidden">
                                <button 
                                    onClick={() => {
                                        setShowExportMenu(false);
                                        alert(language === 'KR' ? 'PDF 형식으로 내보냅니다.' : 'Exporting as PDF...');
                                    }}
                                    className="w-full text-left px-4 py-3 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 font-medium"
                                >
                                    <span className="material-symbols-outlined text-[16px] text-rose-400">picture_as_pdf</span>
                                    {t.exportOptions.pdf}
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowExportMenu(false);
                                        alert(language === 'KR' ? '영상 릴을 조합 중입니다.' : 'Generating video reel...');
                                    }}
                                    className="w-full text-left px-4 py-3 text-xs text-slate-200 hover:bg-white/5 border-t border-white/5 flex items-center gap-2 font-medium"
                                >
                                    <span className="material-symbols-outlined text-[16px] text-emerald-400">movie</span>
                                    {t.exportOptions.video}
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowExportMenu(false);
                                        alert(language === 'KR' ? '발표 문서를 구성합니다.' : 'Creating presentation layout...');
                                    }}
                                    className="w-full text-left px-4 py-3 text-xs text-slate-200 hover:bg-white/5 border-t border-white/5 flex items-center gap-2 font-medium"
                                >
                                    <span className="material-symbols-outlined text-[16px] text-blue-400">co_present</span>
                                    {t.exportOptions.presentation}
                                </button>
                            </div>
                        )}
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
