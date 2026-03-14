import React from 'react';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import LanguageToggle from '../components/LanguageToggle';
import useChoreographyStudioStore from '../store/useChoreographyStudioStore';
import { useNavigate } from 'react-router-dom';

const i18n = {
    EN: {
        title: 'Creative Library',
        recent: 'Recently Exported',
        seeAll: 'See all',
        tabs: ['Projects', 'Moodboards', 'Presentations'],
        stats: { choreography: 'Choreography', active: 'Active', ppt: 'Automated PPT', moodboard: 'Moodboard' },
        edited: 'Edited',
    },
    KR: {
        title: '나의 보관함',
        recent: '최근 내보낸 항목',
        seeAll: '전체 보기',
        tabs: ['프로젝트', '무드보드', '발표 문서'],
        stats: { choreography: '안무 구성', active: '작업 중', ppt: 'AI PPT 문서', moodboard: '무드보드' },
        edited: '수정됨',
    }
};

const Library = () => {
    const navigate = useNavigate();
    const { language } = useStore();
    const t = i18n[language];
    const { projects, listProjects, deleteProject, setProjectId } = useChoreographyStudioStore();

    React.useEffect(() => {
        listProjects().catch(() => {});
    }, [listProjects]);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-slate-100 antialiased overflow-x-hidden pb-24">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] size-80 bg-primary/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] size-80 bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-20 flex items-center justify-between p-6 pt-12">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl glass-panel flex items-center justify-center border border-white/10">
                        <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <div className="size-10 rounded-full border-2 border-primary/30 overflow-hidden shadow-[0_0_10px_rgba(91,19,236,0.3)]">
                        <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA" />
                    </div>
                </div>
            </div>

            <div className="relative z-20 mt-4">
                <div className="px-6 mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                        {language === 'KR' ? '내 프로젝트' : 'My Projects'}
                    </h2>
                </div>
                <div className="px-6 mb-6 grid grid-cols-1 gap-3">
                    {projects.length === 0 ? (
                        <div className="glass-panel p-4 rounded-2xl text-xs text-slate-400">
                            {language === 'KR' ? '저장된 프로젝트가 없습니다.' : 'No saved projects yet.'}
                        </div>
                    ) : projects.map((project) => (
                        <div key={project.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-3">
                            <button
                                onClick={() => {
                                    setProjectId(project.id);
                                    navigate('/ideation', { state: { mode: 'draft' } });
                                }}
                                className="text-left flex-1 min-w-0"
                            >
                                <p className="text-sm font-bold text-white truncate">{project.title}</p>
                                <p className="text-[11px] text-slate-400">
                                    Team {project.teamSize} • {new Date(project.updatedAt).toLocaleString()}
                                </p>
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await deleteProject(project.id);
                                    } catch {
                                        // noop
                                    }
                                }}
                                className="text-[11px] px-3 py-1 rounded-lg border border-rose-400/40 text-rose-300 hover:bg-rose-500/10"
                            >
                                {language === 'KR' ? '삭제' : 'Delete'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="px-6 mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.recent}</h2>
                    <span className="text-primary text-xs font-bold cursor-pointer">{t.seeAll}</span>
                </div>
                <div className="flex overflow-x-auto gap-3 px-6 no-scrollbar pb-2">
                    <div className="min-w-[140px] p-3 rounded-2xl glass-panel flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform">
                        <div className="aspect-video rounded-lg overflow-hidden relative">
                            <img alt="Thumbnail" className="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0MrZpBDEK_y7jL8T4qVGj-CzqStkLhjU3oakguMIc0tTKjzm0kPOobI7ynzDjKtXV9zakujz8YeQXW2f57IyrfzscQJOF6ZAvR1C1mUN5h2nkrgJ0KZL3bWrNWc3wfD_zgiu3L_gqqzqMiT9xLwlcUmUID0o8-N_alFf2G9Z-F4b9p-LWB7kLlz3HFQZPB46vycMW7NADG2N656B08Ic5XANmtC3BSb5wcX8TfICK_fey5fQxQ-KAq6DtfxAy7Z0fygj8a2nFtg" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white/80">play_circle</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white truncate">Final_Solo_v2</p>
                            <p className="text-[10px] text-slate-500">.mp4 • 24MB</p>
                        </div>
                    </div>
                    <div className="min-w-[140px] p-3 rounded-2xl glass-panel flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform">
                        <div className="aspect-video rounded-lg bg-white/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary/60 text-3xl">3d_rotation</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white truncate">Rigged_Model_A</p>
                            <p className="text-[10px] text-slate-500">.gltf • 8.4MB</p>
                        </div>
                    </div>
                    <div className="min-w-[140px] p-3 rounded-2xl glass-panel flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform">
                        <div className="aspect-video rounded-lg overflow-hidden relative">
                            <img alt="Thumbnail" className="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATo1NG19Rt5g4x2eojodNB3BkIRKGKoIRirHCzAi4iyB950KaYecpg36Z3PIsukW4FF6kTJlZOHEwp8TD4Acbn71FyFSIjhye2NW3YpK6U9Q--xB0YPiZUjfzAyFhTsX64cJDqqml39-UzNDPCKKzFhZHk0nYCdC0gXwxwP6UJLH9CSsW-3NSj7UTBjYpLhy90P3zrUwgxdKHDB-8-UFT-Ncw3f2e6Xh8pmSRfTCjuL4iKOrMatIbg5IoAknwdKrSXlJ_-Hullbg" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white/80">play_circle</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white truncate">Teaser_Draft</p>
                            <p className="text-[10px] text-slate-500">.mp4 • 12MB</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-20 px-6 mt-8">
                <div className="flex gap-6 border-b border-white/5 pb-2 mb-6 cursor-pointer">
                    <button className="text-white font-bold text-sm relative">
                        {t.tabs[0]}
                        <span className="absolute -bottom-[10px] left-0 w-full h-0.5 bg-primary"></span>
                    </button>
                    <button className="text-slate-500 font-medium text-sm">{t.tabs[1]}</button>
                    <button className="text-slate-500 font-medium text-sm">{t.tabs[2]}</button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform">
                        <div className="size-20 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-white/5">
                            <img alt="Thumb" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjNiUzAod5vPLKQymH5BkGCIOnHsELxjb7bMkqTbHFKyjflvi-bHvtTgV7TiD6WAIz_YVd3-1HEPlg6KGuk_4-BMygRWofovqZyDgzSW4T43ZKuEk5YpxPp-Fc7zelTg-Np3ASBQkvLgKS5bwVuRMACAyGyBw1lh-ysxOeIb7BDwFxQQLo4Aas0xzKfjXUpyTgQX0M7LTZGTBHI3Hh28kJYqWqt_zsFWHvQcIcsj6dVXeMAEqwIR98Rt0aDX4VGCaMo8jzcBDjYQ" />
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-bold text-white truncate">Urban Flow AI Study</h3>
                                <span className="material-symbols-outlined text-slate-500 text-lg">more_vert</span>
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                {t.edited} 2h ago
                            </p>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider">{t.stats.choreography}</span>
                                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider">{t.stats.active}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform">
                        <div className="size-20 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-white/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-3xl">drive_presentation</span>
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-bold text-white truncate">Production Pitch Deck</h3>
                                <span className="material-symbols-outlined text-slate-500 text-lg">more_vert</span>
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                {t.edited} Oct 24
                            </p>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[9px] font-bold uppercase tracking-wider">{t.stats.ppt}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform">
                        <div className="size-20 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-white/5">
                            <img alt="Thumb" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXE6qwdSbDPutfwDiB8LNKFdhyPW_6OieztmmDYe9pIt16MwqRkgh96rhamNL8WoC6xc-bfab9azEywq5MPi1KWDyZ4NMCUu2fMBkjgSY8eUSPAhVxH_PtrV6jeJBRgLqq4D1mOmWLYzG0ISE8R3zGnMJMfExiEaMQilJ8-R9QqKq6t8WN3KtoPfSXF4mlKCWtr1Xi46UqdQu7QZ_-KxTdeq-ED5MFDU4dTE8mihi5TIaxePzV1_zwUbqsoiEEFzo1V4viC4_cbA" />
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-bold text-white truncate">Midnight Silhouette</h3>
                                <span className="material-symbols-outlined text-slate-500 text-lg">more_vert</span>
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                {t.edited} 2 days ago
                            </p>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider">{t.stats.moodboard}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Library;
