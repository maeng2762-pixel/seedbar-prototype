import React from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateToNewProject } from '../lib/projectNavigation';

const Moodboard = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark font-display text-slate-100 overflow-x-hidden">
            <header className="sticky top-0 z-50 px-6 pt-12 pb-4 bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => navigate(-1)} className="size-10 rounded-full glass-panel flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-xl">arrow_back_ios_new</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="glass-panel px-3 py-1 rounded-full border border-white/10">
                            <p className="text-[10px] font-bold tracking-widest text-slate-400">KOR / <span className="text-primary">ENG</span></p>
                        </div>
                        <div className="size-10 rounded-full border border-primary/30 overflow-hidden">
                            <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehU8vtmOe_kzFXeXUq5uvkK1eYjGLudVbitAP71slxbnRmQdOX8fhT7SWMilUbjVCzmIOqnpXj8GYwzwSeHoMnEZ-8Y9UC0yZYiELfyUykxnXHRxrliMxdoj3QrStc2l03ySidtUu8li1GLxEizHg0pBSwcbH-p33cZsbfuI3pq5yeaHtNwDP3s1Il39Vkex_9dKJyQIdZuqAD49QFwxoKuzcmfozfCUiG5TW0Xa-vRFRfucKXP9rUHj45cyLcR5yCc3bNLMTmA" />
                        </div>
                    </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gradient mb-1">Visual Moodboard</h1>
                <p className="text-slate-400 text-xs font-medium">Generate stage assets & costume concepts</p>
            </header>

            <div className="px-6 mb-8">
                <div className="glass-panel p-4 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                        <span className="text-sm font-semibold text-slate-200">AI Concept Generator</span>
                    </div>
                    <div className="relative">
                        <textarea
                            className="w-full bg-black/40 border-none rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-primary/50 p-4 min-h-[100px] resize-none"
                            placeholder="Describe your stage lighting or costume (e.g., 'Ethereal neon fabric with liquid light trails...')">
                        </textarea>
                        <button className="absolute bottom-3 right-3 size-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform">
                            <span className="material-symbols-outlined text-white text-xl">send</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 mb-6">
                <div className="flex items-center gap-6 border-b border-white/5 pb-2">
                    <button className="relative text-sm font-bold text-white pb-2">
                        Gallery
                        <div className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-primary"></div>
                    </button>
                    <button className="text-sm font-medium text-slate-500 pb-2">History</button>
                    <button className="text-sm font-medium text-slate-500 pb-2">Saved</button>
                </div>
            </div>

            <div className="px-6 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 uppercase tracking-widest font-bold">
                    <span className="material-symbols-outlined text-sm">drag_pan</span>
                    Drag to Project
                </div>
                <button className="text-primary text-[11px] font-bold uppercase tracking-widest">Filter</button>
            </div>

            <div className="px-6 pb-32 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-3 pb-8">
                    {/* Item 1 */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-panel group">
                        <img alt="Costume Design" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0MrZpBDEK_y7jL8T4qVGj-CzqStkLhjU3oakguMIc0tTKjzm0kPOobI7ynzDjKtXV9zakujz8YeQXW2f57IyrfzscQJOF6ZAvR1C1mUN5h2nkrgJ0KZL3bWrNWc3wfD_zgiu3L_gqqzqMiT9xLwlcUmUID0o8-N_alFf2G9Z-F4b9p-LWB7kLlz3HFQZPB46vycMW7NADG2N656B08Ic5XANmtC3BSb5wcX8TfICK_fey5fQxQ-KAq6DtfxAy7Z0fygj8a2nFtg" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-bold text-slate-300">COSTUME</div>
                        <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white text-xs font-bold leading-tight">Bioluminescent Silk</p>
                            <p className="text-slate-400 text-[10px]">#Gen_203</p>
                        </div>
                    </div>
                    {/* Item 2 */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-panel group">
                        <img alt="Stage Lighting" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATo1NG19Rt5g4x2eojodNB3BkIRKGKoIRirHCzAi4iyB950KaYecpg36Z3PIsukW4FF6kTJlZOHEwp8TD4Acbn71FyFSIjhye2NW3YpK6U9Q--xB0YPiZUjfzAyFhTsX64cJDqqml39-UzNDPCKKzFhZHk0nYCdC0gXwxwP6UJLH9CSsW-3NSj7UTBjYpLhy90P3zrUwgxdKHDB-8-UFT-Ncw3f2e6Xh8pmSRfTCjuL4iKOrMatIbg5IoAknwdKrSXlJ_-Hullbg" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-bold text-slate-300">STAGE</div>
                        <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white text-xs font-bold leading-tight">Prism Distortion</p>
                            <p className="text-slate-400 text-[10px]">#Gen_188</p>
                        </div>
                    </div>
                    {/* Item 3 */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-panel group">
                        <img alt="Lighting Concept" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjNiUzAod5vPLKQymH5BkGCIOnHsELxjb7bMkqTbHFKyjflvi-bHvtTgV7TiD6WAIz_YVd3-1HEPlg6KGuk_4-BMygRWofovqZyDgzSW4T43ZKuEk5YpxPp-Fc7zelTg-Np3ASBQkvLgKS5bwVuRMACAyGyBw1lh-ysxOeIb7BDwFxQQLo4Aas0xzKfjXUpyTgQX0M7LTZGTBHI3Hh28kJYqWqt_zsFWHvQcIcsj6dVXeMAEqwIR98Rt0aDX4VGCaMo8jzcBDjYQ" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-bold text-slate-300">LIGHTING</div>
                        <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white text-xs font-bold leading-tight">Cyber Fluidity</p>
                            <p className="text-slate-400 text-[10px]">#Gen_402</p>
                        </div>
                    </div>
                    {/* Item 4 */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-panel group">
                        <img alt="Fabric Physics" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXE6qwdSbDPutfwDiB8LNKFdhyPW_6OieztmmDYe9pIt16MwqRkgh96rhamNL8WoC6xc-bfab9azEywq5MPi1KWDyZ4NMCUu2fMBkjgSY8eUSPAhVxH_PtrV6jeJBRgLqq4D1mOmWLYzG0ISE8R3zGnMJMfExiEaMQilJ8-R9QqKq6t8WN3KtoPfSXF4mlKCWtr1Xi46UqdQu7QZ_-KxTdeq-ED5MFDU4dTE8mihi5TIaxePzV1_zwUbqsoiEEFzo1V4viC4_cbA" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-bold text-slate-300">FABRIC</div>
                        <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white text-xs font-bold leading-tight">Weightless Veil</p>
                            <p className="text-slate-400 text-[10px]">#Gen_092</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 w-full z-50 pb-8 px-4 pointer-events-none">
                <div className="glass-panel rounded-full h-16 flex items-center justify-around px-2 border-white/10 pointer-events-auto">
                    <button onClick={() => navigate('/')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined text-2xl">home</span>
                    </button>
                    <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined text-2xl">explore</span>
                    </button>
                    <div className="flex-1 flex justify-center -mt-10">
                        <button onClick={() => navigateToNewProject(navigate)} className="size-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-background-dark active:scale-95 transition-transform">
                            <span className="material-symbols-outlined text-white text-3xl">add</span>
                        </button>
                    </div>
                    <button className="flex flex-1 flex-col items-center justify-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome_motion</span>
                    </button>
                    <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined text-2xl">person</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Moodboard;
