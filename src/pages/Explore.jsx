import React from 'react';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import LanguageToggle from '../components/LanguageToggle';

const i18n = {
    EN: {
        title: 'Discovery',
        search: 'Search choreography, dancers...',
        categories: ['All', 'Contemporary', 'Hip-hop', 'Ballet', 'Jazz', 'Experimental'],
        featuredArtist: 'Featured Artist:',
        trending: 'Trending',
        badge3d: '3D Model',
        createOwn: 'Create your own movement',
    },
    KR: {
        title: '탐색하기',
        search: '안무, 댄서 검색...',
        categories: ['전체', '컨템포러리', '힙합', '발레', '재즈', '실험예술'],
        featuredArtist: '이주의 아티스트:',
        trending: '트렌딩',
        badge3d: '3D 모델',
        createOwn: '나만의 움직임 만들기',
    }
};

const Explore = () => {
    const { language } = useStore();
    const t = i18n[language];

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-slate-100 antialiased overflow-x-hidden pb-28">
            <div className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md pt-12 pb-4 px-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-extrabold tracking-tight text-white">{t.title}</h1>
                    <div className="flex items-center gap-3">
                        <LanguageToggle />
                        <div className="size-8 rounded-full border border-primary/30 overflow-hidden shadow-[0_0_10px_rgba(91,19,236,0.3)]">
                            <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA" />
                        </div>
                    </div>
                </div>
                <div className="relative mb-6">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input className="w-full h-12 pl-12 pr-4 bg-slate-800/40 border border-white/10 rounded-2xl text-sm focus:ring-1 focus:ring-primary/50 text-white placeholder:text-slate-500 glass-panel tracking-tight" placeholder={t.search} type="text" />
                </div>
                <div className="flex overflow-x-auto gap-2 no-scrollbar -mx-6 px-6">
                    {t.categories.map((cat, idx) => (
                        <button key={idx} className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform ${idx === 0 ? 'bg-primary text-white' : 'glass-panel text-slate-300 font-medium'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 mt-4">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .masonry-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        grid-auto-rows: 100px;
                        gap: 12px;
                    }
                    .item-tall { grid-row: span 3; }
                    .item-short { grid-row: span 2; }
                `}} />

                <div className="masonry-grid">
                    {/* Item 1 */}
                    <div className="item-tall relative rounded-2xl overflow-hidden glass-panel group">
                        <img alt="Dance movement" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXE6qwdSbDPutfwDiB8LNKFdhyPW_6OieztmmDYe9pIt16MwqRkgh96rhamNL8WoC6xc-bfab9azEywq5MPi1KWDyZ4NMCUu2fMBkjgSY8eUSPAhVxH_PtrV6jeJBRgLqq4D1mOmWLYzG0ISE8R3zGnMJMfExiEaMQilJ8-R9QqKq6t8WN3KtoPfSXF4mlKCWtr1Xi46UqdQu7QZ_-KxTdeq-ED5MFDU4dTE8mihi5TIaxePzV1_zwUbqsoiEEFzo1V4viC4_cbA" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                        <div className="absolute top-3 left-3 flex gap-1">
                            <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">{t.badge3d}</div>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white text-xs font-bold truncate">Urban Kinetic</p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-[10px] text-primary">auto_awesome</span>
                                <p className="text-slate-400 text-[9px]">@leo_dance</p>
                            </div>
                        </div>
                    </div>
                    {/* Item 2 */}
                    <div className="item-short relative rounded-2xl overflow-hidden glass-panel group">
                        <img alt="Dance movement" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0MrZpBDEK_y7jL8T4qVGj-CzqStkLhjU3oakguMIc0tTKjzm0kPOobI7ynzDjKtXV9zakujz8YeQXW2f57IyrfzscQJOF6ZAvR1C1mUN5h2nkrgJ0KZL3bWrNWc3wfD_zgiu3L_gqqzqMiT9xLwlcUmUID0o8-N_alFf2G9Z-F4b9p-LWB7kLlz3HFQZPB46vycMW7NADG2N656B08Ic5XANmtC3BSb5wcX8TfICK_fey5fQxQ-KAq6DtfxAy7Z0fygj8a2nFtg" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white text-xs font-bold truncate">Neon Pulse</p>
                            <p className="text-slate-400 text-[9px] mt-0.5">@mira_ai</p>
                        </div>
                    </div>
                    {/* Item 3 */}
                    <div className="item-short relative rounded-2xl overflow-hidden glass-panel group">
                        <img alt="Dance movement" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjNiUzAod5vPLKQymH5BkGCIOnHsELxjb7bMkqTbHFKyjflvi-bHvtTgV7TiD6WAIz_YVd3-1HEPlg6KGuk_4-BMygRWofovqZyDgzSW4T43ZKuEk5YpxPp-Fc7zelTg-Np3ASBQkvLgKS5bwVuRMACAyGyBw1lh-ysxOeIb7BDwFxQQLo4Aas0xzKfjXUpyTgQX0M7LTZGTBHI3Hh28kJYqWqt_zsFWHvQcIcsj6dVXeMAEqwIR98Rt0aDX4VGCaMo8jzcBDjYQ" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white text-xs font-bold truncate">Fluidity #9</p>
                            <p className="text-slate-400 text-[9px] mt-0.5">@flux_dancer</p>
                        </div>
                    </div>
                    {/* Item 4 */}
                    <div className="item-tall relative rounded-2xl overflow-hidden glass-panel group">
                        <img alt="Dance movement" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATo1NG19Rt5g4x2eojodNB3BkIRKGKoIRirHCzAi4iyB950KaYecpg36Z3PIsukW4FF6kTJlZOHEwp8TD4Acbn71FyFSIjhye2NW3YpK6U9Q--xB0YPiZUjfzAyFhTsX64cJDqqml39-UzNDPCKKzFhZHk0nYCdC0gXwxwP6UJLH9CSsW-3NSj7UTBjYpLhy90P3zrUwgxdKHDB-8-UFT-Ncw3f2e6Xh8pmSRfTCjuL4iKOrMatIbg5IoAknwdKrSXlJ_-Hullbg" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md rounded-full p-1">
                            <span className="material-symbols-outlined text-sm text-white">play_arrow</span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white text-xs font-bold truncate">Digital Echo</p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-[10px] text-primary">bolt</span>
                                <p className="text-slate-400 text-[9px]">{t.trending}</p>
                            </div>
                        </div>
                    </div>
                    {/* Item 5 - CTA */}
                    <div className="item-short relative rounded-2xl overflow-hidden glass-panel group active:scale-95 transition-transform">
                        <div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-center p-4 text-center cursor-pointer">
                            <span className="material-symbols-outlined text-primary text-3xl mb-2">auto_fix_high</span>
                            <p className="text-[10px] font-bold text-white leading-tight">{t.createOwn}</p>
                        </div>
                    </div>
                    {/* Item 6 */}
                    <div className="item-short relative rounded-2xl overflow-hidden glass-panel group">
                        <img alt="Featured Artist" className="absolute inset-0 w-full h-full object-cover opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA" />
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
                            <p className="text-[9px] font-medium text-slate-200">{t.featuredArtist}<br />Sarah K.</p>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Explore;
